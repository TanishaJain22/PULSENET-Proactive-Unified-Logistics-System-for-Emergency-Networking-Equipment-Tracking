import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type RouteStatusNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'RouteStatus'>;
type RouteStatusRouteProp = RouteProp<DriverStackParamList, 'RouteStatus'>;

interface Props {
  navigation: RouteStatusNavigationProp;
  route: RouteStatusRouteProp;
}

export const RouteStatusScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;

  return (
    <View className="flex-1 bg-background px-4 py-8">
      <View className="mb-6 px-2">
         <Text className="text-3xl font-bold text-foreground">Transport Status</Text>
         <Text className="text-foreground/50 text-sm font-medium">Tracking case: {caseId}</Text>
      </View>

      <Card className="mb-8 shadow-md border-primary/20 bg-white">
        <View className="bg-primary/10 p-4 rounded-xl mb-6 flex-row items-center border border-primary/20">
           <View className="w-2 h-2 rounded-full bg-primary-dark mr-3 animate-pulse" />
           <Text className="text-foreground font-bold uppercase tracking-wider text-[10px]">Real-time Tracking Active</Text>
        </View>

        <View className="flex-row mb-6 bg-muted rounded-2xl p-5">
          <View className="flex-1 items-center border-r border-foreground/5">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold">Distance</Text>
            <Text className="text-2xl font-bold text-foreground mt-1">1.2 km</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] text-foreground/40 uppercase font-bold">ETA</Text>
            <Text className="text-2xl font-bold text-primary-dark mt-1">4 mins</Text>
          </View>
        </View>

        <View className="p-4 bg-muted/30 rounded-xl mb-6">
           <Text className="text-[10px] text-foreground/40 uppercase font-bold mb-2">Current Activity</Text>
           <Text className="text-sm font-medium text-foreground">Moving through heavy traffic on Main St. Optimized route selected.</Text>
        </View>

        <Button 
          title="VIEW MAP NAVIGATION" 
          size="lg"
          onPress={() => navigation.navigate('Navigation', { caseId })} 
        />
      </Card>
      
      <Button 
        title="BACK TO DASHBOARD" 
        variant="secondary"
        onPress={() => navigation.navigate('DriverDashboard')} 
      />
    </View>
  );
};
