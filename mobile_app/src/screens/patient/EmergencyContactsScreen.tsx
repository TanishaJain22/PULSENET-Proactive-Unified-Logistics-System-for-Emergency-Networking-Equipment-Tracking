import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { patientService } from '../../services/api/patientService';

export const EmergencyContactsScreen = () => {
  const [contacts, setContacts] = useState([
    { name: 'Priya Sharma', relation: 'Wife', phone: '+91 98765 43210' },
    { name: 'Rahul Verma', relation: 'Brother', phone: '+91 91234 56789' },
  ]);

  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName || !newPhone) {
      Alert.alert('Required', 'Please enter at least a name and phone number.');
      return;
    }
    const updated = [...contacts, { name: newName, relation: newRelation, phone: newPhone }];
    setSaving(true);
    try {
      await patientService.updateEmergencyContacts(updated);
      setContacts(updated);
      setNewName('');
      setNewRelation('');
      setNewPhone('');
      Alert.alert('Saved', 'Emergency contact saved successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (index: number) => {
    Alert.alert('Remove Contact', 'Are you sure you want to remove this contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const updated = contacts.filter((_, i) => i !== index);
          try {
            await patientService.updateEmergencyContacts(updated);
            setContacts(updated);
          } catch {
            Alert.alert('Error', 'Failed to remove contact.');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-10" showsVerticalScrollIndicator={false}>
      <View className="mb-10 px-2">
         <Text className="text-3xl font-black text-foreground">Guardian Alerts</Text>
         <Text className="text-foreground/50 text-base leading-relaxed mt-2">
            These contacts receive <Text className="text-primary-dark font-bold">real-time tracking links</Text> immediately when an SOS is triggered.
         </Text>
      </View>

      {contacts.map((contact, index) => (
        <Card key={index} className="mb-6 shadow-md bg-white p-6 rounded-[32px] flex-row justify-between items-center border border-primary-dark/10">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
               <Text className="font-black text-foreground text-xl mr-3">{contact.name}</Text>
               <View className="bg-muted px-2 py-1 rounded-lg">
                  <Text className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{contact.relation}</Text>
               </View>
            </View>
            <Text className="text-foreground/40 font-bold text-sm tracking-widest">{contact.phone}</Text>
          </View>
          <TouchableOpacity onPress={() => handleRemove(index)}>
             <View className="bg-error/10 w-10 h-10 rounded-2xl items-center justify-center border border-error/20">
                <Text className="text-error">✕</Text>
             </View>
          </TouchableOpacity>
        </Card>
      ))}

      <Card className="mt-6 border-2 border-muted bg-muted/20 shadow-none p-8 rounded-[40px]">
        <View className="items-center mb-8">
           <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mb-4 border border-muted">
              <Text className="text-2xl">👤</Text>
           </View>
           <CardTitle className="text-center text-foreground font-black text-xl">New Guard</CardTitle>
           <Text className="text-foreground/40 text-xs font-bold uppercase tracking-widest">Add emergency contact</Text>
        </View>

        <Input 
          placeholder="Contact Name" 
          value={newName} 
          onChangeText={setNewName} 
        />
        <Input 
          placeholder="Relationship (e.g. Wife)" 
          value={newRelation} 
          onChangeText={setNewRelation} 
        />
        <Input 
          placeholder="Phone (+91)" 
          keyboardType="phone-pad" 
          value={newPhone} 
          onChangeText={setNewPhone} 
        />
        <Button 
          title="SAVE CONTACT" 
          variant="secondary" 
          onPress={handleAdd} 
          loading={saving}
          size="lg"
          className="mt-4"
        />
      </Card>
      
      <View className="mb-12" />
    </ScrollView>
  );
};
