import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ParamedicStackParamList } from '../../navigation/ParamedicNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type SeverityNavigationProp = NativeStackNavigationProp<ParamedicStackParamList, 'SeverityResult'>;
type SeverityRouteProp = RouteProp<ParamedicStackParamList, 'SeverityResult'>;

interface Props {
  navigation: SeverityNavigationProp;
  route: SeverityRouteProp;
}

export const SeverityResultScreen = ({ navigation, route }: Props) => {
  const { caseId, severity, score } = route.params;

  const getRecommendation = () => {
    if (severity === 'CRITICAL') return 'IMMEDIATE ACTION REQUIRED. Urgent transport to Level-1 Trauma Center.';
    if (severity === 'HIGH') return 'Urgent medical attention needed. Monitor vitals every 15 minutes.';
    if (severity === 'MEDIUM') return 'Medical review suggested. Increase monitoring frequency.';
    return 'Patient is stable. Routine monitoring advised.';
  };

  const getSeverityStyle = () => {
    switch(severity) {
      case 'CRITICAL': return 'bg-error text-white border-error shadow-error/40';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-500 shadow-orange-500/40';
      case 'MEDIUM': return 'bg-amber-500 text-white border-amber-500 shadow-amber-500/40';
      default: return 'bg-green-500 text-white border-green-500 shadow-green-500/40';
    }
  };

  const getScoreColor = () => {
    if (score >= 7) return 'text-error';
    if (score >= 5) return 'text-orange-500';
    if (score >= 3) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <View className="flex-1 bg-background px-4 py-8 items-center justify-center">
      <Card className="w-full shadow-2xl items-center py-12 px-8 bg-white border-primary/10">
        
        <Text className="text-foreground/40 uppercase font-bold text-[10px] tracking-widest mb-4">Triage Analysis Complete</Text>
        
        <View className="relative mb-8">
           <View className={`w-36 h-36 rounded-full border-[10px] border-muted items-center justify-center ${getScoreColor()}`}>
              <Text className="text-6xl font-black">{score}<Text className="text-2xl opacity-20">/10</Text></Text>
           </View>
           <View className="absolute -bottom-2 -right-2 bg-primary w-12 h-12 rounded-full items-center justify-center border-4 border-white shadow-lg">
              <Text className="text-lg">📊</Text>
           </View>
        </View>

        <View className={`px-10 py-4 border rounded-3xl mb-10 shadow-lg ${getSeverityStyle()}`}>
          <Text className="font-black text-2xl uppercase tracking-tighter">{severity} PRIORITY</Text>
        </View>

        <View className="bg-muted/30 p-8 rounded-[32px] mb-12 w-full border border-muted/50">
          <Text className="text-center text-base font-semibold text-foreground/80 leading-relaxed mb-2 italic">
             "{getRecommendation()}"
          </Text>
          <Text className="text-center text-xs font-medium text-foreground/40 leading-relaxed">
            NEWS2-based automated triage engine recommendation.
          </Text>
        </View>

        <View className="w-full gap-4">
          <Button 
            title="VIEW ASSIGNED HOSPITAL" 
            onPress={() => navigation.navigate('HospitalAssignment', { caseId, severity })} 
            size="lg"
            className="shadow-md"
          />
          <Button 
            title="OVERRIDE RESULTS" 
            variant="secondary"
            onPress={() => navigation.goBack()} 
          />
        </View>
      </Card>
      
      <View className="mt-8 px-8">
          <Text className="text-[10px] text-foreground/30 text-center uppercase font-bold tracking-widest">Case ID: {caseId} • Logged at: {new Date().toLocaleTimeString()}</Text>
      </View>
    </View>
  );
};
