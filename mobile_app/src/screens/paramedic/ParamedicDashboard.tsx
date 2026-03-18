import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';
import { authService } from '../../services/api/authService';
import { dispatchService } from '../../services/api/dispatchService';
import { setActiveDispatch } from '../../store/dispatchSlice';
import { socketService } from '../../services/socket';
import { useFocusEffect } from '@react-navigation/native';

type ParamedicDashboardNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'ParamedicDashboard'>;

interface Props {
  navigation: ParamedicDashboardNavigationProp;
}

export const ParamedicDashboard = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const { activeCase } = useSelector((state: RootState) => state.emergency);
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const activeDispatchRef = useRef(activeDispatch);
  useEffect(() => { activeDispatchRef.current = activeDispatch; }, [activeDispatch]);

  const fetchDispatch = useCallback(async () => {
    try {
      const d = await dispatchService.getActiveDispatch();
      if (d) dispatch(setActiveDispatch(d));
    } catch {}
  }, [dispatch]);

  // Re-fetch every time screen comes into focus (handles role-switch on single device)
  useFocusEffect(
    React.useCallback(() => {
      fetchDispatch();
    }, [fetchDispatch])
  );

  // Socket: live dispatch state updates
  useEffect(() => {
    socketService.connect();

    // Join dispatch room as soon as we have a dispatchId
    if (activeDispatch?.dispatchId) {
      socketService.joinDispatch(activeDispatch.dispatchId);
    }

    const unsubState = socketService.onDispatchStateUpdate((data: any) => {
      const current = activeDispatchRef.current;
      // Accept update if dispatchId matches OR if we have no dispatch yet (first update)
      if (data.dispatchId && (!current || data.dispatchId === current.dispatchId)) {
        if (current) {
          dispatch(setActiveDispatch({ ...current, status: data.state }));
        } else {
          // No dispatch in Redux yet — re-fetch from server
          fetchDispatch();
        }
      }
    });

    // Also listen for new dispatches being created
    const unsubCreated = socketService.onDispatchCreated(() => {
      fetchDispatch();
    });

    return () => {
      if (unsubState) unsubState();
      if (unsubCreated) unsubCreated();
    };
  }, [activeDispatch?.dispatchId]);

  // Determine what to show:
  // Priority: activeDispatch (dispatch flow) > activeCase (legacy standalone case)
  const hasDispatch = !!activeDispatch;
  const hasLegacyCase = !hasDispatch && !!activeCase;

  return (
    <ScrollView className="flex-1 bg-background px-4 py-8">
      <View className="flex-row justify-between items-center mb-8 px-2">
        <View>
          <Text className="text-3xl font-bold text-foreground">Duty Queue</Text>
          <Text className="text-foreground/50 text-sm font-medium">Unit: PARAM-042</Text>
        </View>
        <Badge label="Active" variant="success" />
      </View>

      {/* ── DISPATCH FLOW (primary path) ─────────────────────────────── */}
      {hasDispatch ? (
        <View className="items-center justify-center py-8 px-2">
          {/* Dispatch info card */}
          <View className="w-full bg-primary/10 p-5 rounded-2xl mb-6 border border-primary/20">
            <Text className="text-[10px] uppercase font-bold text-primary-dark mb-1">Active Dispatch</Text>
            <Text className="text-xl font-bold text-foreground">{activeDispatch!.patientName}</Text>
            <Text className="text-xs text-foreground/50 mt-1">
              {activeDispatch!.dispatchId} • {activeDispatch!.status.replace(/_/g, ' ')}
            </Text>
            <View className="mt-3 flex-row items-center">
              <Text className="text-[10px] uppercase font-bold text-foreground/40">
                Patient Identity:{' '}
              </Text>
              <Text className="text-[10px] font-bold" style={{ color: activeDispatch!.patientIdentity === 'KNOWN' ? '#16a34a' : '#d97706' }}>
                {activeDispatch!.patientIdentity === 'KNOWN' ? '✅ Known (App User)' : '❓ Unknown Patient'}
              </Text>
            </View>
          </View>

          {/* Action based on status */}
          {activeDispatch!.status === 'WAITING_FOR_DRIVER' ? (
            <View className="w-full bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <Text className="text-amber-700 font-bold text-center">⏳ Waiting for driver to accept...</Text>
              <Text className="text-amber-500 text-xs text-center mt-1">Actions available once driver is assigned.</Text>
            </View>
          ) : activeDispatch!.patientIdentity === 'KNOWN' ? (
            <Button
              title="VIEW PATIENT RECORDS (AT SCENE)"
              size="lg"
              onPress={() => navigation.navigate('KnownPatientAtScene')}
              className="w-full"
            />
          ) : (
            <Button
              title="CREATE TEMP CASE (AT SCENE)"
              size="lg"
              onPress={() => navigation.navigate('CreateEmergency')}
              className="w-full"
            />
          )}
        </View>

      ) : hasLegacyCase ? (
        /* ── LEGACY STANDALONE CASE ──────────────────────────────────── */
        <Card className="mb-8 shadow-md border-primary-dark/20 bg-white">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Active Case</Text>
              <CardTitle className="text-2xl mb-0 leading-none">{activeCase!.temporaryPatientId}</CardTitle>
            </View>
            <Badge label={activeCase!.status} variant="warning" />
          </View>
          <View className="bg-muted p-4 rounded-xl mb-8">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold">Patient Name</Text>
            <Text className="text-lg font-bold text-foreground mt-1">{activeCase!.patientName || 'Emergency Record'}</Text>
            <Text className="text-xs text-foreground/60 mt-1">Triage: {activeCase!.severity.toLowerCase()}</Text>
          </View>
          <View className="gap-3">
            <Button title="UPDATE VITALS" onPress={() => navigation.navigate('PatientVitals', { caseId: activeCase!.caseId })} />
            <Button title="QUICK STATUS UPDATE" variant="secondary" onPress={() => navigation.navigate('StatusUpdate', { caseId: activeCase!.caseId })} />
            <Button title="LOOKUP HEALTH RECORDS" variant="outline" onPress={() => navigation.navigate('PatientRecordLookup')} />
          </View>
        </Card>

      ) : (
        /* ── STAND-BY (no dispatch, no case) ────────────────────────── */
        <View className="items-center justify-center py-16 px-6">
          <View className="bg-muted rounded-full w-24 h-24 items-center justify-center mb-8 shadow-sm">
            <Text className="text-5xl">🚑</Text>
          </View>
          <Text className="text-xl font-bold text-foreground text-center mb-2">Stand-by Phase</Text>
          <Text className="text-base text-foreground/40 text-center mb-10 leading-relaxed">
            No active dispatches. Waiting for emergency requests.
          </Text>
          <Button
            title="CREATE NEW EMERGENCY"
            size="lg"
            onPress={() => navigation.navigate('CreateEmergency')}
            className="w-full"
          />
        </View>
      )}

      <Button
        title="Logout from Service"
        variant="outline"
        onPress={async () => { await authService.logout(); dispatch(logout()); }}
        className="mt-8 mb-12"
      />
    </ScrollView>
  );
};
