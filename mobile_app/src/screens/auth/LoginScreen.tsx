import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { authService } from '../../services/api/authService';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RootState } from '../../store';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!username || !password) {
      dispatch(loginFailure('Please enter both username and password.'));
      return;
    }

    try {
      dispatch(loginStart());
      const response = await authService.login(username, password);
      dispatch(loginSuccess({ user: response.user }));
    } catch (err: any) {
      const isNetworkError =
        err?.code === 'ECONNREFUSED' ||
        err?.code === 'ERR_NETWORK' ||
        err?.message === 'Network Error' ||
        err?.message?.includes('Network Error');
      dispatch(loginFailure(
        isNetworkError
          ? 'Cannot reach server. Make sure "node server/index.js" is running.'
          : 'Login failed. Please try again.'
      ));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 justify-center p-4"
    >
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">+</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">Healthcare Sync</Text>
        <Text className="text-gray-500 text-center mt-2">Emergency Resource Coordination</Text>
      </View>

      <Card className="shadow-lg">
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        
        {error ? <Text className="text-red-500 mb-4 text-sm font-medium">{error}</Text> : null}

        <Input
          label="Username / ID"
          placeholder="e.g. paramedic_01 or driver_02"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button 
          title="Login" 
          onPress={handleLogin} 
          loading={isLoading} 
          className="mt-2"
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Are you a patient? </Text>
          <Text 
            className="text-primary font-bold"
            onPress={() => navigation.navigate('Register')}
          >
            Register Here
          </Text>
        </View>
      </Card>
      
      <View className="mt-8 px-4">
        <Text className="text-xs text-gray-400 text-center font-bold mb-1">Demo Credentials (password: anything)</Text>
        <Text className="text-xs text-gray-400 text-center">Patient → username: <Text className="font-bold text-gray-600">patient</Text></Text>
        <Text className="text-xs text-gray-400 text-center">Paramedic → username: <Text className="font-bold text-gray-600">paramedic</Text></Text>
        <Text className="text-xs text-gray-400 text-center">Driver → username: <Text className="font-bold text-gray-600">driver</Text></Text>
      </View>
    </KeyboardAvoidingView>
  );
};
