import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PatientStackParamList } from '../../navigation/PatientNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { hospitalService } from '../../services/api/hospitalService';
import { Hospital } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type HospitalInfoNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'HospitalInfo'>;
type HospitalInfoRouteProp = RouteProp<PatientStackParamList, 'HospitalInfo'>;

interface Props {
  navigation: HospitalInfoNavigationProp;
  route: HospitalInfoRouteProp;
}

export const HospitalInfoScreen = ({ navigation, route }: Props) => {
  const { hospitalId } = route.params;
  const { currentCaseId } = useSelector((state: RootState) => state.emergency);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  // Use hospitalId from route params to find the hospital
  useEffect(() => {
    const fetchHospital = async () => {
       try {
         const hospitals = await hospitalService.searchHospitals({});
         const found = hospitals.find((h: Hospital) => h.id === hospitalId);
         if (found) {
           setHospital(found);
         }
       } catch (e) {
         console.error('Failed to fetch hospital info:', e);
       } finally {
         setLoading(false);
       }
    };
    fetchHospital();
  }, [hospitalId]);

  if (loading || !hospital) return <LoadingIndicator />;

  return (
    <ScrollView className="flex-1 bg-background px-6 py-10" showsVerticalScrollIndicator={false}>
      <View className="mb-10 px-2">
         <Text className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-1">Authenticated Facility</Text>
         <Text className="text-3xl font-black text-foreground">Hospital Profile</Text>
      </View>

      <Card className="mb-8 shadow-md border-primary-dark/10 bg-white p-8 rounded-[40px]">
         <View className="mb-8 items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-6 border border-primary/20">
               <Text className="text-3xl">🏥</Text>
            </View>
            <CardTitle className="text-2xl text-center mb-2 leading-tight">{hospital.name}</CardTitle>
            <CardDescription className="text-center text-foreground/50 text-sm leading-relaxed px-4">{hospital.address}</CardDescription>
         </View>
         
         <View className="bg-muted/30 p-6 rounded-3xl mb-10 border border-muted">
           <Text className="text-[10px] text-foreground/40 uppercase font-bold mb-3 tracking-widest text-center">Preparation Protocol</Text>
           <Text className="font-black text-foreground text-center text-lg mb-2">{hospital.emergencyPreparednessStatus}</Text>
           <Text className="text-foreground/50 text-center text-xs leading-relaxed px-4">
              A specialized trauma unit and an ICU bed have been reserved. The surgical team is on high alert.
           </Text>
         </View>

         {currentCaseId && (
           <Button 
              title="TRACK RECEPTION TIMELINE" 
              onPress={() => navigation.navigate('TreatmentTimeline', { caseId: currentCaseId })} 
              size="lg"
              className="shadow-xl"
            />
         )}
      </Card>
      
      <View className="mb-12 items-center">
        <TouchableOpacity
          onPress={() => {
            if (!hospital?.location) return;
            const { latitude, longitude } = hospital.location;
            const label = encodeURIComponent(hospital.name);
            const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}&travelmode=driving`;
            Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
          }}
          className="bg-primary px-8 py-4 rounded-2xl flex-row items-center"
        >
          <Text className="text-2xl mr-3">🗺️</Text>
          <Text className="text-foreground font-black uppercase tracking-widest text-xs">View Map & Directions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
