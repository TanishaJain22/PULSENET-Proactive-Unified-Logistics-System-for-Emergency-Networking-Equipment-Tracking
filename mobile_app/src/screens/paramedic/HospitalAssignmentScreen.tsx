import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { hospitalService } from '../../services/api/hospitalService';
import { socketService } from '../../services/socket';
import { Hospital, MedicalCapability } from '../../types';
import { dispatchService } from '../../services/api/dispatchService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setAssignedHospital } from '../../store/dispatchSlice';

type HospitalAssignmentNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'HospitalAssignment'>;
type HospitalAssignmentRouteProp = RouteProp<ParamedicStackParamList, 'HospitalAssignment'>;

interface Props {
  navigation: HospitalAssignmentNavigationProp;
  route: HospitalAssignmentRouteProp;
}

export const HospitalAssignmentScreen = ({ navigation, route }: Props) => {
  const { caseId, severity } = route.params;
  const reduxDispatch = useDispatch();
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MedicalCapability | 'ALL'>('ALL');

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const capabilityFilter = filter === 'ALL' ? undefined : filter;
        const results = await hospitalService.searchHospitals({ capability: capabilityFilter });
        setHospitals(results);
      } catch (e) {
        Alert.alert('Error', 'Failed to load hospitals.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, [filter]);

  const handleSelectHospital = async (hospital: Hospital) => {
    setSelectedHospitalId(hospital.id);
    try {
      await hospitalService.assignHospital(caseId, hospital.id);
      // Store in Redux so driver's NavigationScreen can use it for hospital phase
      reduxDispatch(setAssignedHospital(hospital));
      socketService.emitHospitalAssigned(caseId, hospital);
      // Advance dispatch timeline
      if (activeDispatch) {
        await dispatchService.updateDispatchStatus(activeDispatch.dispatchId, 'HOSPITAL_ASSIGNED').catch(() => {});
      }
      Alert.alert(
        "Admission Requested",
        `${hospital.name} has been notified. The rescue route has been synchronized with the driver.`,
        [{ text: "OK", onPress: () => navigation.navigate('ParamedicDashboard') }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to assign hospital.');
    }
  };

  const getSmartMatch = (hosp: Hospital) => {
    if (severity === 'CRITICAL' && hosp.capabilities.includes('LEVEL_1_TRAUMA')) return true;
    if (severity === 'HIGH' && hosp.capabilities.includes('CARDIAC_CENTER')) return true;
    return false;
  };

  if (loading && hospitals.length === 0) {
    return <LoadingIndicator message="Finding best matches for triage score..." />;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="mb-8 mt-4">
           <Text className="text-3xl font-black text-foreground">Hospital Discovery</Text>
           <Text className="text-foreground/50 text-base">Matching Case: {caseId}</Text>
        </View>

        {/* Capability Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
          {['ALL', 'LEVEL_1_TRAUMA', 'CARDIAC_CENTER', 'BURN_UNIT', 'GENERAL_EMERGENCY'].map((cap) => (
            <TouchableOpacity 
              key={cap}
              onPress={() => setFilter(cap as any)}
              className={`px-6 py-3 rounded-2xl mr-3 border ${filter === cap ? 'bg-primary border-primary' : 'bg-white border-muted'}`}
            >
              <Text className={`font-bold text-xs ${filter === cap ? 'text-foreground' : 'text-foreground/40'}`}>
                {cap.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="mb-6">
           <Text className="text-foreground/40 font-bold uppercase text-[10px] tracking-widest px-2 mb-4">Recommended for {severity} patient</Text>
           
           {hospitals.map((hosp) => {
             const isSmartMatch = getSmartMatch(hosp);
             return (
               <TouchableOpacity 
                 key={hosp.id} 
                 onPress={() => handleSelectHospital(hosp)}
                 activeOpacity={0.9}
               >
                 <Card className={`mb-6 p-6 shadow-md border-2 ${isSmartMatch ? 'border-primary shadow-primary/20 bg-primary/5' : 'border-muted bg-white'}`}>
                   {isSmartMatch && (
                     <View className="bg-primary self-start px-3 py-1 rounded-full mb-4">
                        <Text className="text-[10px] font-black uppercase tracking-widest">Smart Match recommendation</Text>
                     </View>
                   )}
                   
                   <View className="flex-row justify-between mb-2">
                     <View className="flex-1 pr-4">
                        <CardTitle className="text-2xl mb-1">{hosp.name}</CardTitle>
                        <CardDescription className="text-sm">{hosp.address}</CardDescription>
                     </View>
                     <View className="items-end">
                        <Text className="text-2xl font-black text-foreground">6 <Text className="text-xs font-normal opacity-40">min</Text></Text>
                        <Text className="text-[10px] text-foreground/40 font-bold">2.4 km</Text>
                     </View>
                   </View>

                   <View className="h-[1px] bg-muted w-full my-4" />

                   <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                         <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
                         <Text className="text-xs font-bold text-foreground/60">{hosp.currentOccupancy}% Occupancy</Text>
                      </View>
                      <View className="flex-row">
                        {hosp.capabilities.slice(0, 2).map((c, i) => (
                          <View key={i} className="bg-muted px-2 py-1 rounded-lg ml-2">
                             <Text className="text-[8px] font-bold text-foreground/40 uppercase">{c.split('_')[0]}</Text>
                          </View>
                        ))}
                      </View>
                   </View>
                 </Card>
               </TouchableOpacity>
             );
           })}
        </View>

        <Button 
          title="BACK TO DASHBOARD" 
          variant="outline"
          onPress={() => navigation.navigate('ParamedicDashboard')} 
        />
      </ScrollView>
    </View>
  );
};
