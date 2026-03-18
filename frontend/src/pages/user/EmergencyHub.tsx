import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Siren, AlertTriangle, Plus, Trash2, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface AmbulanceLocation {
  id: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'en-route';
}

export default function EmergencyHub() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Riya Sharma', phone: '+91 98765 43210', relation: 'Spouse' },
    { id: '2', name: 'Arjun Verma', phone: '+91 91234 56780', relation: 'Brother' },
    { id: '3', name: 'Dr. Priya Singh', phone: '+91 90000 00000', relation: 'Family Doctor' },
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);

  // Mock ambulance locations
  const [ambulances] = useState<AmbulanceLocation[]>([
    { id: 'AMB001', lat: 22.7196, lng: 75.8577, status: 'available' },
    { id: 'AMB002', lat: 22.7150, lng: 75.8600, status: 'available' },
    { id: 'AMB003', lat: 22.7250, lng: 75.8500, status: 'busy' },
  ]);

  const sosButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Indore coordinates
          setUserLocation([22.7196, 75.8577]);
        }
      );
    } else {
      setUserLocation([22.7196, 75.8577]);
    }
  }, []);

  const handleSOS = () => {
    setSosActive(true);
    // Simulate emergency alert
    setTimeout(() => {
      setSosActive(false);
      alert('Emergency alert sent to all contacts and emergency services!');
    }, 3000);
  };

  const requestAmbulance = () => {
    setAmbulanceRequested(true);
    setAmbulanceETA(8); // 8 minutes ETA
    
    // Simulate ETA countdown
    const interval = setInterval(() => {
      setAmbulanceETA((prev) => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(interval);
          setAmbulanceRequested(false);
          alert('Ambulance has arrived!');
          return null;
        }
      });
    }, 60000); // Update every minute (for demo, using shorter interval)
  };

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact
      };
      setEmergencyContacts([...emergencyContacts, contact]);
      setNewContact({ name: '', phone: '', relation: '' });
    }
  };

  const removeContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const notifyContact = async (contact: EmergencyContact) => {
    // Simulate sending notification
    alert(`Emergency notification sent to ${contact.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Emergency Hub</h1>
            <p className="text-sm text-muted-foreground">Quick access to emergency services and contacts</p>
          </div>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <MapPin className="w-4 h-4" />
            Location Active
          </div>
        )}
      </div>

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SOS Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            ref={sosButtonRef}
            onClick={handleSOS}
            disabled={sosActive}
            className={`w-full h-24 text-xl font-bold ${
              sosActive 
                ? 'bg-red-700 animate-pulse' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {sosActive ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="flex items-center gap-2"
              >
                <Siren className="w-8 h-8" />
                SENDING SOS...
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                EMERGENCY SOS
              </div>
            )}
          </Button>
        </motion.div>

        {/* Call 112 */}
        <Button
          onClick={() => window.location.href = 'tel:112'}
          className="w-full h-24 bg-orange-600 hover:bg-orange-700 text-xl font-bold"
        >
          <div className="flex items-center gap-2">
            <Phone className="w-8 h-8" />
            CALL 112
          </div>
        </Button>

        {/* Request Ambulance */}
        <Button
          onClick={requestAmbulance}
          disabled={ambulanceRequested}
          className={`w-full h-24 text-xl font-bold ${
            ambulanceRequested 
              ? 'bg-blue-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {ambulanceRequested ? (
            <div className="flex flex-col items-center">
              <Siren className="w-8 h-8 mb-1" />
              <div>ETA: {ambulanceETA} min</div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Siren className="w-8 h-8" />
              REQUEST AMBULANCE
            </div>
          )}
        </Button>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map">🗺️ Emergency Map</TabsTrigger>
          <TabsTrigger value="contacts">👥 Emergency Contacts</TabsTrigger>
          <TabsTrigger value="services">🏥 Emergency Services</TabsTrigger>
        </TabsList>

        {/* Emergency Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Emergency Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 rounded-lg overflow-hidden">
                {userLocation && (
                  <MapContainer
                    center={userLocation}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* User Location */}
                    <Marker position={userLocation}>
                      <Popup>Your Location</Popup>
                    </Marker>
                    
                    {/* Ambulance Locations */}
                    {ambulances.map((ambulance) => (
                      <Marker
                        key={ambulance.id}
                        position={[ambulance.lat, ambulance.lng]}
                      >
                        <Popup>
                          <div>
                            <strong>{ambulance.id}</strong><br />
                            Status: {ambulance.status}<br />
                            <Button size="sm" onClick={() => requestAmbulance()}>
                              Request This Ambulance
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          {/* Add New Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="relation">Relation</Label>
                  <Input
                    id="relation"
                    value={newContact.relation}
                    onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                    placeholder="Spouse, Parent, etc."
                  />
                </div>
              </div>
              <Button onClick={addEmergencyContact} className="w-full">
                Add Contact
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Contacts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.relation}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContact(contact.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => callContact(contact.phone)}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => notifyContact(contact)}
                      className="flex-1"
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Notify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Emergency Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Numbers */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { service: 'Emergency Services', number: '112', color: 'bg-red-600' },
                  { service: 'Ambulance', number: '102', color: 'bg-blue-600' },
                  { service: 'Fire Brigade', number: '101', color: 'bg-orange-600' },
                  { service: 'Police', number: '100', color: 'bg-gray-600' },
                ].map((service) => (
                  <div key={service.number} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{service.service}</div>
                      <div className="text-sm text-gray-600">{service.number}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `tel:${service.number}`}
                      className={service.color}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Nearby Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle>Nearby Hospitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Apollo Hospital', distance: '2.1 km', phone: '+91 98765 00001' },
                  { name: 'Fortis Healthcare', distance: '3.5 km', phone: '+91 98765 00002' },
                  { name: 'Max Hospital', distance: '4.2 km', phone: '+91 98765 00003' },
                ].map((hospital) => (
                  <div key={hospital.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{hospital.name}</div>
                      <div className="text-sm text-gray-600">{hospital.distance}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `tel:${hospital.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}