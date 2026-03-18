import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../store';
import { loginSuccess } from '../store/authSlice';
import { AuthStack } from './AuthStack';
import { DriverNavigator } from './DriverNavigator';
import { ParamedicNavigator } from './ParamedicNavigator';
import { PatientNavigator } from './PatientNavigator';

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, role, isLoading } = useSelector((state: RootState) => state.auth);
  const [isRestoringToken, setIsRestoringToken] = React.useState(true);

  // Attempt to restore session from AsyncStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userJson = await AsyncStorage.getItem('auth_user');
        if (token && userJson) {
          const user = JSON.parse(userJson);
          dispatch(loginSuccess({ user }));
        }
      } catch (e) {
        console.error('Session restore failed', e);
      }
      setIsRestoringToken(false);
    };

    restoreSession();
  }, [dispatch]);

  if (isRestoringToken || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#72e3ad" />
      </View>
    );
  }

  const renderRoleNavigator = () => {
    switch (role) {
      case 'DRIVER':
        return <DriverNavigator />;
      case 'PARAMEDIC':
        return <ParamedicNavigator />;
      case 'PATIENT':
        return <PatientNavigator />;
      default:
        return <AuthStack />; // Failsafe
    }
  };

  return (
    <NavigationContainer>
      {isAuthenticated && role ? renderRoleNavigator() : <AuthStack />}
    </NavigationContainer>
  );
}
