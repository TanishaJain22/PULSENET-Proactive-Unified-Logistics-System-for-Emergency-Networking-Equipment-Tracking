import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type TempIDNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'TemporaryPatientID'>;
type TempIDRouteProp = RouteProp<ParamedicStackParamList, 'TemporaryPatientID'>;

interface Props {
  navigation: TempIDNavigationProp;
  route: TempIDRouteProp;
}

export const TemporaryPatientIDScreen = ({ navigation, route }: Props) => {
  const { caseId, temporaryPatientId } = route.params;

  return (
    <View className="flex-1 bg-gray-50 px-4 py-8 items-center justify-center">
      <Card className="w-full shadow-xl border-t-8 border-primary items-center py-10 px-6">
        <View className="bg-blue-100 rounded-full w-20 h-20 items-center justify-center mb-6">
          <Text className="text-4xl">🆔</Text>
        </View>

        <CardTitle className="text-2xl text-center mb-2">Temporary Patient ID</CardTitle>
        <CardDescription className="text-center px-4 mb-6">
          Write or tag this ID on the patient. The hospital will map this to their Aadhaar later.
        </CardDescription>

        <View className="bg-gray-100 border border-gray-300 rounded-lg w-full py-6 items-center mb-8">
           <Text className="text-4xl font-bold tracking-widest text-primary">{temporaryPatientId}</Text>
        </View>

        <View className="w-full space-y-4">
          <Button 
            title="Record Vitals NOW" 
            onPress={() => navigation.navigate('PatientVitals', { caseId })} 
            size="lg"
            className="mb-4"
          />
          <Button 
             title="Return to Dashboard" 
             variant="outline"
             onPress={() => navigation.navigate('ParamedicDashboard')} 
          />
        </View>
      </Card>
    </View>
  );
};
