import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { emergencyService } from '../../services/api/emergencyService';
import { updateEmergencyStatus } from '../../store/emergencySlice';
import { socketService } from '../../services/socket';
import { dispatchService } from '../../services/api/dispatchService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type StatusUpdateNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'StatusUpdate'>;
type StatusUpdateRouteProp = RouteProp<ParamedicStackParamList, 'StatusUpdate'>;

interface Props {
  navigation: StatusUpdateNavigationProp;
  route: StatusUpdateRouteProp;
}

export const StatusUpdateScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;
  const dispatch = useDispatch();
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    try {
      await emergencyService.updateEmergencyStatus(caseId, status);
      dispatch(updateEmergencyStatus({ status }));

      // Map emergency status → dispatch status and advance timeline
      const dispatchStatusMap: Record<string, string> = {
        EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
        ARRIVED:              'ARRIVED_AT_HOSPITAL',
        HANDOFF_COMPLETE:     'HANDOFF_COMPLETE',
      };
      if (activeDispatch && dispatchStatusMap[status]) {
        await dispatchService.updateDispatchStatus(activeDispatch.dispatchId, dispatchStatusMap[status]).catch(() => {});
      }

      // Emit real-time update to patient's timeline
      let message = 'Status Updated';
      if (status === 'EN_ROUTE_TO_HOSPITAL') message = 'Ambulance is now departing the scene for the hospital.';
      if (status === 'ARRIVED_AT_HOSPITAL') message = 'Ambulance has arrived at the clinical facility.';
      if (status === 'HANDOFF_COMPLETE') message = 'Patient handoff to ER team is complete.';
      
      socketService.emitStatusUpdate(caseId, status, message);

      Alert.alert('Status Updated', `Emergency status changed to ${status}.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
       Alert.alert('Error', 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-4 py-8">
      <View className="mb-8 mt-4 px-2">
         <Text className="text-3xl font-bold text-foreground">Case Status</Text>
         <Text className="text-foreground/50 text-base">Emergency Progress Tracking</Text>
      </View>

      <Card className="shadow-md items-center py-10 px-6 bg-white border-primary/10">
        <View className="bg-muted rounded-full w-20 h-20 items-center justify-center mb-8">
           <Text className="text-4xl">📡</Text>
        </View>
        <CardTitle className="text-2xl mb-2 text-center">Update Command</CardTitle>
        <CardDescription className="text-center mb-10 text-foreground/60 leading-relaxed">
          Broadcasting status updates allows hospitals to coordinate resources and preparation times.
        </CardDescription>

        <View className="w-full gap-4">
          <Button 
            title="DEPARTING SCENE" 
            onPress={() => handleUpdateStatus('EN_ROUTE_TO_HOSPITAL')} 
            disabled={loading}
            size="lg"
            className="shadow-sm"
          />
          <Button 
            title="ARRIVED AT HOSPITAL" 
            onPress={() => handleUpdateStatus('ARRIVED')} 
            disabled={loading}
            variant="secondary"
            size="lg"
          />
          <Button 
            title="HANDOFF COMPLETE" 
            onPress={() => handleUpdateStatus('HANDOFF_COMPLETE')} 
            disabled={loading}
            variant="outline"
            size="lg"
          />
        </View>
      </Card>
      
      <View className="mt-8 px-8 items-center">
         <Text className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest text-center">Manual status updates are logged with millisecond precision for auditing.</Text>
      </View>
    </View>
  );
};
