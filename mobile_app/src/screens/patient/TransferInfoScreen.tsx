import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PatientStackParamList } from '../../navigation/PatientNavigator';

type TransferNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'TransferInfo'>;
type TransferRouteProp = RouteProp<PatientStackParamList, 'TransferInfo'>;

interface Props {
  navigation: TransferNavigationProp;
  route: TransferRouteProp;
}

export const TransferInfoScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;

  return (
    <View className="flex-1 bg-background px-6 py-10 items-center justify-center">
      <Card className="w-full items-center py-12 px-8 shadow-2xl bg-white border-primary-dark/10 rounded-[40px]">
        <View className="bg-muted rounded-full w-24 h-24 items-center justify-center mb-10 border border-muted shadow-sm">
          <Text className="text-5xl">🔄</Text>
        </View>

        <View className="mb-10 items-center">
           <Text className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-2">Resource Escalation</Text>
           <CardTitle className="text-3xl text-center mb-3 font-black">Transfer Protocol</CardTitle>
           <CardDescription className="text-center px-4 text-foreground/50 leading-relaxed">
             Specialized clinical equipment is required. You are being moved to a tertiary care facility.
           </CardDescription>
        </View>

        <View className="w-full bg-muted/30 rounded-3xl p-8 mb-10 border border-muted space-y-6">
          <View className="flex-row items-center justify-between">
             <View className="flex-1">
                <Text className="text-[10px] text-foreground/30 uppercase font-black tracking-widest text-center">CURRENT</Text>
                <Text className="text-lg font-black text-foreground text-center mt-2">City General</Text>
             </View>
             <View className="mx-4"><Text className="text-2xl text-primary-dark font-black">→</Text></View>
             <View className="flex-1">
                <Text className="text-[10px] text-foreground/30 uppercase font-black tracking-widest text-center">TARGET</Text>
                <Text className="text-lg font-black text-primary-dark text-center mt-2">Apollo Heart</Text>
             </View>
          </View>
        </View>

        <View className="w-full gap-4">
          <Button 
            title="TRACK ESCORT AMBULANCE" 
            onPress={() => navigation.navigate('EmergencyTracking', { caseId })} 
            size="lg"
            className="shadow-xl"
          />
          <Button 
            title="VIEW CASE TIMELINE" 
            variant="secondary"
            onPress={() => navigation.navigate('TreatmentTimeline', { caseId })} 
          />
        </View>
      </Card>
      
      <View className="mt-10 items-center">
          <Text className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Logged by Command Center • Case: {caseId}</Text>
      </View>
    </View>
  );
};
