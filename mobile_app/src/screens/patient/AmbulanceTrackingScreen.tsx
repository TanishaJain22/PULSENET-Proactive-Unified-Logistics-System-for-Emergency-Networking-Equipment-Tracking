import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { LeafletMap } from '../../components/maps/LeafletMap';
import { PatientStackParamList } from '../../navigation/PatientNavigator';
import { Button } from '../../components/ui/Button';
import { socketService } from '../../services/socket';
import { mapStateService, MapState } from '../../services/mapStateService';
import { osrmService } from '../../services/api/osrmService';
import { dispatchService } from '../../services/api/dispatchService';
import { RootState } from '../../store';

import { DispatchStatus } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<PatientStackParamList, 'AmbulanceTracking'>;
};

// Maps backend dispatch status → human-readable label + phase
const STATUS_CONFIG: Record<string, { label: string; phase: 1 | 2; color: string }> = {
  WAITING_FOR_DRIVER:   { label: 'Waiting for Driver',      phase: 1, color: '#6b7280' },
  DRIVER_ASSIGNED:      { label: 'Driver Assigned',          phase: 1, color: '#2563eb' },
  AMBULANCE_EN_ROUTE:   { label: 'Ambulance En Route',       phase: 1, color: '#d97706' },
  ARRIVED_AT_SCENE:     { label: 'Arrived at Your Location', phase: 1, color: '#16a34a' },
  TEMP_CASE_CREATED:    { label: 'Paramedic Assessing',      phase: 1, color: '#7c3aed' },
  VITALS_RECORDED:      { label: 'Vitals Recorded',          phase: 2, color: '#7c3aed' },
  HOSPITAL_ASSIGNED:    { label: 'Hospital Assigned',        phase: 2, color: '#0891b2' },
  EN_ROUTE_TO_HOSPITAL: { label: 'En Route to Hospital',     phase: 2, color: '#d97706' },
  ARRIVED_AT_HOSPITAL:  { label: 'Arrived at Hospital',      phase: 2, color: '#16a34a' },
  HANDOFF_COMPLETE:     { label: 'Handoff Complete',         phase: 2, color: '#16a34a' },
};

// Ordered steps for the progress timeline
const TIMELINE_STEPS = [
  'DRIVER_ASSIGNED',
  'AMBULANCE_EN_ROUTE',
  'ARRIVED_AT_SCENE',
  'HOSPITAL_ASSIGNED',
  'EN_ROUTE_TO_HOSPITAL',
  'ARRIVED_AT_HOSPITAL',
];

