import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { emergencyService } from '../../services/api/emergencyService';
import { calculateTriageScore } from '../../utils/triageUtils';
import { offlineStorage } from '../../utils/offlineStorage';
import { dispatchService } from '../../services/api/dispatchService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type VitalsNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'PatientVitals'>;
type VitalsRouteProp = RouteProp<ParamedicStackParamList, 'PatientVitals'>;

interface Props {
  navigation: VitalsNavigationProp;
  route: VitalsRouteProp;
}

export const PatientVitalsScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [vitals, setVitals] = useState({
    heartRate: '',
    oxygenSaturation: '',
    bloodPressure: '',
    temperature: '',
    respiratoryRate: '',
  });

  // Load cached vitals on mount
  useEffect(() => {
    const loadCache = async () => {
      const cachedVitals = await offlineStorage.get<any>(`${offlineStorage.keys.TEMPORARY_PATIENT_DATA}_${caseId}`);
      if (cachedVitals) {
        setVitals(cachedVitals);
      }
    };
    loadCache();
  }, [caseId]);

  // Cache vitals as they change
  useEffect(() => {
    const saveCache = async () => {
      setIsSyncing(true);
      await offlineStorage.save(`${offlineStorage.keys.TEMPORARY_PATIENT_DATA}_${caseId}`, vitals);
      setTimeout(() => setIsSyncing(false), 500); // Visual feedback delay
    };
    saveCache();
  }, [vitals, caseId]);

  const triageResult = calculateTriageScore(vitals);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { label: 'CRITICAL', color: 'text-error', bg: 'bg-error/10', border: 'border-error/20' };
      case 'HIGH': return { label: 'HIGH PRIORITY', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
      case 'MEDIUM': return { label: 'MEDIUM PRIORITY', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      default: return { label: 'NORMAL', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
    }
  };

  const styles = getSeverityStyles(triageResult.severity);

  const handleSubmitVitals = async () => {
    if (!vitals.heartRate || !vitals.oxygenSaturation) {
      Alert.alert('Incomplete Data', 'Please enter at least HR and SpO2 for triage assessment.');
      return;
    }

    setLoading(true);
    try {
      const response: any = await emergencyService.submitVitals(caseId, vitals);
      // Advance dispatch timeline — avoid double-call if caseId IS the dispatchId (KNOWN patient)
      if (activeDispatch && activeDispatch.dispatchId !== caseId) {
        await dispatchService.updateDispatchStatus(activeDispatch.dispatchId, 'VITALS_RECORDED').catch(() => {});
      }
      navigation.navigate('SeverityResult', {
        caseId,
        severity: response.severity,
        score: response.triageScore,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to submit vitals.');
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
        <View className="mb-6 mt-2 flex-row justify-between items-end">
           <View>
              <Text className="text-2xl font-bold text-gray-900">Patient Vitals</Text>
              <Text className="text-gray-500">Real-time triage data for Case: {caseId}</Text>
           </View>
           {isSyncing && (
             <View className="bg-primary/10 px-2 py-1 rounded-lg">
                <Text className="text-[8px] font-bold text-primary-dark uppercase">Local Sync...</Text>
             </View>
           )}
        </View>

        {/* Live Triage Indicator */}
        <View className={`p-4 rounded-2xl mb-6 border ${styles.border} ${styles.bg} flex-row items-center justify-between`}>
          <View>
            <Text className="text-xs font-bold text-gray-500 uppercase">Live Triage Insight</Text>
            <Text className={`text-lg font-bold ${styles.color}`}>{styles.label}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-400">NEWS2 Score: {triageResult.score}</Text>
            <Text className="text-xl">🩺</Text>
          </View>
        </View>

        <Card className="mb-6 shadow-sm p-4">
           <CardTitle className="mb-4">Circulation & Respiratory</CardTitle>
                     <View className="flex-row">
             <View className="flex-1 mr-2">
                <Input
                  label="Heart Rate (BPM)"
                  placeholder="72"
                  keyboardType="numeric"
                  value={vitals.heartRate}
                  onChangeText={(t) => setVitals({ ...vitals, heartRate: t })}
                />
             </View>
             <View className="flex-1 ml-2">
                <Input
                  label="SpO2 (%)"
                  placeholder="98"
                  keyboardType="numeric"
                  value={vitals.oxygenSaturation}
                  onChangeText={(t) => setVitals({ ...vitals, oxygenSaturation: t })}
                />
             </View>
           </View>

           <Input
             label="Blood Pressure (mmHg)"
             placeholder="120/80"
             value={vitals.bloodPressure}
             onChangeText={(t) => setVitals({ ...vitals, bloodPressure: t })}
           />
        </Card>

        <Card className="mb-8 shadow-sm p-4">
           <CardTitle className="mb-4">Other Metrics</CardTitle>
           
           <View className="flex-row">
             <View className="flex-1 mr-2">
               <Input
                 label="Temperature"
                 placeholder="98.6"
                 keyboardType="numeric"
                 value={vitals.temperature}
                 onChangeText={(t) => setVitals({ ...vitals, temperature: t })}
               />
             </View>
             <View className="flex-1 ml-2">
                <Input
                  label="Resp. Rate"
                  placeholder="16"
                  keyboardType="numeric"
                  value={vitals.respiratoryRate}
                  onChangeText={(t) => setVitals({ ...vitals, respiratoryRate: t })}
                />
             </View>
           </View>
        </Card>

        <Button 
          title="Run Severity Audit" 
          onPress={handleSubmitVitals} 
          loading={loading}
          size="lg"
          className="shadow-lg"
        />
        
        <TouchableOpacity className="mt-6 items-center">
          <Text className="text-primary font-bold">Manual Triage Override</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
