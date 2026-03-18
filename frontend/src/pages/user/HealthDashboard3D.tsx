import React, { useState, useEffect } from 'react';
import { SimpleHeart3D } from '@/components/SimpleHeart3D';
import { Activity, Heart, Brain, Wind, Thermometer, Weight, TrendingUp, Calendar, Clock, Zap, Target, BarChart3, AlertCircle } from 'lucide-react';

interface VitalSigns {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  oxygenSaturation: number;
  temperature: number;
  weight: number;
  bmi: number;
  respiratoryRate: number;
  healthScore: number;
}

interface HealthMetrics {
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  sleepHours: number;
  waterIntake: number;
}

export default function HealthDashboard3D() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    oxygenSaturation: 98,
    temperature: 98.6,
    weight: 70,
    bmi: 22.5,
    respiratoryRate: 16,
    healthScore: 85
  });

  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    steps: 8542,
    caloriesBurned: 2150,
    activeMinutes: 45,
    sleepHours: 7.5,
    waterIntake: 2.1
  });

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Simulate live data updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setVitalSigns(prev => ({
        ...prev,
        heartRate: Math.round(Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4))),
        oxygenSaturation: Math.round(Math.max(95, Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 1))),
        temperature: Math.round((Math.max(97, Math.min(100, prev.temperature + (Math.random() - 0.5) * 0.3)) * 10)) / 10
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const getHeartRateStatus = (hr: number) => {
    const heartRate = Math.round(hr);
    if (heartRate < 60) return { status: 'Low', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (heartRate > 100) return { status: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    return { status: 'Normal', color: 'text-green-400', bgColor: 'bg-green-500/20' };
  };

  const hrStatus = getHeartRateStatus(vitalSigns.heartRate);

  // Mock analytics data
  const heartRateHistory = [
    { time: '00:00', value: 68 },
    { time: '04:00', value: 62 },
    { time: '08:00', value: 75 },
    { time: '12:00', value: 82 },
    { time: '16:00', value: 78 },
    { time: '20:00', value: 72 },
    { time: '24:00', value: 70 }
  ];

  const healthTrends = {
    heartRateVariability: 42, // ms
    restingHeartRate: 65,
    maxHeartRate: 185,
    cardioFitness: 'Good',
    stressLevel: 'Low'
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-400" />
              3D Heart Analytics
            </h1>
            <p className="text-gray-400">Real-time heart monitoring with comprehensive health analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLiveMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isLiveMode ? '🔴 Live Mode' : '⚪ Static Mode'}
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 3D Heart */}
          <div className="lg:col-span-1">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-400" />
                  Live Heart Monitor
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${hrStatus.bgColor} ${hrStatus.color}`}>
                  <Activity className="w-3 h-3 inline mr-1" />
                  {hrStatus.status}
                </div>
              </div>
              
              {/* 3D Heart - No container box */}
              <SimpleHeart3D 
                heartRate={Math.round(vitalSigns.heartRate)}
                height="h-96"
                className="mb-4"
              />
              
              {/* Heart Rate Display */}
              <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {Math.round(vitalSigns.heartRate)} <span className="text-lg text-gray-400">BPM</span>
                </div>
                <div className="text-sm text-gray-400">Current Heart Rate</div>
              </div>
            </div>
          </div>

          {/* Right Column - Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vital Signs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Blood Pressure */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Blood Pressure</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Normal</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic}
                  <span className="text-sm font-normal text-gray-400 ml-1">mmHg</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${Math.min(Math.max((vitalSigns.bloodPressure.systolic / 160) * 100, 10), 100)}%` }}></div>
                </div>
              </div>

              {/* Oxygen Saturation */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">O₂</span>
                    </div>
                    <span className="text-sm font-medium text-gray-300">Oxygen</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Excellent</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {Math.round(vitalSigns.oxygenSaturation)}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${Math.min(Math.max(Math.round(vitalSigns.oxygenSaturation), 90), 100)}%` }}></div>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium text-gray-300">Temperature</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Normal</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {vitalSigns.temperature.toFixed(1)}°F
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${Math.min(Math.max(((vitalSigns.temperature - 96) / 6) * 100, 10), 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Heart Rate Analytics */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Heart Rate Analytics
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedTimeRange('24h')}
                    className={`px-3 py-1 rounded text-xs ${selectedTimeRange === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    24h
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange('7d')}
                    className={`px-3 py-1 rounded text-xs ${selectedTimeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    7d
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange('30d')}
                    className={`px-3 py-1 rounded text-xs ${selectedTimeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    30d
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{healthTrends.restingHeartRate}</div>
                  <div className="text-xs text-gray-400">Resting HR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{healthTrends.maxHeartRate}</div>
                  <div className="text-xs text-gray-400">Max HR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{healthTrends.heartRateVariability}</div>
                  <div className="text-xs text-gray-400">HRV (ms)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{healthTrends.cardioFitness}</div>
                  <div className="text-xs text-gray-400">Cardio Fitness</div>
                </div>
              </div>

              {/* Simple Heart Rate Chart */}
              <div className="h-32 bg-gray-900 rounded-lg p-4 flex items-end justify-between">
                {heartRateHistory.map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-red-400 rounded-t w-6 transition-all duration-300"
                      style={{ height: `${Math.min(Math.max((point.value / 120) * 80, 20), 80)}px` }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-2">{point.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Insights */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI Health Insights
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Target className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-green-400">Excellent Heart Health</div>
                    <div className="text-xs text-gray-400">Your heart rate is within optimal range. Keep up the good work!</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-400">Good Recovery Rate</div>
                    <div className="text-xs text-gray-400">Your heart rate variability indicates good cardiovascular fitness.</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-400">Recommendation</div>
                    <div className="text-xs text-gray-400">Consider 30 minutes of cardio exercise 3-4 times per week to maintain heart health.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Activity */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Steps Today</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {healthMetrics.steps.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Goal: 10,000 steps</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: `${Math.min((healthMetrics.steps / 10000) * 100, 100)}%` }}></div>
            </div>
          </div>

          {/* Calories */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-gray-300">Calories</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {healthMetrics.caloriesBurned}
            </div>
            <div className="text-xs text-gray-400">Burned today</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">😴</span>
                <span className="text-sm font-medium text-gray-300">Sleep</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {healthMetrics.sleepHours}h
            </div>
            <div className="text-xs text-gray-400">Last night</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${(healthMetrics.sleepHours / 9) * 100}%` }}></div>
            </div>
          </div>

          {/* Stress Level */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Stress Level</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              Low
            </div>
            <div className="text-xs text-gray-400">Based on HRV</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}