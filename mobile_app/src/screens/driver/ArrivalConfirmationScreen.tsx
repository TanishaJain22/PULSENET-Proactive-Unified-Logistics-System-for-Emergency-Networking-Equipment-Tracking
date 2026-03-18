import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ambulanceService } from '../../services/api/ambulanceService';
import { dispatchService } from '../../services/api/dispatchService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearActiveDispatch } from '../../store/dispatchSlice';
import { clearEmergencyCase } from '../../store/emergencySlice';
type ArrivalConfirmationNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'ArrivalConfirmation'>;
type ArrivalConfirmationRouteProp = RouteProp<DriverStackParamList, 'ArrivalConfirmation'>;

interface Props {
  navigation: ArrivalConfirmationNavigationProp;
  route: ArrivalConfirmationRouteProp;
}

export const ArrivalConfirmationScreen = ({ navigation, route }: Props) => {
  const { caseId, dispatchId: routeDispatchId } = route.params;
  const dispatch = useDispatch();
  const { activeDispatch } = useSelector((state: RootState) => state.dispatch);
  const [loading, setLoading] = useState(false);

  const handleConfirmArrival = async () => {
    setLoading(true);
    try {
      const resolvedDispatchId = routeDispatchId || activeDispatch?.dispatchId;
      if (resolvedDispatchId) {
        await dispatchService.updateDispatchStatus(resolvedDispatchId, 'ARRIVED_AT_HOSPITAL').catch(() => {});
        await dispatchService.updateDispatchStatus(resolvedDispatchId, 'HANDOFF_COMPLETE').catch(() => {});
      } else {
        await ambulanceService.confirmArrival(caseId);
      }
      dispatch(clearActiveDispatch());
      dispatch(clearEmergencyCase());
      Alert.alert('Arrival Confirmed', 'Hospital has been notified. Handoff complete.', [
        { text: 'Back to Dashboard', onPress: () => navigation.navigate('DriverDashboard') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm arrival. Please try again or notify dispatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-4 py-8">
      <Card className="items-center py-10 px-6 shadow-md border-primary-dark border-t-8 bg-white">
        <View className="bg-primary/20 rounded-full w-24 h-24 items-center justify-center mb-8">
          <Text className="text-5xl">🏥</Text>
        </View>
        
        <CardTitle className="text-3xl text-center mb-4 leading-tight">Drop-off Zone Arrived?</CardTitle>
        <CardDescription className="text-center text-base px-2 mb-8 text-foreground/60 leading-relaxed">
          Confirming arrival will alert the ER staff to prepare for immediate patient handoff.
        </CardDescription>

        <View className="w-full gap-4">
          <Button 
            title="CONFIRM ARRIVAL" 
            size="lg" 
            onPress={handleConfirmArrival} 
            loading={loading}
          />
          <Button 
            title="CANCEL" 
            variant="secondary"
            size="lg"
            onPress={() => navigation.goBack()}
            disabled={loading}
          />
        </View>
      </Card>
      
      <View className="mt-8 items-center px-8">
         <Text className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest text-center">Important: Do not confirm until the vehicle is stationary in the drop-off zone.</Text>
      </View>
    </View>
  );
};
