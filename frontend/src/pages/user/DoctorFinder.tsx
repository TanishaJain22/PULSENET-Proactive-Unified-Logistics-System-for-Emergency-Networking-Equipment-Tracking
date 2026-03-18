import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Phone, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviews: number;
  hospital: string;
  location: string;
  distance: number;
  consultationFee: number;
  availability: string;
  image: string;
}

export default function DoctorFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiologist',
      qualification: 'MD, DM Cardiology',
      experience: 15,
      rating: 4.8,
      reviews: 245,
      hospital: 'Apollo Hospital',
      location: 'Indore',
      distance: 2.3,
      consultationFee: 800,
      availability: 'Available Today',
      image: '/api/placeholder/100/100'
    },
    {
      id: '2',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Neurologist',
      qualification: 'MD, DM Neurology',
      experience: 12,
      rating: 4.6,
      reviews: 189,
      hospital: 'Fortis Healthcare',
      location: 'Indore',
      distance: 3.1,
      consultationFee: 1000,
      availability: 'Tomorrow 10 AM',
      image: '/api/placeholder/100/100'
    },
    {
      id: '3',
      name: 'Dr. Anita Patel',
      specialty: 'Dermatologist',
      qualification: 'MD Dermatology',
      experience: 8,
      rating: 4.7,
      reviews: 156,
      hospital: 'Max Hospital',
      location: 'Indore',
      distance: 1.8,
      consultationFee: 600,
      availability: 'Available Now',
      image: '/api/placeholder/100/100'
    }
  ]);

  const specialties = [
    'All', 'Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 
    'Pediatrician', 'Gynecologist', 'ENT', 'Ophthalmologist', 'Psychiatrist'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doctor Finder</h1>
            <p className="text-sm text-muted-foreground">Find and book appointments with top doctors</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search doctors, specialties, or hospitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Near Me
          </Button>
        </div>
      </div>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="doctors">👨‍⚕️ Doctors</TabsTrigger>
          <TabsTrigger value="specialties">🏥 Specialties</TabsTrigger>
          <TabsTrigger value="map">🗺️ Map View</TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-4">
          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty.toLowerCase())}
                className="text-xs"
              >
                {specialty}
              </Button>
            ))}
          </div>

          {/* Doctors List */}
          <div className="grid gap-4">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Doctor Image */}
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl">👨‍⚕️</span>
                      </div>
                      
                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{doctor.name}</h3>
                            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                            <p className="text-sm text-gray-600">{doctor.qualification}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-semibold">{doctor.rating}</span>
                              <span className="text-sm text-gray-600">({doctor.reviews})</span>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              {doctor.availability}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-600">Experience</p>
                            <p className="font-medium">{doctor.experience} years</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Hospital</p>
                            <p className="font-medium">{doctor.hospital}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Distance</p>
                            <p className="font-medium">{doctor.distance} km away</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Consultation</p>
                            <p className="font-medium">₹{doctor.consultationFee}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {doctor.location}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                            <Button size="sm">
                              <Calendar className="w-4 h-4 mr-1" />
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Specialties Tab */}
        <TabsContent value="specialties" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialties.slice(1).map((specialty, index) => (
              <motion.div
                key={specialty}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">🏥</div>
                    <h3 className="font-semibold">{specialty}</h3>
                    <p className="text-sm text-gray-600">
                      {Math.floor(Math.random() * 20) + 5} doctors
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-gray-600">
                    View doctor locations and hospitals on an interactive map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}