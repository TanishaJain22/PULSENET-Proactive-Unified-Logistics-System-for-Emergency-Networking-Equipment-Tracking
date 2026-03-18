import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { setActiveDispatch, clearActiveDispatch, setPendingDispatches } from '../../store/dispatchSlice';
import { RootState } from '../../store';
import { authService } from '../../services/api/authService';
import { dispatchService } from '../../services/api/dispatchService';
import { socketService } from '../../services/socket';
import { DispatchRequest } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

type Props = { navigation: NativeStackNavigationProp<DriverStackParamList, 'DriverDashboard'> };

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'critical', HIGH: 'warning', MEDIUM: 'muted', LOW: 'muted',
};

export const DriverDashboard = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeDispatch, pendingDispatches } = useSelector((state: RootState) => state.dispatch);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const activeDispatchRef = useRef(activeDispatch);
  useEffect(() => { activeDispatchRef.current = activeDispatch; }, [activeDispatch]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const list = await dispatchService.getPendingDispatches();
      dispatch(setPendingDispatches(list));
    } catch {} finally { setLoading(false); }
  };

  // Re-fetch on every focus — critical for single-device demo role switching
  useFocusEffect(
    React.useCallback(() => {
      if (!activeDispatch) fetchPending();
    }, [activeDispatch])
  );

  useEffect(() => {
    fetchPending();
    socketService.connect();
    socketService.joinDriversRoom();

    // Join active dispatch room if we have one
    if (activeDispatch?.dispatchId) {
      socketService.joinDispatch(activeDispatch.dispatchId);
    }

    // New dispatch arrives via socket — refresh silently
    const unsubDispatch = socketService.onDispatchCreated(() => {
      dispatchService.getPendingDispatches().then((list) => {
        dispatch(setPendingDispatches(list));
      }).catch(() => {});
    });

    // State update on active dispatch — use ref to avoid stale closure
    const unsubState = socketService.onDispatchStateUpdate((data: any) => {
      const current = activeDispatchRef.current;
      if (current && data.dispatchId === current.dispatchId) {
        dispatch(setActiveDispatch({ ...current, status: data.state }));
      }
    });

    // Poll every 6s silently
    const poll = setInterval(() => {
      if (!activeDispatchRef.current) {
        dispatchService.getPendingDispatches().then((list) => {
          dispatch(setPendingDispatches(list));
        }).catch(() => {});
      }
    }, 6000);

    return () => {
      if (unsubDispatch) unsubDispatch();
      if (unsubState) unsubState();
      clearInterval(poll);
      socketService.disconnect();
    };
  }, []);

  const handleAccept = async (item: DispatchRequest) => {
    setAccepting(item.dispatchId);
    try {
      await dispatchService.acceptDispatch(item.dispatchId, user?.id || 'driver-001');
      await dispatchService.updateDispatchStatus(item.dispatchId, 'AMBULANCE_EN_ROUTE');
      dispatch(setActiveDispatch({ ...item, status: 'AMBULANCE_EN_ROUTE', assignedDriverId: user?.id || 'driver-001' }));
      dispatch(setPendingDispatches(pendingDispatches.filter(d => d.dispatchId !== item.dispatchId)));
    } catch (e) {
      Alert.alert('Error', 'Failed to accept dispatch.');
    } finally { setAccepting(null); }
  };

  const isHospitalPhase = activeDispatch?.status === 'ARRIVED_AT_SCENE' ||
    activeDispatch?.status === 'TEMP_CASE_CREATED' ||
    activeDispatch?.status === 'VITALS_RECORDED' ||
    activeDispatch?.status === 'HOSPITAL_ASSIGNED' ||
    activeDispatch?.status === 'EN_ROUTE_TO_HOSPITAL' ||
    activeDispatch?.status === 'ARRIVED_AT_HOSPITAL';

  return (
    <ScrollView className="flex-1 bg-background px-4 py-8">
      <View className="flex-row justify-between items-center mb-8 px-2">
        <View>
          <Text className="text-3xl font-bold text-foreground">Duty On</Text>
          <Text className="text-foreground/50 text-sm font-medium">Ambulance: AMB-092</Text>
        </View>
        <Badge label="Online" variant="success" />
      </View>

      {/* ── ACTIVE DISPATCH ─────────────────────────────────────────────── */}
      {activeDispatch ? (
        <>
          <View className="mb-4 flex-row items-center px-2">
            <View className="w-2 h-2 rounded-full bg-error mr-2" />
            <Text className="text-foreground/60 uppercase tracking-widest text-[10px] font-bold">
              {isHospitalPhase ? 'Phase 2 — Transport to Hospital' : 'Phase 1 — En Route to Patient'}
            </Text>
          </View>

          <Card className="mb-8 shadow-md border-error/20 bg-white">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Active Dispatch</Text>
                <CardTitle className="text-2xl mb-0 leading-tight">{activeDispatch.patientName}</CardTitle>
                <Text className="text-xs text-foreground/40 mt-1">{activeDispatch.dispatchId}</Text>
              </View>
              <Badge label={activeDispatch.priority} variant={PRIORITY_COLOR[activeDispatch.priority] as any || 'muted'} />
            </View>

            <View className="bg-muted/30 p-4 rounded-xl mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-foreground/60">Status</Text>
                <Text className="text-xs font-bold text-foreground">{activeDispatch.status.replace(/_/g, ' ')}</Text>
              </View>
              {activeDispatch.location && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-foreground/60">Patient coords</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {activeDispatch.location.latitude.toFixed(4)}, {activeDispatch.location.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>

            <View className="gap-4">
              {!isHospitalPhase ? (
                <>
                  <Button title="NAVIGATE TO PATIENT" size="lg"
                    onPress={() => navigation.navigate('Navigation', { caseId: activeDispatch.dispatchId, phase: 'pickup' })} />
                  <Button title="ARRIVED AT SCENE" variant="secondary" size="lg"
                    onPress={async () => {
                      await dispatchService.updateDispatchStatus(activeDispatch.dispatchId, 'ARRIVED_AT_SCENE');
                      dispatch(setActiveDispatch({ ...activeDispatch, status: 'ARRIVED_AT_SCENE' }));
                    }} />
                </>
              ) : (
                <>
                  <Button title="NAVIGATE TO HOSPITAL" size="lg"
                    onPress={() => navigation.navigate('Navigation', { caseId: activeDispatch.dispatchId, phase: 'hospital' })} />
                  <Button title="CONFIRM ARRIVAL" variant="secondary" size="lg"
                    onPress={() => navigation.navigate('ArrivalConfirmation', { 
                      caseId: activeDispatch.dispatchId,
                      dispatchId: activeDispatch.dispatchId,
                    })} />
                </>
              )}
            </View>
          </Card>
        </>
      ) : (
        /* ── PENDING DISPATCHES LIST ──────────────────────────────────── */
        <>
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-foreground/60 uppercase tracking-widest text-[10px] font-bold">
              Pending Dispatches ({pendingDispatches.length})
            </Text>
            <Button title="REFRESH" variant="outline" onPress={fetchPending} />
          </View>

          {loading ? (
            <View className="items-center py-16">
              <Text className="text-foreground/40">Checking for dispatches...</Text>
            </View>
          ) : pendingDispatches.length === 0 ? (
            <View className="items-center justify-center py-16 px-6">
              <View className="bg-muted rounded-full w-24 h-24 items-center justify-center mb-8">
                <Text className="text-5xl">🚑</Text>
              </View>
              <Text className="text-xl font-bold text-foreground text-center mb-2">Stand-by</Text>
              <Text className="text-base text-foreground/40 text-center leading-relaxed">No pending dispatches. Waiting for emergency requests.</Text>
            </View>
          ) : (
            pendingDispatches.map((item) => (
              <Card key={item.dispatchId} className="mb-4 bg-white shadow-sm border-muted">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] uppercase font-bold text-foreground/40 mb-1">{item.source.replace(/_/g, ' ')}</Text>
                    <CardTitle className="text-lg mb-0">{item.patientName}</CardTitle>
                    <Text className="text-xs text-foreground/40 mt-1">{item.dispatchId}</Text>
                    <Text className="text-xs font-bold mt-1" style={{ color: item.patientIdentity === 'KNOWN' ? '#16a34a' : '#d97706' }}>
                      {item.patientIdentity === 'KNOWN' ? '✅ Known Patient' : '❓ Unknown Patient'}
                    </Text>
                  </View>
                  <Badge label={item.priority} variant={PRIORITY_COLOR[item.priority] as any || 'muted'} />
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-xs text-foreground/60">
                    {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                  </Text>
                  <Text className="text-xs text-foreground/40">{new Date(item.createdAt).toLocaleTimeString()}</Text>
                </View>
                <Button
                  title={accepting === item.dispatchId ? 'ACCEPTING...' : 'ACCEPT DISPATCH'}
                  size="lg"
                  onPress={() => handleAccept(item)}
                  disabled={accepting !== null}
                />
              </Card>
            ))
          )}
        </>
      )}

      <Button title="Logout from Duty" variant="outline"
        onPress={async () => { await authService.logout(); dispatch(logout()); dispatch(clearActiveDispatch()); }}
        className="mt-4 mb-12" />
    </ScrollView>
  );
};
