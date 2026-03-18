import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, Plus, Bell, Download, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface VaccineRecord {
  id: string;
  name: string;
  dateGiven?: string;
  nextDue?: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  batchNumber?: string;
  provider?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  relation: string;
}

export default function VaccinationHub() {
  const [personalVaccines, setPersonalVaccines] = useState<VaccineRecord[]>([
    {
      id: '1',
      name: 'COVID-19 (Covishield)',
      dateGiven: '2022-04-15',
      status: 'completed',
      batchNumber: '4120Z001',
      provider: 'Apollo Hospital'
    },
    {
      id: '2',
      name: 'Tetanus',
      dateGiven: '2021-09-10',
      nextDue: '2031-09-10',
      status: 'completed',
      batchNumber: 'TT2021-045'
    },
    {
      id: '3',
      name: 'Hepatitis B',
      dateGiven: '2020-03-20',
      nextDue: '2025-03-20',
      status: 'upcoming',
    },
    {
      id: '4',
      name: 'Influenza',
      nextDue: '2024-10-01',
      status: 'due',
    }
  ]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Priya Sharma', age: 28, gender: 'female', relation: 'Spouse' },
    { id: '2', name: 'Aarav Sharma', age: 5, gender: 'male', relation: 'Son' },
  ]);

  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    relation: ''
  });

  const [newVaccine, setNewVaccine] = useState({
    name: '',
    dateGiven: '',
    nextDue: '',
    batchNumber: '',
    provider: ''
  });

  const [completionPercentage] = useState(75);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'due': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'due': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'upcoming': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const addFamilyMember = () => {
    if (newMember.name && newMember.age) {
      const member: FamilyMember = {
        id: Date.now().toString(),
        name: newMember.name,
        age: parseInt(newMember.age),
        gender: newMember.gender,
        relation: newMember.relation
      };
      setFamilyMembers([...familyMembers, member]);
      setNewMember({ name: '', age: '', gender: 'male', relation: '' });
    }
  };

  const addVaccineRecord = () => {
    if (newVaccine.name && newVaccine.dateGiven) {
      const vaccine: VaccineRecord = {
        id: Date.now().toString(),
        name: newVaccine.name,
        dateGiven: newVaccine.dateGiven,
        nextDue: newVaccine.nextDue || undefined,
        status: 'completed',
        batchNumber: newVaccine.batchNumber || undefined,
        provider: newVaccine.provider || undefined
      };
      setPersonalVaccines([...personalVaccines, vaccine]);
      setNewVaccine({ name: '', dateGiven: '', nextDue: '', batchNumber: '', provider: '' });
    }
  };

  const scheduleReminder = (vaccine: VaccineRecord) => {
    alert(`Reminder set for ${vaccine.name} vaccination`);
  };

  const exportVaccineCard = () => {
    alert('Vaccination certificate exported as PDF');
  };

  const upcomingVaccines = personalVaccines.filter(v => v.status === 'due' || v.status === 'upcoming');
  const completedVaccines = personalVaccines.filter(v => v.status === 'completed');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vaccination Hub</h1>
            <p className="text-sm text-muted-foreground">Track and manage vaccinations for you and your family</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={exportVaccineCard} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Certificate
          </Button>
        </div>
      </div>

      {/* Vaccination Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Vaccination Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-2xl font-bold text-green-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedVaccines.length}</div>
                <div className="text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{upcomingVaccines.length}</div>
                <div className="text-gray-500">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{personalVaccines.length}</div>
                <div className="text-gray-500">Total Records</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">👤 Personal</TabsTrigger>
          <TabsTrigger value="family">👨‍👩‍👧‍👦 Family</TabsTrigger>
          <TabsTrigger value="schedule">📅 Schedule</TabsTrigger>
        </TabsList>

        {/* Personal Vaccinations Tab */}
        <TabsContent value="personal" className="space-y-6">
          {/* Upcoming Vaccinations */}
          {upcomingVaccines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Upcoming Vaccinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingVaccines.map((vaccine) => (
                    <motion.div
                      key={vaccine.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg bg-orange-50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(vaccine.status)}
                        <div>
                          <div className="font-semibold">{vaccine.name}</div>
                          {vaccine.nextDue && (
                            <div className="text-sm text-gray-600">
                              Due: {new Date(vaccine.nextDue).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(vaccine.status)}>
                          {vaccine.status}
                        </Badge>
                        <Button size="sm" onClick={() => scheduleReminder(vaccine)}>
                          <Bell className="w-4 h-4 mr-1" />
                          Remind
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Vaccination Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Vaccination Records
                </span>
                <Button size="sm" onClick={() => setNewVaccine({...newVaccine})}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Record
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Vaccine Form */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Add New Vaccination Record</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vaccine-name">Vaccine Name</Label>
                    <Input
                      id="vaccine-name"
                      value={newVaccine.name}
                      onChange={(e) => setNewVaccine({...newVaccine, name: e.target.value})}
                      placeholder="e.g., COVID-19, Tetanus"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-given">Date Given</Label>
                    <Input
                      id="date-given"
                      type="date"
                      value={newVaccine.dateGiven}
                      onChange={(e) => setNewVaccine({...newVaccine, dateGiven: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next-due">Next Due (Optional)</Label>
                    <Input
                      id="next-due"
                      type="date"
                      value={newVaccine.nextDue}
                      onChange={(e) => setNewVaccine({...newVaccine, nextDue: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch-number">Batch Number (Optional)</Label>
                    <Input
                      id="batch-number"
                      value={newVaccine.batchNumber}
                      onChange={(e) => setNewVaccine({...newVaccine, batchNumber: e.target.value})}
                      placeholder="Batch/Lot number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Healthcare Provider (Optional)</Label>
                    <Input
                      id="provider"
                      value={newVaccine.provider}
                      onChange={(e) => setNewVaccine({...newVaccine, provider: e.target.value})}
                      placeholder="Hospital/Clinic name"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addVaccineRecord} className="w-full">
                      Add Record
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vaccination Records List */}
              <div className="space-y-3">
                {personalVaccines.map((vaccine) => (
                  <div key={vaccine.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(vaccine.status)}
                      <div>
                        <div className="font-semibold">{vaccine.name}</div>
                        <div className="text-sm text-gray-600">
                          {vaccine.dateGiven && (
                            <>Given: {new Date(vaccine.dateGiven).toLocaleDateString()}</>
                          )}
                          {vaccine.nextDue && (
                            <span> • Next: {new Date(vaccine.nextDue).toLocaleDateString()}</span>
                          )}
                        </div>
                        {vaccine.batchNumber && (
                          <div className="text-xs text-gray-500">Batch: {vaccine.batchNumber}</div>
                        )}
                        {vaccine.provider && (
                          <div className="text-xs text-gray-500">Provider: {vaccine.provider}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(vaccine.status)}>
                        {vaccine.status}
                      </Badge>
                      {vaccine.status !== 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => scheduleReminder(vaccine)}>
                          <Bell className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Vaccinations Tab */}
        <TabsContent value="family" className="space-y-6">
          {/* Add Family Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Add Family Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="member-name">Name</Label>
                  <Input
                    id="member-name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Family member name"
                  />
                </div>
                <div>
                  <Label htmlFor="member-age">Age</Label>
                  <Input
                    id="member-age"
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label htmlFor="member-gender">Gender</Label>
                  <Select value={newMember.gender} onValueChange={(value: 'male' | 'female' | 'other') => setNewMember({...newMember, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="member-relation">Relation</Label>
                  <Input
                    id="member-relation"
                    value={newMember.relation}
                    onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
                    placeholder="Spouse, Child, etc."
                  />
                </div>
              </div>
              <Button onClick={addFamilyMember} className="w-full mt-4">
                Add Family Member
              </Button>
            </CardContent>
          </Card>

          {/* Family Members List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {member.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>Age: {member.age} years</div>
                    <div>Gender: {member.gender}</div>
                    <div>Relation: {member.relation}</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button size="sm" className="w-full">
                      View Vaccination Records
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Add Vaccination
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Vaccination Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Vaccination Calendar</h3>
                  <p className="text-gray-600 mb-4">
                    View upcoming vaccinations and schedule appointments
                  </p>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Open Calendar View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}