import React, { useState, useEffect } from 'react';
import { doctorService, type Doctor } from '../services/doctorService';
import JitsiMeetConsultation from './JitsiMeetConsultation';

const IndoreDoctorFinder: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Video consultation state
  const [showVideoConsultation, setShowVideoConsultation] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState('');
  const [meetingRoom, setMeetingRoom] = useState('');

  useEffect(() => {
    loadDoctorsAndSpecializations();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [selectedSpecialization, priceRange, doctors]);

  const loadDoctorsAndSpecializations = async () => {
    try {
      setLoading(true);
      const [doctorsData, specializationsData] = await Promise.all([
        doctorService.getAllDoctors(),
        doctorService.getSpecializations()
      ]);

      setDoctors(doctorsData);
      setSpecializations(specializationsData);
      setError(null);
    } catch (err) {
      setError('Failed to load doctors. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (selectedSpecialization) {
      filtered = filtered.filter(doctor => 
        doctor.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    filtered = filtered.filter(doctor => 
      doctor.fees >= priceRange.min && doctor.fees <= priceRange.max
    );

    setFilteredDoctors(filtered);
  };

  const startVideoConsultation = (doctor: Doctor) => {
    const name = prompt('Please enter your name for the consultation:');
    if (name && name.trim()) {
      const roomName = doctorService.generateMeetingRoom(doctor.id, Date.now());
      setSelectedDoctor(doctor);
      setPatientName(name.trim());
      setMeetingRoom(roomName);
      setShowVideoConsultation(true);
    }
  };

  const endVideoConsultation = () => {
    setShowVideoConsultation(false);
    setSelectedDoctor(null);
    setPatientName('');
    setMeetingRoom('');
  };

  const bookAppointment = (doctor: Doctor) => {
    alert(`Booking appointment with ${doctor.name}\nFees: ₹${doctor.fees}\nHospital: ${doctor.hospital}`);
    // Integrate with your appointment booking system
  };

  const callDoctor = (doctor: Doctor) => {
    window.open(`tel:${doctor.phone}`, '_self');
  };

  const getAvailableSlots = (slotsString: string): string[] => {
    return slotsString ? slotsString.split(',') : [];
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  if (showVideoConsultation && selectedDoctor) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={endVideoConsultation}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            ← Back to Doctor List
          </button>
        </div>
        <JitsiMeetConsultation
          roomName={meetingRoom}
          doctorName={selectedDoctor.name}
          patientName={patientName}
          onMeetingEnd={endVideoConsultation}
          onMeetingStart={() => console.log('Meeting started')}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading top doctors in Indore...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-2">❌ Error</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDoctorsAndSpecializations}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏥 Top Doctors in Indore
        </h1>
        <p className="text-gray-600">Find and consult with verified doctors • Video consultation available</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Specialization
            </label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: ₹{priceRange.min} - ₹{priceRange.max}
            </label>
            <div className="flex space-x-2">
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value)})}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <div className="font-medium">Showing {filteredDoctors.length} doctors</div>
              <div className="text-xs">🎥 Video consultation available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-6">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Doctor Image */}
              <div className="flex-shrink-0">
                <img
                  src={doctor.image || '/default-doctor.svg'}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto lg:mx-0 border-4 border-blue-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-doctor.svg';
                  }}
                />
              </div>

              {/* Doctor Info */}
              <div className="flex-grow">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{doctor.name}</h3>
                      {doctor.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✔ Verified Doctor
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 font-semibold text-lg">{doctor.specialization}</p>
                    <p className="text-gray-600">{doctor.qualifications}</p>
                    <p className="text-gray-600">{doctor.experience} experience</p>
                  </div>
                  
                  <div className="text-right mt-4 lg:mt-0">
                    <p className="text-3xl font-bold text-green-600">₹{doctor.fees}</p>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                  </div>
                </div>

                {/* Hospital & Contact Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>🏥 Hospital:</strong> {doctor.hospital}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>📍 Address:</strong> {doctor.address}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>📞 Phone:</strong> {doctor.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>📧 Email:</strong> {doctor.email}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(doctor.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {doctor.rating} ({doctor.reviewCount} reviews)
                      </span>
                    </div>
                    {doctor.isAvailable && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        🕒 Available {doctor.nextAvailable}
                      </span>
                    )}
                  </div>
                </div>

                {/* Available Slots */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Slots Today:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableSlots(doctor.availableSlots).map((slot, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => startVideoConsultation(doctor)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    🎥 Video Consultation
                  </button>
                  <button
                    onClick={() => bookAppointment(doctor)}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    📅 Book Appointment
                  </button>
                  <button
                    onClick={() => callDoctor(doctor)}
                    className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-medium"
                  >
                    📞 Call Now
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
                    👤 View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg mb-2">No doctors found for the selected criteria.</p>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default IndoreDoctorFinder;