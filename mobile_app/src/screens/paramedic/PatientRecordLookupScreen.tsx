import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { patientService } from '../../services/api/patientService';

type LookupNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'PatientRecordLookup'>;

interface Props {
  navigation: LookupNavigationProp;
}

export const PatientRecordLookupScreen = ({ navigation }: Props) => {
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  const handleLookup = async () => {
    if (!aadhaar || aadhaar.length < 12) {
      Alert.alert('Invalid ID', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setLoading(true);
    try {
      const data = await patientService.getPatientProfile(aadhaar);
      setPatientData(data);
    } catch (e) {
      Alert.alert('Not Found', 'No health records found for this Aadhaar number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-4 py-8">
      {!patientData ? (
        <View className="flex-1 justify-center">
            <View className="mb-8 px-2">
                <Text className="text-3xl font-bold text-foreground">Record Search</Text>
                <Text className="text-foreground/50 text-base">Retrieve medical history via Aadhaar ID.</Text>
            </View>

            <Card className="shadow-md border-primary-dark/10 bg-white p-6">
                <CardTitle className="mb-2 text-xl">Identity Verification</CardTitle>
                <CardDescription className="mb-6">Enter the 12-digit number to sync clinical data.</CardDescription>
                
                <Input
                    label="Aadhaar Number"
                    placeholder="0000 0000 0000"
                    keyboardType="numeric"
                    value={aadhaar}
                    onChangeText={setAadhaar}
                    maxLength={12}
                />
                <Button 
                    title="SEARCH SECURE RECORDS" 
                    onPress={handleLookup} 
                    loading={loading}
                    size="lg"
                    className="mt-4 shadow-md"
                />
            </Card>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-8 px-2">
              <Text className="text-3xl font-bold text-foreground">Health Profile</Text>
              <Text className="text-foreground/50 text-base">Verified Clinical Records</Text>
          </View>

          <Card className="shadow-md border-primary-dark/10 bg-white mb-6 p-6">
            <View className="flex-row justify-between items-start mb-8">
              <View className="flex-1">
                <Text className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Patient Name</Text>
                <CardTitle className="text-2xl mb-0 leading-none">{patientData.name}</CardTitle>
                <View className="flex-row items-center mt-2">
                    <Text className="text-primary-dark text-xs font-bold">✓ Aadhaar Verified</Text>
                </View>
              </View>
              <Badge label={patientData.bloodGroup} variant="critical" />
            </View>

            <View className="mb-8">
               <Text className="text-[10px] text-foreground/40 uppercase font-bold mb-3 tracking-widest">Medical Context</Text>
               <View className="bg-muted/30 p-4 rounded-2xl border border-muted">
                  <Text className="text-xs text-foreground/60 mb-1">Known Allergies</Text>
                  <View className="flex-row flex-wrap mb-4">
                    {patientData.allergies.map((allergy: string, i: number) => (
                      <View key={i} className="bg-error/10 px-3 py-1.5 rounded-lg mr-2 mb-2 border border-error/20">
                        <Text className="text-error font-bold text-xs">{allergy.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>

                  <Text className="text-xs text-foreground/60 mb-1">Pre-existing Conditions</Text>
                  <View className="flex-row flex-wrap">
                    {(patientData.chronicConditions || patientData.medicalConditions || []).map((condition: string, i: number) => (
                      <View key={i} className="bg-primary/10 px-3 py-1.5 rounded-lg mr-2 mb-2 border border-primary/30">
                        <Text className="text-primary-dark font-bold text-xs">{condition.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
               </View>
            </View>

            <Button 
                title="BACK TO DASHBOARD" 
                onPress={() => navigation.navigate('ParamedicDashboard')} 
            />
          </Card>
          
          <Button 
            title="SEARCH ANOTHER PATIENT" 
            variant="secondary"
            onPress={() => { setPatientData(null); setAadhaar(''); }} 
            className="mb-8"
          />
        </ScrollView>
      )}
    </View>
  );
};
