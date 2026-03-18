import { apiClient } from '../apiClient';
import { User } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { user, token } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    return { user, token };
  },

  registerPatient: async (patientData: any): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/patient/register', patientData);
    const { user, token } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    return { user, token };
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
  },
};
