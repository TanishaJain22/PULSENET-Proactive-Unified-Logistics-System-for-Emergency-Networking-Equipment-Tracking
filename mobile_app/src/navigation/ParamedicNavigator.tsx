import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParamedicDashboard } from '../screens/paramedic/ParamedicDashboard';
import { CreateEmergencyScreen } from '../screens/paramedic/CreateEmergencyScreen';
import { KnownPatientAtSceneScreen } from '../screens/paramedic/KnownPatientAtSceneScreen';
import { TemporaryPatientIDScreen } from '../screens/paramedic/TemporaryPatientIDScreen';
import { PatientVitalsScreen } from '../screens/paramedic/PatientVitalsScreen';
import { SeverityResultScreen } from '../screens/paramedic/SeverityResultScreen';
import { HospitalAssignmentScreen } from '../screens/paramedic/HospitalAssignmentScreen';
import { PatientRecordLookupScreen } from '../screens/paramedic/PatientRecordLookupScreen';
import { StatusUpdateScreen } from '../screens/paramedic/StatusUpdateScreen';

export type ParamedicStackParamList = {
  ParamedicDashboard: undefined;
  CreateEmergency: undefined;
  KnownPatientAtScene: undefined;
  TemporaryPatientID: { caseId: string; temporaryPatientId: string };
  PatientVitals: { caseId: string };
  SeverityResult: { caseId: string; severity: string; score: number };
  HospitalAssignment: { caseId: string; severity?: string; hospitalId?: string };
  PatientRecordLookup: undefined;
  StatusUpdate: { caseId: string };
};

const Stack = createNativeStackNavigator<ParamedicStackParamList>();

export const ParamedicNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
      <Stack.Screen name="ParamedicDashboard" component={ParamedicDashboard} options={{ title: 'Paramedic Dashboard' }} />
      <Stack.Screen name="CreateEmergency" component={CreateEmergencyScreen} options={{ title: 'New Emergency Case (Unknown Patient)' }} />
      <Stack.Screen name="KnownPatientAtScene" component={KnownPatientAtSceneScreen} options={{ title: 'Patient at Scene' }} />
      <Stack.Screen name="TemporaryPatientID" component={TemporaryPatientIDScreen} options={{ title: 'Case Created' }} />
      <Stack.Screen name="PatientVitals" component={PatientVitalsScreen} options={{ title: 'Record Vitals' }} />
      <Stack.Screen name="SeverityResult" component={SeverityResultScreen} options={{ title: 'Triage Result' }} />
      <Stack.Screen name="HospitalAssignment" component={HospitalAssignmentScreen} options={{ title: 'Destination Hospital' }} />
      <Stack.Screen name="PatientRecordLookup" component={PatientRecordLookupScreen} options={{ title: 'Lookup Patient' }} />
      <Stack.Screen name="StatusUpdate" component={StatusUpdateScreen} options={{ title: 'Update Status' }} />
    </Stack.Navigator>
  );
};
