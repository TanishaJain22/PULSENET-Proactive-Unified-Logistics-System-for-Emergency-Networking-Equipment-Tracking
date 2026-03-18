import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { emergencyService } from '../../services/api/emergencyService';
import { setEmergencyCase } from '../../store/emergencySlice';
import { dispatchService } from '../../services/api/dispatchService';
import { setActiveDispatch } from '../../store/dispatchSlice';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type CreateEmergencyNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'CreateEmergency'>;

interface Props {
  navigation: CreateEmergencyNavigationProp;
}

const COMMON_TYPES = ['Cardiac', 'Trauma', 'Respiratory', 'Stroke', 'Accident'];

export const CreateEmergencyScreen = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const { activeDispatch } = useSelector((state: any) => state.dispatch);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patientName: '',
    estimatedAge: '',
    gender: '',
    emergencyType: '',
    symptoms: '',
  });

  const handleCreate = async () => {
    if (!formData.emergencyType || !formData.symptoms) {
      Alert.alert('Required Fields', 'Please enter at least the Emergency Type and basic Symptoms.');
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { latitude: 22.7196, longitude: 75.8577 };
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }

      // Use create-temp if there's an active dispatch (new flow)
      // Fall back to legacy create if no dispatch (standalone paramedic intake)
      let newCase: any;
      if (activeDispatch) {
        const response = await emergencyService.createTempCase({
          dispatchId: activeDispatch.dispatchId,
          patientName: formData.patientName,
          symptoms: [formData.emergencyType, formData.symptoms].filter(Boolean),
          location: coords,
        });
        newCase = {
          caseId: response.tempCaseId,
          temporaryPatientId: response.tempCaseId,
          severity: 'NOT_ASSESSED',
          status: response.status,
          dispatchId: response.dispatchId,
          createdAt: response.createdAt,
        };
      } else {
        // Legacy standalone flow (no dispatch)
        newCase = await emergencyService.createEmergency({ ...formData, location: coords });
      }

      dispatch(setEmergencyCase(newCase));
      navigation.navigate('TemporaryPatientID', {
        caseId: newCase.caseId,
        temporaryPatientId: newCase.temporaryPatientId,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to create emergency case.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Unknown Patient</Text>
          <Text className="text-gray-500">Create a temporary case ID for an unidentified patient.</Text>
        </View>

        <Card className="mb-6 shadow-sm border-t-4 border-primary">
           <CardTitle>Patient Info</CardTitle>
           <CardDescription>Leave name blank if identity is unknown at scene.</CardDescription>
           
           <Input
             label="Patient Name"
             placeholder="John Doe or Unknown"
             value={formData.patientName}
             onChangeText={(t) => setFormData({ ...formData, patientName: t })}
           />
           
           <View className="flex-row justify-between">
             <View className="flex-1 mr-2">
               <Input
                 label="Est. Age"
                 placeholder="e.g. 45"
                 keyboardType="numeric"
                 value={formData.estimatedAge}
                 onChangeText={(t) => setFormData({ ...formData, estimatedAge: t })}
               />
             </View>
             <View className="flex-1 ml-2">
               <Input
                 label="Gender"
                 placeholder="M / F / O"
                 value={formData.gender}
                 onChangeText={(t) => setFormData({ ...formData, gender: t })}
               />
             </View>
           </View>
        </Card>

        <Card className="mb-6 shadow-sm border-t-4 border-accent">
           <CardTitle>Medical Details</CardTitle>
           
           <Text className="text-xs font-bold text-gray-500 uppercase mb-3">Quick Select Type</Text>
           <View className="flex-row flex-wrap mb-4">
             {COMMON_TYPES.map(type => (
               <TouchableOpacity 
                 key={type} 
                 onPress={() => setFormData({...formData, emergencyType: type})}
                 className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                   formData.emergencyType === type ? 'bg-accent border-accent' : 'bg-white border-gray-200'
                 }`}
               >
                 <Text className={`font-medium ${formData.emergencyType === type ? 'text-white' : 'text-gray-600'}`}>
                   {type}
                 </Text>
               </TouchableOpacity>
             ))}
           </View>

           <Input
             label="Emergency Type *"
             placeholder="e.g. Cardiac Arrest"
             value={formData.emergencyType}
             onChangeText={(t) => setFormData({ ...formData, emergencyType: t })}
           />
           <Input
             label="Symptoms / Observations *"
             placeholder="Describe patient condition..."
             value={formData.symptoms}
             onChangeText={(t) => setFormData({ ...formData, symptoms: t })}
             multiline
             numberOfLines={3}
             className="h-24 pt-3"
           />
        </Card>

        <Button 
          title="Dispatch & Create Case" 
          onPress={handleCreate} 
          loading={loading}
          size="lg"
          className="shadow-lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