export const AmbulanceTrackingScreen = ({ navigation }: Props) => {
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const { activeCase } = useSelector((state: RootState) => state.emergency);

  const [mapState, setMapState] = useState<MapState>(mapStateService.getState());
  const [dispatchStatus, setDispatchStatus] = useState<DispatchStatus>(
    (activeDispatch?.status as DispatchStatus) || 'WAITING_FOR_DRIVER'
  );
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [hospitalName, setHospitalName] = useState<string | null>(null);

  const dispatchId = activeDispatch?.dispatchId;

  // Haversine distance in km
  const haversineKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
    const R = 6371;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };

  const refreshRoute = useCallback(
    async (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) => {
      try {
        const routeData = await osrmService.fetchRoute(from.latitude, from.longitude, to.latitude, to.longitude);
        const etaMin = routeData.duration > 0 ? Math.ceil(routeData.duration / 60) : Math.ceil((haversineKm(from, to) / 36) * 60);
        mapStateService.updateState({ currentRoute: routeData.coordinates, eta: etaMin });
      } catch {
        const etaMin = Math.ceil((haversineKm(from, to) / 36) * 60);
        mapStateService.updateState({ eta: etaMin });
      }
    },
    []
  );

  useEffect(() => {
    if (!dispatchId) return;

    // Subscribe to map state
    const unsubscribe = mapStateService.subscribe(setMapState);

    // Socket setup
    socketService.connect();
    socketService.joinDispatch(dispatchId);
    if (activeCase?.caseId) socketService.joinCase(activeCase.caseId);

    socketService.onConnect(() => setConnectionStatus('connected'));
    socketService.onDisconnect(() => setConnectionStatus('disconnected'));
    socketService.onReconnect(() => setConnectionStatus('connected'));
    socketService.onConnectError(() => setConnectionStatus('reconnecting'));

    // Seed patient location
    const seedPatient = async () => {
      let patientLoc = activeDispatch?.location || null;
      if (!patientLoc) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          patientLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      }
      mapStateService.updateState({
        patientLocation: patientLoc || { latitude: 22.7533, longitude: 75.8937 },
      });
    };
    seedPatient();

    // Ambulance location updates
    const offLocation = socketService.onLocationUpdate((data) => {
      const newLoc = { latitude: data.latitude, longitude: data.longitude };
      mapStateService.updateState({ ambulanceLocation: newLoc });

      // Recalculate route to current destination
      const state = mapStateService.getState();
      const dest = state.hospitalLocation || state.patientLocation;
      if (dest) refreshRoute(newLoc, dest);
    });

    // Dispatch state transitions
    const offDispatch = socketService.onDispatchStateUpdate((data) => {
      setDispatchStatus(data.state as DispatchStatus);
      const stateMap: Record<string, string> = {
        AMBULANCE_EN_ROUTE:   'EN_ROUTE_TO_PATIENT',
        ARRIVED_AT_SCENE:     'ARRIVED_AT_PATIENT',
        EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
        ARRIVED_AT_HOSPITAL:  'ARRIVED_AT_HOSPITAL',
        HANDOFF_COMPLETE:     'ARRIVED_AT_HOSPITAL',
      };
      const mapped = stateMap[data.state];
      if (mapped) mapStateService.updateState({ dispatchState: mapped as any });

      // If heading to hospital, recalculate route
      if (data.state === 'EN_ROUTE_TO_HOSPITAL') {
        const state = mapStateService.getState();
        if (state.ambulanceLocation && state.hospitalLocation) {
          refreshRoute(state.ambulanceLocation, state.hospitalLocation);
        }
      }
    });

    // Status updates (from paramedic/driver actions)
    const offStatus = socketService.onStatusUpdate((data) => {
      const statusMap: Record<string, string> = {
        EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
        ARRIVED_AT_HOSPITAL:  'ARRIVED_AT_HOSPITAL',
        HANDOFF_COMPLETE:     'HANDOFF_COMPLETE',
      };
      if (statusMap[data.status]) setDispatchStatus(statusMap[data.status] as DispatchStatus);
    });

    // Hospital assigned
    const offHospital = socketService.onHospitalAssigned(async ({ hospital }) => {
      setHospitalName(hospital.name);
      const state = mapStateService.getState();
      mapStateService.updateState({ hospitalLocation: hospital.location });
      await refreshRoute(state.ambulanceLocation, hospital.location);
    });

    // Poll dispatch status every 10s as fallback
    const poll = setInterval(async () => {
      const d = await dispatchService.getDispatch(dispatchId);
      if (d?.status) setDispatchStatus(d.status);
    }, 10000);

    return () => {
      unsubscribe();
      offLocation();
      offDispatch();
      offStatus();
      offHospital();
      clearInterval(poll);
      socketService.disconnect();
    };
  }, [dispatchId]);

  // No active dispatch — empty state
  if (!dispatchId) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-5xl mb-4">🚑</Text>
        <Text className="text-xl font-bold text-foreground text-center mb-2">No Active Dispatch</Text>
        <Text className="text-foreground/50 text-center mb-8">Press SOS on the dashboard to request an ambulance.</Text>
        <Button title="Go Back" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[dispatchStatus] || STATUS_CONFIG['WAITING_FOR_DRIVER'];
  const isPhase2 = statusCfg.phase === 2;
  const distanceKm = mapState.eta ? (mapState.eta * 0.6).toFixed(1) : '—';
  const hospitalLoc = mapState.hospitalLocation;

  const openGoogleMaps = () => {
    const dest = isPhase2 && hospitalLoc
      ? `${hospitalLoc.latitude},${hospitalLoc.longitude}`
      : mapState.patientLocation
        ? `${mapState.patientLocation.latitude},${mapState.patientLocation.longitude}`
        : null;
    if (dest) Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
  };

  return (
    <View className="flex-1 bg-foreground">
      {/* MAP */}
      <View style={{ flex: 1 }}>
        <LeafletMap
          mode="tracking"
          ambulanceLocation={mapState.ambulanceLocation}
          patientLocation={mapState.patientLocation || undefined}
          hospitalLocation={mapState.hospitalLocation || undefined}
          routeCoordinates={mapState.currentRoute || undefined}
          routeColor={isPhase2 ? '#16a34a' : '#2563eb'}
        />

        {/* Connection pill */}
        {connectionStatus !== 'connected' && (
          <View className="absolute top-12 self-center bg-red-600/90 px-4 py-2 rounded-full flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-white mr-2" />
            <Text className="text-white font-bold text-xs">
              {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Connection Lost'}
            </Text>
          </View>
        )}

        {/* Phase badge */}
        <View className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <Text className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            {isPhase2 ? '🏥 Phase 2 — To Hospital' : '📍 Phase 1 — To Patient'}
          </Text>
        </View>
      </View>

      {/* BOTTOM PANEL */}
      <View className="bg-background rounded-t-[32px] shadow-2xl px-6 pt-6 pb-10 border-t border-muted">
        {/* Status */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Dispatch Status</Text>
            <Text className="text-xl font-black text-foreground">{statusCfg.label}</Text>
            {hospitalName && (
              <Text className="text-xs text-foreground/50 mt-0.5">Hospital: {hospitalName}</Text>
            )}
          </View>
          <View className="w-3 h-3 rounded-full" style={{ backgroundColor: statusCfg.color }} />
        </View>

        {/* ETA + Distance */}
        <View className="flex-row bg-muted rounded-2xl p-4 mb-4 border border-muted">
          <View className="flex-1 items-center border-r border-foreground/10">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest">Distance</Text>
            <Text className="text-2xl font-black text-foreground mt-1">
              {distanceKm} <Text className="text-sm font-bold text-foreground/30">km</Text>
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest">ETA</Text>
            <Text className="text-2xl font-black text-primary-dark mt-1">
              {mapState.eta ?? '—'} <Text className="text-sm font-bold text-primary-dark/40">min</Text>
            </Text>
          </View>
        </View>

        {/* Progress steps */}
        <View className="flex-row justify-between mb-5 px-1">
          {TIMELINE_STEPS.map((step, i) => {
            const stepIdx = TIMELINE_STEPS.indexOf(dispatchStatus);
            const done = i <= stepIdx;
            return (
              <View key={step} className="items-center flex-1">
                <View className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-primary' : 'bg-gray-200'}`} />
                {i < TIMELINE_STEPS.length - 1 && (
                  <View className={`absolute top-1.5 left-1/2 w-full h-0.5 ${done ? 'bg-primary' : 'bg-gray-200'}`} style={{ zIndex: -1 }} />
                )}
              </View>
            );
          })}
        </View>

        {/* Action buttons */}
        <View className="gap-3">
          {hospitalLoc && (
            <Button
              title="VIEW HOSPITAL DETAILS"
              onPress={() => navigation.navigate('HospitalInfo', { hospitalId: activeCase?.assignedHospital?.id || 'hosp01' })}
              size="lg"
            />
          )}
          <Button
            title="OPEN IN GOOGLE MAPS"
            variant="secondary"
            onPress={openGoogleMaps}
            size="lg"
          />
          <Button
            title="CALL DISPATCH (112)"
            variant="outline"
            onPress={() => Linking.openURL('tel:112')}
            size="lg"
          />
        </View>

        <Text className="text-center text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-5">
          Dispatch: {dispatchId}
        </Text>
      </View>
    </View>
  );
};
