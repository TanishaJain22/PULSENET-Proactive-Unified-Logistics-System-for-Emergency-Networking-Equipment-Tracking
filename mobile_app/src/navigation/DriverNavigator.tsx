import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverDashboard } from '../screens/driver/DriverDashboard';
import { NavigationScreen } from '../screens/driver/NavigationScreen';
import { ArrivalConfirmationScreen } from '../screens/driver/ArrivalConfirmationScreen';

export type DriverStackParamList = {
  DriverDashboard: undefined;
  Navigation: { caseId: string; phase: 'pickup' | 'hospital' };
  ArrivalConfirmation: { caseId: string; dispatchId?: string };
};

const Stack = createNativeStackNavigator<DriverStackParamList>();

export const DriverNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
      <Stack.Screen name="DriverDashboard" component={DriverDashboard} options={{ title: 'Ambulance Dashboard' }} />
      <Stack.Screen name="Navigation" component={NavigationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ArrivalConfirmation" component={ArrivalConfirmationScreen} options={{ title: 'Confirm Arrival' }} />
    </Stack.Navigator>
  );
};
