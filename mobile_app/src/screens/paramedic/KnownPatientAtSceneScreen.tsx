import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { RootState } from '../../store';
import { apiClient } from '../../services/apiClient';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { setEmergencyCase } from '../../store/emergencySlice';

type Props = {
  navigation: NativeStackNavigationProp<ParamedicStackParamList, 'KnownPatientAtScene'>;
};

interface PatientProfile {
  id: string;
  name: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  aadhaar?: string;
}

interface MedicalRecord {
  id: string;
  type: string;
  title: string;
  date: string;
  provider: string;
  result?: string;
}

export const KnownPatientAtSceneScreen = ({ navigation }: Props) => {
  const reduxDispatch = useDispatch();
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [proceedLoading, setProceedLoading] = useState(false);

  const patientId = activeDispatch?.requesterPatientId;

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [profileRes, recordsRes] = await Promise.all([
          apiClient.get(`/patient/profile/${patientId}`),
          apiClient.get(`/patient/records/${patientId}`),
        ]);
        setProfile(profileRes.data);
        setRecords(recordsRes.data || []);
      } catch {
        Alert.alert('Error', 'Could not load patient records.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleProceedToVitals = async () => {
    if (!activeDispatch) return;
    setProceedLoading(true);
    try {
      // KNOWN patient: skip temp case creation — use dispatch ID as the case reference
      // Set emergency case in Redux so PatientVitalsScreen has a caseId to work with
      reduxDispatch(setEmergencyCase({
        caseId: activeDispatch.dispatchId,
        temporaryPatientId: activeDispatch.patientId || activeDispatch.requesterPatientId || activeDispatch.dispatchId,
        severity: 'NOT_ASSESSED',
        status: 'AT_SCENE',
        dispatchId: activeDispatch.dispatchId,
        patientName: profile?.name || activeDispatch.patientName,
        location: activeDispatch.location,
        createdAt: activeDispatch.createdAt,
      }));

      navigation.navigate('PatientVitals', { caseId: activeDispatch.dispatchId });
    } catch {
      Alert.alert('Error', 'Failed to proceed. Please try again.');
    } finally {
      setProceedLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1a56db" />
        <Text className="text-gray-500 mt-4">Loading patient records...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900">Known Patient</Text>
        <Text className="text-gray-500 text-sm">Identity confirmed via app. Records loaded automatically.</Text>
      </View>

      {/* Patient Profile Card */}
      <Card className="mb-4 border-t-4 border-primary shadow-sm">
        <CardTitle>Patient Profile</CardTitle>
        {profile ? (
          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900">{profile.name}</Text>
              <Badge label={profile.bloodGroup} variant="primary" />
            </View>

            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Allergies</Text>
              {profile.allergies.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {profile.allergies.map((a, i) => (
                    <View key={i} className="bg-red-100 px-3 py-1 rounded-full">
                      <Text className="text-red-700 text-xs font-semibold">{a}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-400 text-sm">None recorded</Text>
              )}
            </View>

            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Chronic Conditions</Text>
              {profile.chronicConditions.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {profile.chronicConditions.map((c, i) => (
                    <View key={i} className="bg-orange-100 px-3 py-1 rounded-full">
                      <Text className="text-orange-700 text-xs font-semibold">{c}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-400 text-sm">None recorded</Text>
              )}
            </View>
          </View>
        ) : (
          <Text className="text-gray-400">No profile found for patient ID: {patientId}</Text>
        )}
      </Card>

      {/* Medical Records */}
      <Card className="mb-6 border-t-4 border-accent shadow-sm">
        <CardTitle>Medical Records ({records.length})</CardTitle>
        {records.length > 0 ? (
          records.map((rec) => (
            <View key={rec.id} className="py-3 border-b border-gray-100 last:border-0">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{rec.title}</Text>
                  <Text className="text-xs text-gray-400">{rec.provider} • {rec.date}</Text>
                  {rec.result && (
                    <Text className="text-xs text-primary-dark mt-1">Result: {rec.result}</Text>
                  )}
                </View>
                <View className="bg-gray-100 px-2 py-1 rounded-lg ml-2">
                  <Text className="text-[10px] font-bold text-gray-500">{rec.type.replace('_', ' ')}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-gray-400 text-sm">No records on file.</Text>
        )}
      </Card>

      <Button
        title="PROCEED TO VITALS"
        size="lg"
        onPress={handleProceedToVitals}
        loading={proceedLoading}
        className="shadow-lg"
      />
    </ScrollView>
  );
};
