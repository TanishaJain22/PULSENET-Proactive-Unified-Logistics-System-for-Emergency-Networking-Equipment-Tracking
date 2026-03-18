import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LeafletMap } from '../../components/maps/LeafletMap';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { Button } from '../../components/ui/Button';
import { ambulanceService } from '../../services/api/ambulanceService';
import { socketService } from '../../services/socket';
import { osrmService } from '../../services/api/osrmService';
import { emergencyService } from '../../services/api/emergencyService';
import { dispatchService } from '../../services/api/dispatchService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setEmergencyCase } from '../../store/emergencySlice';
import { setActiveDispatch } from '../../store/dispatchSlice';

type NavigationScreenNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'Navigation'>;
type NavigationScreenRouteProp = RouteProp<DriverStackParamList, 'Navigation'>;

interface Props {
  navigation: NavigationScreenNavigationProp;
  route: NavigationScreenRouteProp;
}

interface LatLng { latitude: number; longitude: number; }

export const NavigationScreen = ({ navigation, route }: Props) => {
  const { caseId, phase } = route.params;
  const dispatch = useDispatch();
  const { activeCase } = useSelector((state: RootState) => state.emergency);
  const { activeDispatch, assignedHospital } = useSelector((state: RootState) => state.dispatch);

  const [myLocation, setMyLocation] = useState<LatLng | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | undefined>();
  const [eta, setEta] = useState<number | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  // Destination: pickup → patient location, hospital → assigned hospital (from Redux or activeCase)
  const hospitalDest = assignedHospital?.location || activeCase?.assignedHospital?.location || null;
  const hospitalName = assignedHospital?.name || activeCase?.assignedHospital?.name || 'Hospital';

  const destination: LatLng | null = phase === 'pickup'
    ? (activeDispatch?.location || activeCase?.location || null)
    : hospitalDest;

  const destinationLabel = phase === 'pickup'
    ? (activeDispatch?.patientName || activeCase?.patientName || 'Patient Location')
    : hospitalName;

  useEffect(() => {
    let mounted = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for navigation.');
        return;
      }

      // Get initial position
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (!mounted) return;
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setMyLocation(loc);

      // Fetch initial route
      if (destination) {
        try {
          const r = await osrmService.fetchRoute(loc.latitude, loc.longitude, destination.latitude, destination.longitude);
          if (mounted) { setRouteCoords(r.coordinates as [number,number][]); setEta(Math.ceil(r.duration / 60)); }
        } catch {}
      }

      // Watch position
      locationSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 4000 },
        async (pos) => {
          if (!mounted) return;
          const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setMyLocation(newLoc);
          // Send to backend
          socketService.emitLocationUpdate(caseId, newLoc.latitude, newLoc.longitude);
          ambulanceService.sendLocationUpdate(caseId, newLoc.latitude, newLoc.longitude).catch(() => {});
          // Refresh route every update
          if (destination) {
            try {
              const r = await osrmService.fetchRoute(newLoc.latitude, newLoc.longitude, destination.latitude, destination.longitude);
              if (mounted) { setRouteCoords(r.coordinates as [number,number][]); setEta(Math.ceil(r.duration / 60)); }
            } catch {}
          }
        }
      );
    };

    socketService.connect();
    socketService.joinCase(caseId);
    startTracking();

    return () => {
      mounted = false;
      locationSub.current?.remove();
      socketService.disconnect();
    };
  }, [caseId, phase]);

  const openGoogleMaps = () => {
    if (!myLocation || !destination) {
      Alert.alert('Location unavailable', 'Waiting for GPS fix...');
      return;
    }
    const origin = `${myLocation.latitude},${myLocation.longitude}`;
    const dest = `${destination.latitude},${destination.longitude}`;
    const label = encodeURIComponent(destinationLabel);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&destination_place_id=${label}&travelmode=driving`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#171717' }}>
      {/* MAP */}
      <View style={{ flex: 1 }}>
        <LeafletMap
          mode={phase === 'pickup' ? 'dispatch' : 'tracking'}
          ambulanceLocation={myLocation || { latitude: 22.7196, longitude: 75.8577 }}
          patientLocation={phase === 'pickup' ? destination || undefined : undefined}
          hospitalLocation={phase === 'hospital' ? destination || undefined : undefined}
          routeCoordinates={routeCoords}
          routeColor={phase === 'pickup' ? '#2563eb' : '#16a34a'}
        />

        {/* TOP BAR */}
        <SafeAreaView style={{ position: 'absolute', top: 0, width: '100%', paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ backgroundColor: '#171717', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, backgroundColor: '#72e3ad', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 24 }}>{phase === 'pickup' ? '👤' : '🏥'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#72e3ad', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {phase === 'pickup' ? 'Phase 1 — Pickup Patient' : 'Phase 2 — Transport to Hospital'}
              </Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{destinationLabel}</Text>
              {myLocation && (
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                  GPS: {myLocation.latitude.toFixed(5)}, {myLocation.longitude.toFixed(5)}
                </Text>
              )}
            </View>
          </View>
        </SafeAreaView>

        {/* RECENTER */}
        <TouchableOpacity
          style={{ position: 'absolute', right: 16, bottom: 280, backgroundColor: 'white', width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', elevation: 4 }}
          onPress={() => {/* map auto-centers on ambulance */}}
        >
          <Text style={{ fontSize: 22 }}>🎯</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM PANEL */}
      <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
          <View>
            <Text style={{ color: '#999', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Distance</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#171717' }}>
              {eta ? (eta * 0.4).toFixed(1) : '—'} <Text style={{ fontSize: 14, color: '#ccc' }}>km</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#999', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>ETA</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#16a34a' }}>
              {eta || '—'} <Text style={{ fontSize: 14, color: '#86efac' }}>min</Text>
            </Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button
            title={`OPEN IN GOOGLE MAPS → ${destinationLabel.toUpperCase()}`}
            size="lg"
            onPress={openGoogleMaps}
          />
          {phase === 'pickup' ? (
            <Button
              title="PATIENT PICKED UP — NEXT PHASE"
              variant="secondary"
              size="lg"
              onPress={async () => {
                try {
                  if (activeDispatch) {
                    await dispatchService.updateDispatchStatus(activeDispatch.dispatchId, 'ARRIVED_AT_SCENE');
                    dispatch(setActiveDispatch({ ...activeDispatch, status: 'ARRIVED_AT_SCENE' }));
                  } else if (activeCase) {
                    await emergencyService.updateEmergencyStatus(caseId, 'PICKED_UP');
                    dispatch(setEmergencyCase({ ...activeCase, status: 'PICKED_UP' }));
                  }
                } catch {}
                navigation.navigate('Navigation', { caseId, phase: 'hospital' });
              }}
            />
          ) : (
            <Button
              title="CONFIRM HOSPITAL ARRIVAL"
              variant="secondary"
              size="lg"
              onPress={() => navigation.navigate('ArrivalConfirmation', { caseId, dispatchId: activeDispatch?.dispatchId || caseId })}
            />
          )}
        </View>
      </View>
    </View>
  );
};
