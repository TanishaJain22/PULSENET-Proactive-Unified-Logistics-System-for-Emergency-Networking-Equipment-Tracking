import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { PatientStackParamList } from '../../navigation/PatientNavigator';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ListItem } from '../../components/ui/ListItem';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';
import { dispatchService } from '../../services/api/dispatchService';
import { setActiveDispatch, clearActiveDispatch } from '../../store/dispatchSlice';
import { authService } from '../../services/api/authService';
import { socketService } from '../../services/socket';

type PatientDashboardNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'PatientDashboard'>;

interface Props {
  navigation: PatientDashboardNavigationProp;
}

export const PatientDashboard = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentCaseId } = useSelector((state: RootState) => state.emergency);
  const { currentDispatchId, activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const [sosLoading, setSosLoading] = useState(false);
  const activeDispatchRef = useRef(activeDispatch);
  useEffect(() => { activeDispatchRef.current = activeDispatch; }, [activeDispatch]);

  // Socket: keep patient dashboard in sync with dispatch state changes
  useEffect(() => {
    if (!currentDispatchId) return;
    socketService.connect();
    socketService.joinDispatch(currentDispatchId);

    const unsubState = socketService.onDispatchStateUpdate((data: any) => {
      const current = activeDispatchRef.current;
      if (current && data.dispatchId === current.dispatchId) {
        dispatch(setActiveDispatch({ ...current, status: data.state }));
      }
    });

    return () => { if (unsubState) unsubState(); };
  }, [currentDispatchId]);

  const handlePanicButton = () => {
    Alert.alert(
      "Who needs the ambulance?",
      "Select who requires emergency assistance.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Myself",
          onPress: () => handleSOS('KNOWN'),
        },
        {
          text: "Someone else / Unknown",
          style: "destructive",
          onPress: () => handleSOS('UNKNOWN'),
        },
      ]
    );
  };

  const handleSOS = async (patientIdentity: 'KNOWN' | 'UNKNOWN') => {
    setSosLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { latitude: 22.7196, longitude: 75.8577 };
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }

      // NEW: create a dispatch request (not an emergency case directly)
      const dispatchResult = await dispatchService.createDispatch({
        location: coords,
        patientName: user?.name || 'Unknown Patient',
        patientId: user?.id,
        patientIdentity,
        requesterPatientId: user?.id,
        source: 'PATIENT_APP',
      });

      // Store dispatch in Redux so tracking screen can use it
      dispatch(setActiveDispatch({
        dispatchId: dispatchResult.dispatchId,
        location: coords,
        source: 'PATIENT_APP',
        priority: dispatchResult.priority as any,
        status: dispatchResult.status as any,
        assignedDriverId: null,
        patientName: user?.name || 'Unknown Patient',
        patientIdentity,
        requesterPatientId: user?.id || null,
        timeline: [],
        createdAt: dispatchResult.createdAt,
      }));

      navigation.navigate('AmbulanceTracking');
    } catch (e) {
      Alert.alert('Error', 'Failed to create dispatch request. Please ensure the backend server is running.');
      console.error('SOS Error:', e);
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header Profile - Premium Gradient Look */}
      <View className="bg-primary-dark pt-14 pb-12 px-6 rounded-b-[40px] shadow-2xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-foreground/60 text-xs font-bold uppercase tracking-widest">Medical Identity</Text>
            <Text className="text-foreground text-3xl font-black mt-1">Hello, {(user?.name || 'User').split(' ')[0]}</Text>
            <View className="bg-foreground/10 self-start px-3 py-1 rounded-full mt-3 border border-foreground/20">
               <Text className="text-foreground text-[10px] font-bold">ID: {user?.id || '—'}</Text>
            </View>
          </View>
          <View className="w-16 h-16 rounded-full bg-primary border-4 border-foreground/10 items-center justify-center">
             <Text className="text-2xl font-bold text-foreground">{(user?.name || 'U')[0]}</Text>
          </View>
        </View>
      </View>

      <View className="px-6 -mt-8 pb-12">
        {/* MASSIVE SOS BUTTON */}
        <Card className="mb-10 shadow-2xl border-error/30 bg-white p-8">
           <View className="items-center">
              <View className="w-20 h-20 bg-error/10 rounded-full items-center justify-center mb-6">
                 <Text className="text-4xl text-error">🆘</Text>
              </View>
              <Text className="text-xl font-black text-foreground text-center mb-2">Life-Threatening Emergency?</Text>
              <Text className="text-sm text-foreground/40 text-center mb-8 px-4 leading-relaxed">Press the button below to dispatch an ambulance with AI-prioritized routing.</Text>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handlePanicButton}
                className="w-full h-20 bg-error rounded-3xl items-center justify-center shadow-lg shadow-error/40 border-b-4 border-error-dark"
              >
                  <Text className="text-white text-xl font-black tracking-widest">SOS - CALL AMBULANCE</Text>
              </TouchableOpacity>
           </View>
        </Card>

        <Text className="text-foreground font-black text-2xl mb-6 px-1">My Health Hub</Text>
        
        {/* Active Dispatch Card — shown when a dispatch is in progress */}
        {currentDispatchId && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AmbulanceTracking')}
            className="bg-primary rounded-[28px] p-5 mb-6 shadow-lg border border-primary-dark/20"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">🚑</Text>
                <Text className="text-foreground font-black text-base">Ambulance Dispatched</Text>
              </View>
              <View className="bg-foreground/20 px-2 py-0.5 rounded-full">
                <Text className="text-foreground text-[10px] font-bold uppercase">Live</Text>
              </View>
            </View>
            <Text className="text-foreground/70 text-xs mb-4">Tap to track your ambulance in real time.</Text>
            <View className="bg-foreground/10 rounded-2xl py-3 items-center border border-foreground/20">
              <Text className="text-foreground font-black text-sm tracking-widest uppercase">Track Ambulance →</Text>
            </View>
          </TouchableOpacity>
        )}
        
        <View className="bg-white rounded-[32px] shadow-md border border-muted overflow-hidden mb-10 p-2">
          <ListItem 
            title="Medical Records" 
            subtitle="View history, reports & test results" 
            icon={<View className="bg-primary/20 p-2 rounded-xl"><Text className="text-xl">📁</Text></View>}
            onPress={() => navigation.navigate('MedicalRecord')} 
          />
          <ListItem 
            title="Emergency Contacts" 
            subtitle="Guardians & first responder alerts" 
            icon={<View className="bg-orange-100 p-2 rounded-xl"><Text className="text-xl">📞</Text></View>}
            onPress={() => navigation.navigate('EmergencyContacts')} 
          />
          <ListItem 
            title="Government Schemes" 
            subtitle="Check benefit & PMJAY eligibility" 
            icon={<View className="bg-blue-100 p-2 rounded-xl"><Text className="text-xl">🏛️</Text></View>}
            onPress={() => navigation.navigate('HealthSchemes')} 
          />
          {(currentDispatchId || currentCaseId) && (
            <ListItem 
              title="Treatment Timeline" 
              subtitle="Track your active care progress" 
              icon={<View className="bg-green-100 p-2 rounded-xl"><Text className="text-xl">⏳</Text></View>}
              onPress={() => navigation.navigate('TreatmentTimeline', { caseId: currentDispatchId || currentCaseId! })} 
            />
          )}
        </View>

        <Button title="Logout from Profile" variant="outline" onPress={async () => { await authService.logout(); dispatch(logout()); }} className="mb-12" />
        
        <View className="items-center mb-6">
            <Text className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">Healthcare Platform • v1.0.4-β</Text>
        </View>
      </View>
    </ScrollView>
  );
};
