import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientDashboard } from '../screens/patient/PatientDashboard';
import { EmergencyTrackingScreen } from '../screens/patient/EmergencyTrackingScreen';
import { AmbulanceTrackingScreen } from '../screens/patient/AmbulanceTrackingScreen';
import { HospitalInfoScreen } from '../screens/patient/HospitalInfoScreen';
import { TreatmentTimelineScreen } from '../screens/patient/TreatmentTimelineScreen';
import { MedicalRecordScreen } from '../screens/patient/MedicalRecordScreen';
import { EmergencyContactsScreen } from '../screens/patient/EmergencyContactsScreen';
import { HealthSchemesScreen } from '../screens/patient/HealthSchemesScreen';
import { TransferInfoScreen } from '../screens/patient/TransferInfoScreen';
import { FeedbackScreen } from '../screens/patient/FeedbackScreen';

export type PatientStackParamList = {
  PatientDashboard: undefined;
  EmergencyTracking: { caseId: string };
  AmbulanceTracking: undefined;
  HospitalInfo: { hospitalId: string };
  TreatmentTimeline: { caseId: string };
  MedicalRecord: undefined;
  EmergencyContacts: undefined;
  HealthSchemes: undefined;
  TransferInfo: { caseId: string };
  Feedback: { caseId: string };
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
      <Stack.Screen name="PatientDashboard" component={PatientDashboard} options={{ title: 'My Health' }} />
      <Stack.Screen name="EmergencyTracking" component={EmergencyTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AmbulanceTracking" component={AmbulanceTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HospitalInfo" component={HospitalInfoScreen} options={{ title: 'Assigned Hospital' }} />
      <Stack.Screen name="TreatmentTimeline" component={TreatmentTimelineScreen} options={{ title: 'Treatment Progress' }} />
      <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen} options={{ title: 'Medical Records' }} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Emergency Contacts' }} />
      <Stack.Screen name="HealthSchemes" component={HealthSchemesScreen} options={{ title: 'Government Schemes' }} />
      <Stack.Screen name="TransferInfo" component={TransferInfoScreen} options={{ title: 'Transfer Details' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Submit Feedback' }} />
    </Stack.Navigator>
  );
};
