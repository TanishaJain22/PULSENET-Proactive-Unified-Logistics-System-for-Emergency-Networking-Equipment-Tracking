import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { authService } from '../../services/api/authService';
import { loginSuccess } from '../../store/authSlice';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    medicalConditions: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Missing Fields', 'Please fill in your Name and Phone Number.');
      return;
    }

    setLoading(true);
    try {
      // Backend returns { user, token } — auto-login immediately
      const response = await authService.registerPatient({
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        medicalConditions: formData.medicalConditions,
      });
      // Persist session and navigate directly to dashboard
      dispatch(loginSuccess({ user: response.user }));
    } catch (e: any) {
      const isNetworkError = e?.message === 'Network Error' || e?.code === 'ERR_NETWORK';
      Alert.alert(
        'Registration Failed',
        isNetworkError
          ? 'Cannot reach server. Make sure "node server/index.js" is running.'
          : 'Failed to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-8 mt-6 px-2">
          <Text className="text-3xl font-bold text-foreground">Health Profile</Text>
          <Text className="text-foreground/60 mt-2 text-base">Create your emergency identity card.</Text>
        </View>

        <Card className="mb-6 shadow-md border-primary/20 bg-white">
          <CardTitle>Identity Information</CardTitle>
          <CardDescription>Your name and phone number are required.</CardDescription>
          
          <Input
            label="Full Name *"
            placeholder="e.g. Rajesh Sharma"
            value={formData.name}
            onChangeText={(t) => setFormData({ ...formData, name: t })}
          />
          <Input
             label="Phone Number *"
             placeholder="+91 XXXXX XXXXX"
             keyboardType="phone-pad"
             value={formData.phone}
             onChangeText={(t) => setFormData({ ...formData, phone: t })}
           />
        </Card>

        <Card className="mb-6 shadow-md border-primary/20 bg-white">
           <CardTitle>Medical Profile (Optional)</CardTitle>
           <CardDescription>Critical data for first responders and ER doctors.</CardDescription>

           <Input
             label="Blood Group"
             placeholder="e.g. O+, AB-"
             value={formData.bloodGroup}
             onChangeText={(t) => setFormData({ ...formData, bloodGroup: t })}
           />
           <Input
             label="Existing Medical Conditions"
             placeholder="e.g. Diabetes, Asthma"
             value={formData.medicalConditions}
             onChangeText={(t) => setFormData({ ...formData, medicalConditions: t })}
             multiline
             numberOfLines={2}
           />
        </Card>

        <Button 
          title="Create Secure Profile" 
          size="lg"
          onPress={handleRegister} 
          loading={loading}
        />
        
        <Button 
          title="Cancel" 
          variant="secondary" 
          onPress={() => navigation.goBack()} 
          className="mt-4"
        />

        <View className="mt-8 mb-6 items-center">
            <Text className="text-xs text-foreground/40 text-center px-8">
              By creating a profile, you consent to sharing your medical data with authorized emergency personnel during active cases.
            </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
