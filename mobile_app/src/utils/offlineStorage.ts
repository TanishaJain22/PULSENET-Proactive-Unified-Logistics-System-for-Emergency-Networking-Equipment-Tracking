import AsyncStorage from '@react-native-async-storage/async-storage';
import { emergencyService } from '../services/api/emergencyService';

export interface PendingSync {
  id: string; // Idempotency key
  type: 'VITAL' | 'STATUS' | 'CASE';
  payload: any;
  timestamp: number;
}

export const offlineStorage = {
  keys: {
    ACTIVE_EMERGENCY: 'active_emergency',
    USER_PROFILE: 'user_profile',
    TEMPORARY_PATIENT_DATA: 'temp_patient_data',
    CACHED_RECORDS: 'cached_medical_records',
    PENDING_SYNC: 'pending_sync_queue',
  },

  async save(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to offline storage', e);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from offline storage', e);
    }
  },

  /**
   * Adds a payload to the sync queue for later retry if a real-time request fails.
   */
  async queueForSync(type: PendingSync['type'], payload: any): Promise<void> {
    const queue = await this.get<PendingSync[]>(this.keys.PENDING_SYNC) || [];
    const newEntry: PendingSync = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now()
    };
    queue.push(newEntry);
    await this.save(this.keys.PENDING_SYNC, queue);
  },

  /**
   * Scans and retries all pending payloads. To be called on app startup or network reconnection.
   */
  async runSyncRecovery(): Promise<void> {
    const queue = await this.get<PendingSync[]>(this.keys.PENDING_SYNC) || [];
    if (queue.length === 0) return;

    console.log(`[Offline Storage] Starting sync recovery for ${queue.length} items...`);
    
    const remaining: PendingSync[] = [];

    for (const item of queue) {
      try {
        let success = false;
        if (item.type === 'VITAL') {
          await emergencyService.submitVitals(item.payload.caseId, { ...item.payload.vitals, idKey: item.id });
          success = true;
        } else if (item.type === 'STATUS') {
          await emergencyService.updateEmergencyStatus(item.payload.caseId, item.payload.status);
          success = true;
        } else if (item.type === 'CASE') {
          await emergencyService.createEmergency({ ...item.payload, idKey: item.id });
          success = true;
        }

        if (!success) remaining.push(item);
      } catch (error) {
        console.error(`[Sync Recovery] Failed to sync ${item.id}:`, error);
        remaining.push(item);
      }
    }

    await this.save(this.keys.PENDING_SYNC, remaining);
    console.log(`[Offline Storage] Sync recovery finished. Remaining: ${remaining.length}`);
  }
};
