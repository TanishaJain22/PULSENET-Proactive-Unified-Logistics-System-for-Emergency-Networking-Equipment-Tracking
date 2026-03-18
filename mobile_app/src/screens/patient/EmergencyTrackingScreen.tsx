import React, { useEffect, useState } from 'react';
import { View, Text, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LeafletMap } from '../../components/maps/LeafletMap';
import { PatientStackParamList } from '../../navigation/PatientNavigator';
import { Button } from '../../components/ui/Button';
import { socketService } from '../../services/socket';
import { mapStateService, MapState } from '../../services/mapStateService';
import { osrmService } from '../../services/api/osrmService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type EmergencyTrackingNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'EmergencyTracking'>;
type EmergencyTrackingRouteProp = RouteProp<PatientStackParamList, 'EmergencyTracking'>;

interface Props {
  navigation: EmergencyTrackingNavigationProp;
  route: EmergencyTrackingRouteProp;
}

export const EmergencyTrackingScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;
  const { activeCase } = useSelector((state: RootState) => state.emergency);
  const [mapState, setMapState] = useState<MapState>(mapStateService.getState());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    // Subscribe to global map state
    const unsubscribe = mapStateService.subscribe((state) => {
      setMapState(state);
    });

    socketService.connect();
    socketService.joinCase(caseId);
    // Also join dispatch room if this is a dispatch-based flow
    if (caseId.startsWith('DISP-')) {
      socketService.joinDispatch(caseId);
    }

    socketService.onConnect(() => setConnectionStatus('connected'));
    socketService.onDisconnect(() => setConnectionStatus('disconnected'));
    socketService.onReconnect(() => setConnectionStatus('connected'));
    socketService.onConnectError(() => setConnectionStatus('reconnecting'));

    // Initial state setup from active case data
    if (activeCase) {
      const hospitalLoc = activeCase.assignedHospitalId ? { latitude: 22.7733, longitude: 75.9137 } : null;
      // Seed patient location: prefer case location, then real GPS, then fallback
      const seedPatientLocation = async () => {
        let patientLoc = activeCase.location || null;
        if (!patientLoc) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            patientLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          }
        }
        mapStateService.updateState({
          patientLocation: patientLoc || { latitude: 22.7533, longitude: 75.8937 },
          hospitalLocation: activeCase.assignedHospital?.location || hospitalLoc,
        });
      };
      seedPatientLocation();
    }

    // Listen for hospital assignment updates
    socketService.onHospitalAssigned(async ({ hospital }) => {
      const hospitalLoc = hospital.location;
      const currentLoc = mapStateService.getState().ambulanceLocation;
      
      const routeData = await osrmService.fetchRoute(
        currentLoc.latitude,
        currentLoc.longitude,
        hospitalLoc.latitude,
        hospitalLoc.longitude
      );

      mapStateService.updateState({ 
        hospitalLocation: hospitalLoc,
        currentRoute: routeData.coordinates,
        eta: Math.ceil(routeData.duration / 60)
      });
    });

    // Listen for real-time location updates from driver
    socketService.onLocationUpdate((data) => {
      mapStateService.updateState({
        ambulanceLocation: {
          latitude: data.latitude,
          longitude: data.longitude
        }
      });
    });

    // Listen for standardized dispatch state transitions
    socketService.onDispatchStateUpdate((data) => {
      console.log('[Socket] Dispatch State Update:', data.state);
      mapStateService.updateState({ dispatchState: data.state as any });
      
      // If state changes to hospital leg, ensure route is updated
      if (data.state === 'EN_ROUTE_TO_HOSPITAL' || data.state === 'ARRIVED_AT_PATIENT') {
        const state = mapStateService.getState();
        if (state.ambulanceLocation && state.hospitalLocation) {
          osrmService.fetchRoute(
            state.ambulanceLocation.latitude,
            state.ambulanceLocation.longitude,
            state.hospitalLocation.latitude,
            state.hospitalLocation.longitude
          ).then(routeData => {
            mapStateService.updateState({
              currentRoute: routeData.coordinates,
              eta: Math.ceil(routeData.duration / 60)
            });
          });
        }
      }
    });

    // Keep status update for timeline/messages only — also map status → dispatch state
    socketService.onStatusUpdate((data) => {
      const statusToDispatchState: Record<string, string> = {
        PICKED_UP: 'EN_ROUTE_TO_PATIENT',
        EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
        ARRIVED: 'ARRIVED_AT_HOSPITAL',
        HANDOFF_COMPLETE: 'ARRIVED_AT_HOSPITAL',
      };
      const mapped = statusToDispatchState[data.status];
      if (mapped) mapStateService.updateState({ dispatchState: mapped as any });
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [caseId]);

  const getStatusText = () => {
    switch (mapState.dispatchState) {
      case 'EN_ROUTE_TO_HOSPITAL': return 'Heading to Hospital';
      case 'ARRIVED_AT_PATIENT': return 'At Patient Location';
      case 'EN_ROUTE_TO_PATIENT': return 'En Route to You';
      case 'ARRIVED_AT_HOSPITAL': return 'At Hospital';
      default: return 'Dispatched';
    }
  };

  return (
    <View className="flex-1 bg-foreground">
      {/* MAP AREA */}
      <View className="flex-1">
        <LeafletMap
          mode="tracking"
          ambulanceLocation={mapState.ambulanceLocation}
          hospitalLocation={mapState.hospitalLocation || undefined}
          routeCoordinates={mapState.currentRoute || undefined}
          routeColor={mapState.dispatchState === 'EN_ROUTE_TO_HOSPITAL' ? '#16a34a' : '#2563eb'}
        />
        
        {/* CONNECTION STATUS PILL */}
        {connectionStatus !== 'connected' && (
          <View className="absolute top-12 self-center bg-destructive/90 px-4 py-2 rounded-full flex-row items-center border border-destructive-foreground/20">
             <View className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
             <Text className="text-white font-bold text-xs">
               {connectionStatus === 'reconnecting' ? 'Reconnecting to Dispatch...' : 'Connection Lost'}
             </Text>
          </View>
        )}
      </View>

      {/* STATUS OVERLAY */}
      <View className="absolute bottom-0 w-full bg-background rounded-t-[40px] shadow-2xl px-8 pt-10 pb-12 border-t border-muted">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest mb-1">Ambulance Status</Text>
            <Text className="text-3xl font-black text-foreground">
              {getStatusText()}
            </Text>
          </View>
          <View className="bg-primary/20 px-4 py-2 rounded-2xl border border-primary/40">
             <Text className="text-primary-dark font-black text-xs">PRIORITY 1</Text>
          </View>
        </View>

        <View className="flex-row mb-8 bg-muted rounded-3xl p-6 border border-muted">
          <View className="flex-1 items-center border-r border-foreground/5">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest">Distance</Text>
            <Text className="text-2xl font-black text-foreground mt-1">
              {mapState.eta ? (mapState.eta * 0.4).toFixed(1) : '2.4'} <Text className="text-sm font-bold text-foreground/20">km</Text>
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest">ETA</Text>
            <Text className="text-2xl font-black text-primary-dark mt-1">
              {mapState.eta || '6'} <Text className="text-sm font-bold text-primary-dark/40">min</Text>
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <Button 
            title="CALL DISPATCH" 
            variant="secondary" 
            onPress={() => Linking.openURL('tel:112')} 
            size="lg"
          />
          <Button 
            title="VIEW HOSPITAL INFO" 
            onPress={() => navigation.navigate('HospitalInfo', { hospitalId: activeCase?.assignedHospital?.id || 'hosp01' })} 
            size="lg"
          />
        </View>
        
        <View className="mt-8 items-center">
            <Text className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">Emergency Unit: AMB-092 • Case: {caseId}</Text>
        </View>
      </View>
    </View>
  );
};
