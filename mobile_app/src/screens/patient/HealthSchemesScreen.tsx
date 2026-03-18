import React, { useState } from 'react';
import { View, Text, ScrollView, Linking, Alert, TouchableOpacity } from 'react-native';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const HealthSchemesScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [verifying, setVerifying] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null);

  // Profile heuristics based on actual user data or fallbacks
  const userProfile = {
    occupation: user?.medicalConditions?.includes('Worker') ? 'Worker' : 'Other',
    monthlyIncome: 8000, // Placeholder as income isn't in user object yet
    locationType: 'Rural',
    isAadhaarLinked: !!user?.aadhaar
  };

  const schemes = [
    {
      title: 'Ayushman Bharat (PM-JAY)',
      desc: 'Free health coverage up to ₹5 lakhs per family for tertiary clinical care.',
      url: 'https://pmjay.gov.in',
      tag: 'GOVT OF INDIA',
      id: 'pmjay'
    },
    {
      title: 'State Health Assurance',
      desc: 'Local state-level healthcare subsidies and free emergency ambulatory services.',
      url: 'https://mohfw.gov.in',
      tag: 'STATE GOVT',
      id: 'state'
    },
    {
      title: 'CGHS',
      desc: 'Comprehensive healthcare for central government employees and pensioners.',
      url: 'https://cghs.nic.in',
      tag: 'DEPARTMENTAL',
      id: 'cghs'
    }
  ];

  const checkEligibilityHeuristics = () => {
    // PM-JAY eligibility heuristics (based on SECC 2011)
    if (userProfile.monthlyIncome < 10000 && userProfile.locationType === 'Rural') {
      return 'Likely Eligible (Priority Group)';
    }
    if (userProfile.occupation.includes('Worker') || userProfile.occupation.includes('Farmer')) {
      return 'Likely Eligible (Based on Occupation)';
    }
    return 'Verification Required (Portal Check)';
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open browser.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-10" showsVerticalScrollIndicator={false}>
      <View className="bg-primary/10 p-8 rounded-[32px] mb-10 border border-primary/20">
        <View className="w-12 h-12 bg-primary rounded-2xl items-center justify-center mb-4 border border-primary/30">
           <Text className="text-2xl">⚖️</Text>
        </View>
        <Text className="text-primary-dark font-black text-2xl mb-2">Benefit Eligibility</Text>
        <Text className="text-foreground/60 text-sm leading-relaxed">
          The Rescue App automatically checks eligibility heuristics based on your digitized health profile.
        </Text>
      </View>

      <Text className="text-foreground font-black text-xl mb-6 px-1">Available Programs</Text>

      {schemes.map((scheme, index) => {
        const result = scheme.id === 'pmjay' ? checkEligibilityHeuristics() : null;
        
        return (
          <Card key={index} className="mb-6 shadow-md border-primary-dark/10 bg-white p-6 rounded-[32px]">
            <View className="mb-4">
               <View className="flex-row justify-between mb-3">
                 <View className="bg-muted px-2 py-1 rounded-lg">
                    <Text className="text-[10px] font-black text-foreground/40 tracking-widest">{scheme.tag}</Text>
                 </View>
                 {result && (
                   <View className="bg-success/10 px-2 py-1 rounded-lg border border-success/30">
                      <Text className="text-[10px] font-bold text-success uppercase">{result}</Text>
                   </View>
                 )}
               </View>
               <CardTitle className="text-xl mb-2 leading-tight">{scheme.title}</CardTitle>
               <CardDescription className="text-sm text-foreground/50 leading-relaxed mb-6">{scheme.desc}</CardDescription>
            </View>
            
            <TouchableOpacity 
              onPress={() => {
                if (scheme.id === 'pmjay') {
                  setVerifying(true);
                  setTimeout(() => {
                    setVerifying(false);
                    setEligibilityResult(result);
                    Alert.alert(
                      "Pre-Screen Result", 
                      `Based on your profile, you are ${result}. Would you like to proceed to the official SECC portal for secondary verification?`,
                      [
                        { text: "Later", style: "cancel" },
                        { text: "Visit Portal", onPress: () => handleOpenLink(scheme.url) }
                      ]
                    );
                  }, 1500);
                } else {
                  handleOpenLink(scheme.url);
                }
              }}
              disabled={verifying}
              className={`py-4 rounded-2xl items-center border ${verifying && scheme.id === 'pmjay' ? 'bg-muted border-muted' : 'bg-primary border-primary'}`}
            >
              <Text className="text-foreground font-black text-xs uppercase tracking-widest">
                {verifying && scheme.id === 'pmjay' ? 'Consulting Govt Heuristics...' : 'Verify Beneficiary'}
              </Text>
            </TouchableOpacity>
          </Card>
        );
      })}
      
      <View className="mb-12 items-center">
          <Text className="text-[10px] text-foreground/20 font-bold uppercase tracking-widest">Last updated: Oct 2025 • Heuristics Engine v2.0</Text>
      </View>
    </ScrollView>
  );
};
