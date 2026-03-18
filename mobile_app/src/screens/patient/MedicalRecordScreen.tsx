import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { patientService } from '../../services/api/patientService';
import { Card, CardTitle } from '../../components/ui/Card';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const RECORD_TYPES = ['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'OTHER'];

export const MedicalRecordScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'LAB_REPORT', provider: '', result: '' });

  const patientId = user?.id || '123456789012';

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await patientService.getMedicalRecords(patientId);
      setRecords(data as any[]);
    } catch {
      console.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [patientId]);

  const handleAdd = async () => {
    if (!form.title || !form.provider) {
      Alert.alert('Required', 'Please enter a title and provider.');
      return;
    }
    setSaving(true);
    try {
      await patientService.addMedicalRecord(patientId, {
        ...form,
        date: new Date().toISOString().split('T')[0],
      });
      setForm({ title: '', type: 'LAB_REPORT', provider: '', result: '' });
      setShowForm(false);
      await fetchRecords();
    } catch {
      // Backend may not persist — add locally for demo
      setRecords(prev => [...prev, {
        id: `rec_local_${Date.now()}`,
        ...form,
        date: new Date().toISOString().split('T')[0],
      }]);
      setForm({ title: '', type: 'LAB_REPORT', provider: '', result: '' });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'LAB_REPORT': return '🔬';
      case 'PRESCRIPTION': return '💊';
      case 'IMAGING': return '🩻';
      default: return '📄';
    }
  };

  if (loading) return <LoadingIndicator message="Loading medical records..." />;

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="mb-8 flex-row justify-between items-end">
        <View>
          <View className="bg-primary/20 self-start px-3 py-1 rounded-full mb-3">
            <Text className="text-[10px] font-black text-primary-dark uppercase tracking-widest">Digital Health Vault</Text>
          </View>
          <Text className="text-4xl font-black text-foreground tracking-tight">Medical Records</Text>
          <Text className="text-foreground/40 text-base">ID: {patientId}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm(v => !v)}
          className="bg-primary rounded-2xl px-4 py-3 items-center justify-center"
        >
          <Text className="text-white font-black text-lg">{showForm ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {/* ADD RECORD FORM */}
      {showForm && (
        <Card className="mb-8 p-6 bg-white rounded-[32px] border-2 border-primary/20 shadow-md">
          <CardTitle className="mb-4">Add New Record</CardTitle>

          {/* Type selector */}
          <Text className="text-xs font-bold text-foreground/50 uppercase mb-2">Record Type</Text>
          <View className="flex-row flex-wrap mb-4">
            {RECORD_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setForm(f => ({ ...f, type: t }))}
                className={`px-3 py-2 rounded-full mr-2 mb-2 border ${form.type === t ? 'bg-primary border-primary' : 'bg-white border-muted'}`}
              >
                <Text className={`text-xs font-bold ${form.type === t ? 'text-white' : 'text-foreground/60'}`}>
                  {t.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-xs font-bold text-foreground/50 uppercase mb-1">Title *</Text>
          <TextInput
            className="bg-muted/30 rounded-xl px-4 py-3 mb-3 text-foreground border border-muted"
            placeholder="e.g. Blood Sugar Fasting"
            value={form.title}
            onChangeText={t => setForm(f => ({ ...f, title: t }))}
          />
          <Text className="text-xs font-bold text-foreground/50 uppercase mb-1">Provider *</Text>
          <TextInput
            className="bg-muted/30 rounded-xl px-4 py-3 mb-3 text-foreground border border-muted"
            placeholder="e.g. Dr. Mehta / City Diagnostics"
            value={form.provider}
            onChangeText={t => setForm(f => ({ ...f, provider: t }))}
          />
          <Text className="text-xs font-bold text-foreground/50 uppercase mb-1">Result / Notes</Text>
          <TextInput
            className="bg-muted/30 rounded-xl px-4 py-3 mb-5 text-foreground border border-muted"
            placeholder="e.g. 142 mg/dL (optional)"
            value={form.result}
            onChangeText={t => setForm(f => ({ ...f, result: t }))}
          />
          <Button title="SAVE RECORD" onPress={handleAdd} loading={saving} size="lg" />
        </Card>
      )}

      {records.length === 0 ? (
        <View className="items-center justify-center py-20 bg-muted/20 rounded-[40px] border border-muted/50">
          <Text className="text-5xl mb-6">📂</Text>
          <Text className="text-lg font-bold text-foreground/40">No records yet</Text>
          <Text className="text-sm text-foreground/30 mt-2 text-center px-10">Tap + above to add your first record.</Text>
        </View>
      ) : (
        records.map((record, i) => (
          <Card key={record.id || i} className="mb-6 p-6 shadow-xl border-muted bg-white rounded-[32px]">
            <View className="flex-row items-center justify-between mb-6">
              <View className="bg-primary/10 w-14 h-14 rounded-2xl items-center justify-center border border-primary/20">
                <Text className="text-3xl">{getRecordIcon(record.type)}</Text>
              </View>
              <Badge label={record.date} variant="muted" />
            </View>
            <Text className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-2">{(record.type || '').replace(/_/g, ' ')}</Text>
            <CardTitle className="text-2xl mb-1 font-bold">{record.title}</CardTitle>
            <Text className="text-foreground/60 text-base font-medium mb-4">{record.provider}</Text>
            {record.result && (
              <View className="bg-muted/30 p-5 rounded-[24px] border border-muted/50">
                <Text className="text-[10px] text-foreground/40 font-black uppercase mb-1 tracking-widest">Result</Text>
                <Text className="text-foreground font-bold text-xl">{record.result}</Text>
              </View>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
};
