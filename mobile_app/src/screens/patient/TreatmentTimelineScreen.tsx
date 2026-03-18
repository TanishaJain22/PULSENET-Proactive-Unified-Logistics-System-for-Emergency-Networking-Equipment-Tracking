import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PatientStackParamList } from '../../navigation/PatientNavigator';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { socketService } from '../../services/socket';
import { emergencyService } from '../../services/api/emergencyService';
import { dispatchService } from '../../services/api/dispatchService';

type TimelineNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'TreatmentTimeline'>;
type TimelineRouteProp = RouteProp<PatientStackParamList, 'TreatmentTimeline'>;

interface Props {
  navigation: TimelineNavigationProp;
  route: TimelineRouteProp;
}

interface TimelineEvent {
  time: string;
  event: string;
  status: 'completed' | 'active' | 'pending';
}

export const TreatmentTimelineScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { time: '10:45 AM', event: 'Emergency Call Received', status: 'completed' },
    { time: '10:48 AM', event: 'Ambulance Dispatched', status: 'completed' },
    { time: '10:55 AM', event: 'Paramedics Arrived on Scene', status: 'active' },
  ]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        // Try dispatch timeline first (new flow), fall back to emergency timeline
        let data: TimelineEvent[] | null = null;
        if (caseId.startsWith('DISP-')) {
          data = await dispatchService.getTimeline(caseId);
        } else {
          data = await emergencyService.getTimeline(caseId);
        }
        if (Array.isArray(data) && data.length > 0) setTimeline(data);
      } catch (e) {
        console.warn('[Timeline] Could not fetch timeline for', caseId, '— using local state');
      }
    };

    fetchTimeline();
    socketService.connect();

    // Join both case and dispatch rooms
    if (caseId.startsWith('DISP-')) {
      socketService.joinDispatch(caseId);
    } else {
      socketService.joinCase(caseId);
    }

    // Listen for lifecycle updates
    const unsubscribe = socketService.onStatusUpdate((data) => {
      console.log('[Socket] Timeline Update:', data.status);
      setTimeline(prev => {
        // Mark previous active as completed
        const updated = prev.map(ev => ev.status === 'active' ? { ...ev, status: 'completed' } as TimelineEvent : ev);
        // Add new active event
        return [...updated, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: data.message || `Status: ${data.status}`,
          status: 'active'
        }];
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [caseId]);

  return (
    <ScrollView className="flex-1 bg-background px-4 py-8">
      <View className="mb-8 px-2">
         <Text className="text-3xl font-black text-foreground">Treatment Loop</Text>
         <Text className="text-foreground/40 text-sm font-bold uppercase tracking-widest">Digital Audit Log • Case: {caseId}</Text>
      </View>

      <Card className="mb-12 shadow-xl border-muted bg-white p-8 rounded-[40px]">
        <View className="ml-2 border-l-2 border-primary/20 pl-8 pb-4">
          {timeline.map((item, index) => {
            const isCompleted = item.status === 'completed';
            const isActive = item.status === 'active';
            
            return (
              <View key={index} className="relative mb-12 last:mb-0">
                {/* Timeline Dot */}
                <View className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md ${
                  isCompleted ? 'bg-primary' : isActive ? 'bg-primary-dark' : 'bg-muted'
                }`} />
                
                <View>
                   <Text className={`text-[10px] font-black uppercase tracking-widest ${
                     isCompleted ? 'text-primary-dark/60' : isActive ? 'text-primary-dark' : 'text-foreground/20'
                   }`}>
                     {item.time}
                   </Text>
                   <Text className={`text-xl mt-1 leading-tight tracking-tight ${
                     isCompleted || isActive ? 'text-foreground font-extrabold' : 'text-foreground/40 font-medium'
                   }`}>
                     {item.event}
                   </Text>
                   {isActive && (
                      <View className="bg-primary/20 px-3 py-1 rounded-full self-start mt-3 border border-primary/30">
                         <Text className="text-[10px] text-primary-dark font-black tracking-widest">LATEST UPDATE</Text>
                      </View>
                   )}
                </View>
              </View>
            );
          })}
        </View>
      </Card>
      
      <Button 
        title="BACK TO TRACKING" 
        variant="secondary"
        onPress={() => navigation.goBack()} 
      />
    </ScrollView>
  );
};
