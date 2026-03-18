import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PatientStackParamList } from '../../navigation/PatientNavigator';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type FeedbackNavigationProp = NativeStackNavigationProp<PatientStackParamList, 'Feedback'>;
type FeedbackRouteProp = RouteProp<PatientStackParamList, 'Feedback'>;

interface Props {
  navigation: FeedbackNavigationProp;
  route: FeedbackRouteProp;
}

export const FeedbackScreen = ({ navigation, route }: Props) => {
  const { caseId } = route.params;
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      Alert.alert(
        'Feedback Recorded', 
        'Your insight helps optimize the emergency care network for all citizens.', 
        [{ text: 'RETURN TO PROFILE', onPress: () => navigation.navigate('PatientDashboard') }]
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-10 mt-6">
          <View className="w-24 h-24 bg-primary/10 rounded-[32px] items-center justify-center mb-6 border border-primary/20 shadow-sm">
            <Text className="text-5xl">✅</Text>
          </View>
          <Text className="text-3xl font-black text-foreground">Care Complete</Text>
          <Text className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Closed Case: {caseId}</Text>
        </View>

        <Card className="mb-10 shadow-xl bg-white p-8 rounded-[40px] border border-primary-dark/10">
          <Text className="text-xl font-black text-foreground text-center mb-2">Service Audit</Text>
          <Text className="text-foreground/50 text-center mb-10 px-4 text-xs leading-relaxed">
            Rate the ambulance dispatch speed and the quality of paramedic intervention.
          </Text>
           
          <View className="flex-row justify-center items-center mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                className={`w-14 h-14 mx-1.5 rounded-2xl items-center justify-center border shadow-sm ${
                  rating >= star ? 'bg-primary border-primary' : 'bg-muted border-muted'
                }`}
              >
                <Text className="text-2xl">{rating >= star ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-muted/30 p-4 rounded-3xl border border-muted mb-4">
             <Text className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-3 ml-2">Qualitative Feedback</Text>
             <Input
               placeholder="How was the response time and overall care?"
               value={comments}
               onChangeText={setComments}
               multiline
               numberOfLines={4}
               style={{ height: 120, textAlignVertical: 'top', paddingTop: 0, backgroundColor: 'transparent', borderBottomWidth: 0 }}
             />
          </View>
        </Card>

        <View className="gap-4">
          <Button 
            title="SUBMIT AUDIT REPORT" 
            onPress={handleSubmit} 
            loading={loading}
            size="lg"
            className="shadow-xl"
          />
          <TouchableOpacity 
            onPress={() => navigation.navigate('PatientDashboard')}
            className="py-4 items-center bg-muted/20 rounded-2xl border border-muted"
          >
            <Text className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Skip for now</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
            <Text className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Official Care Audit • Healthcare Platform</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
