import React, { useState, useEffect } from 'react';
import { Brain, Heart, Smile, TrendingUp, Calendar, Target, Zap, Award, Activity, ClipboardList, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  stress: number;
}

interface ScreeningResult {
  phq9: number;
  gad7: number;
  ghq12: number;
  completedAt: string;
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe';
}

interface Exercise {
  id: string;
  name: string;
  type: 'breathing' | 'meditation' | 'progressive_relaxation' | 'mindfulness';
  duration: number;
  description: string;
  instructions: string[];
}

export default function MentalWellness() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isExerciseRunning, setIsExerciseRunning] = useState(false);
  const [currentScreening, setCurrentScreening] = useState<'phq9' | 'gad7' | 'ghq12' | null>(null);
  const [screeningAnswers, setScreeningAnswers] = useState<number[]>([]);

  // Mock data
  const mentalHealthScore = 82;
  const weeklyProgress = 15;
  const currentStreak = 7;
  const totalSessions = 24;

  // Mock screening results
  const latestScreening: ScreeningResult = {
    phq9: 6,
    gad7: 4,
    ghq12: 8,
    completedAt: new Date().toISOString(),
    riskLevel: 'mild'
  };

  // Timer effect for exercises
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExerciseRunning && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer(prev => prev - 1);
      }, 1000);
    } else if (exerciseTimer === 0) {
      setIsExerciseRunning(false);
    }
    return () => clearInterval(interval);
  }, [isExerciseRunning, exerciseTimer]);
  const exercises: Exercise[] = [
    {
      id: '1',
      name: '4-7-8 Breathing',
      type: 'breathing',
      duration: 300, // 5 minutes
      description: 'A calming breathing technique to reduce anxiety and promote relaxation',
      instructions: [
        'Sit comfortably with your back straight',
        'Exhale completely through your mouth',
        'Inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat this cycle 4 times'
      ]
    },
    {
      id: '2',
      name: 'Body Scan Meditation',
      type: 'meditation',
      duration: 600, // 10 minutes
      description: 'Progressive body awareness meditation to release tension',
      instructions: [
        'Lie down comfortably on your back',
        'Close your eyes and take deep breaths',
        'Start by focusing on your toes',
        'Slowly move attention up through each body part',
        'Notice any tension and consciously relax',
        'End at the top of your head'
      ]
    },
    {
      id: '3',
      name: 'Progressive Muscle Relaxation',
      type: 'progressive_relaxation',
      duration: 900, // 15 minutes
      description: 'Systematic tensing and relaxing of muscle groups',
      instructions: [
        'Find a quiet, comfortable place to sit or lie down',
        'Start with your feet - tense for 5 seconds, then relax',
        'Move up to your calves, thighs, abdomen',
        'Continue with hands, arms, shoulders, neck',
        'Finish with facial muscles',
        'Notice the contrast between tension and relaxation'
      ]
    },
    {
      id: '4',
      name: 'Mindful Walking',
      type: 'mindfulness',
      duration: 1200, // 20 minutes
      description: 'Walking meditation to connect with the present moment',
      instructions: [
        'Choose a quiet path 10-20 steps long',
        'Walk slowly and deliberately',
        'Focus on the sensation of your feet touching the ground',
        'Notice your surroundings without judgment',
        'When your mind wanders, gently return focus to walking',
        'Turn around mindfully at each end'
      ]
    }
  ];
  // PHQ-9 Questions
  const phq9Questions = [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself or that you are a failure',
    'Trouble concentrating on things',
    'Moving or speaking slowly, or being fidgety/restless',
    'Thoughts that you would be better off dead or hurting yourself'
  ];

  // GAD-7 Questions
  const gad7Questions = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen'
  ];

  // GHQ-12 Questions
  const ghq12Questions = [
    'Been able to concentrate on whatever you\'re doing',
    'Lost much sleep over worry',
    'Felt that you were playing a useful part in things',
    'Felt capable of making decisions about things',
    'Felt constantly under strain',
    'Felt you couldn\'t overcome your difficulties',
    'Been able to enjoy your normal day-to-day activities',
    'Been able to face up to your problems',
    'Been feeling unhappy or depressed',
    'Been losing confidence in yourself',
    'Been thinking of yourself as a worthless person',
    'Been feeling reasonably happy, all things considered'
  ];

  const screeningOptions = [
    { value: 0, label: 'Not at all' },
    { value: 1, label: 'Several days' },
    { value: 2, label: 'More than half the days' },
    { value: 3, label: 'Nearly every day' }
  ];
  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Low', color: 'bg-red-100 text-red-600' },
    { value: 2, emoji: '😔', label: 'Low', color: 'bg-orange-100 text-orange-600' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-100 text-yellow-600' },
    { value: 4, emoji: '😊', label: 'Good', color: 'bg-green-100 text-green-600' },
    { value: 5, emoji: '😄', label: 'Excellent', color: 'bg-emerald-100 text-emerald-600' },
  ];

  const weeklyMoodData = [
    { day: 'Mon', mood: 4, energy: 3, stress: 2 },
    { day: 'Tue', mood: 3, energy: 4, stress: 3 },
    { day: 'Wed', mood: 5, energy: 5, stress: 1 },
    { day: 'Thu', mood: 4, energy: 4, stress: 2 },
    { day: 'Fri', mood: 5, energy: 4, stress: 2 },
    { day: 'Sat', mood: 4, energy: 5, stress: 1 },
    { day: 'Sun', mood: 4, energy: 3, stress: 2 },
  ];

  const activities = [
    { name: 'Meditation', icon: '🧘', duration: '10 min', completed: true },
    { name: 'Breathing Exercise', icon: '🫁', duration: '5 min', completed: true },
    { name: 'Gratitude Journal', icon: '📝', duration: '15 min', completed: false },
    { name: 'Mindful Walk', icon: '🚶', duration: '20 min', completed: false },
  ];

  const insights = [
    {
      type: 'positive',
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      title: 'Mood Improving',
      description: 'Your mood has been consistently good this week. Keep up the great work!'
    },
    {
      type: 'suggestion',
      icon: <Target className="w-5 h-5 text-blue-500" />,
      title: 'Stress Management',
      description: 'Consider trying breathing exercises when stress levels are high.'
    },
    {
      type: 'achievement',
      icon: <Award className="w-5 h-5 text-purple-500" />,
      title: 'Weekly Goal Achieved',
      description: 'You completed 5 out of 5 mindfulness sessions this week!'
    }
  ];
  const startExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setExerciseTimer(exercise.duration);
    setIsExerciseRunning(true);
  };

  const toggleExercise = () => {
    setIsExerciseRunning(!isExerciseRunning);
  };

  const resetExercise = () => {
    if (currentExercise) {
      setExerciseTimer(currentExercise.duration);
      setIsExerciseRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startScreening = (type: 'phq9' | 'gad7' | 'ghq12') => {
    setCurrentScreening(type);
    setScreeningAnswers([]);
  };

  const answerScreeningQuestion = (questionIndex: number, answer: number) => {
    const newAnswers = [...screeningAnswers];
    newAnswers[questionIndex] = answer;
    setScreeningAnswers(newAnswers);
  };

  const calculateScreeningScore = () => {
    return screeningAnswers.reduce((sum, answer) => sum + answer, 0);
  };

  const getScreeningInterpretation = (score: number, type: string) => {
    if (type === 'phq9') {
      if (score <= 4) return { level: 'Minimal', color: 'text-green-600', bg: 'bg-green-100' };
      if (score <= 9) return { level: 'Mild', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      if (score <= 14) return { level: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-100' };
      if (score <= 19) return { level: 'Moderately Severe', color: 'text-red-600', bg: 'bg-red-100' };
      return { level: 'Severe', color: 'text-red-800', bg: 'bg-red-200' };
    }
    if (type === 'gad7') {
      if (score <= 4) return { level: 'Minimal', color: 'text-green-600', bg: 'bg-green-100' };
      if (score <= 9) return { level: 'Mild', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      if (score <= 14) return { level: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-100' };
      return { level: 'Severe', color: 'text-red-600', bg: 'bg-red-100' };
    }
    if (type === 'ghq12') {
      if (score <= 2) return { level: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' };
      if (score <= 5) return { level: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      return { level: 'High Risk', color: 'text-red-600', bg: 'bg-red-100' };
    }
    return { level: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-purple-500" />
              Mental Wellness
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Track your mental health and build healthy habits</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentStreak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'dashboard', label: '🏠 Dashboard', icon: Activity },
            { id: 'screening', label: '📋 Screening', icon: ClipboardList },
            { id: 'exercises', label: '🧘 Exercises', icon: Heart },
            { id: 'mood', label: '😊 Mood Tracker', icon: Smile }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Mental Health Score */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Mental Health Score
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedTimeRange('7d')}
                      className={`px-3 py-1 rounded text-xs ${selectedTimeRange === '7d' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      7d
                    </button>
                    <button 
                      onClick={() => setSelectedTimeRange('30d')}
                      className={`px-3 py-1 rounded text-xs ${selectedTimeRange === '30d' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      30d
                    </button>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{mentalHealthScore}/100</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Wellness Score</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{weeklyProgress} this week</span>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="text-purple-500"
                        strokeDasharray={`${(mentalHealthScore / 100) * 314} 314`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600">{mentalHealthScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Screening Results */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
                  Latest Screening Results
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{latestScreening.phq9}/27</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">PHQ-9 Score</div>
                    <div className="text-xs text-green-600">Depression: Mild</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{latestScreening.gad7}/21</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">GAD-7 Score</div>
                    <div className="text-xs text-green-600">Anxiety: Minimal</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{latestScreening.ghq12}/36</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">GHQ-12 Score</div>
                    <div className="text-xs text-yellow-600">Risk: Moderate</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setActiveTab('screening')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Take New Assessment
                  </button>
                </div>
              </div>
            </div>
            {/* Right Column - Activities & Insights */}
            <div className="space-y-6">
              {/* Daily Activities */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  Today's Activities
                </h3>
                
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{activity.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{activity.name}</div>
                          <div className="text-xs text-gray-500">{activity.duration}</div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        activity.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {activity.completed && (
                          <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Progress: <span className="font-semibold text-green-600">2/4 completed</span>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Insights & Tips
                </h3>
                
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {insight.icon}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{insight.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('exercises')}
                    className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-purple-700 dark:text-purple-300">🧘 Start Meditation</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">5-minute guided session</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('exercises')}
                    className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-blue-700 dark:text-blue-300">🫁 Breathing Exercise</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Reduce stress and anxiety</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('mood')}
                    className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-green-700 dark:text-green-300">📝 Log Mood</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Track your daily mood</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Screening Tab */}
        {activeTab === 'screening' && (
          <div className="space-y-6">
            {!currentScreening ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PHQ-9 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PHQ-9</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Patient Health Questionnaire for Depression Screening
                    </p>
                    <div className="text-xs text-gray-500 mb-4">9 questions • 5 minutes</div>
                    <button
                      onClick={() => startScreening('phq9')}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Start PHQ-9
                    </button>
                  </div>
                </div>

                {/* GAD-7 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GAD-7</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Generalized Anxiety Disorder Assessment
                    </p>
                    <div className="text-xs text-gray-500 mb-4">7 questions • 3 minutes</div>
                    <button
                      onClick={() => startScreening('gad7')}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Start GAD-7
                    </button>
                  </div>
                </div>

                {/* GHQ-12 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GHQ-12</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      General Health Questionnaire for Overall Wellbeing
                    </p>
                    <div className="text-xs text-gray-500 mb-4">12 questions • 5 minutes</div>
                    <button
                      onClick={() => startScreening('ghq12')}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Start GHQ-12
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentScreening === 'phq9' && 'PHQ-9 Depression Screening'}
                    {currentScreening === 'gad7' && 'GAD-7 Anxiety Assessment'}
                    {currentScreening === 'ghq12' && 'GHQ-12 General Health Questionnaire'}
                  </h3>
                  <button
                    onClick={() => setCurrentScreening(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-6">
                  {(currentScreening === 'phq9' ? phq9Questions : 
                    currentScreening === 'gad7' ? gad7Questions : ghq12Questions).map((question, index) => (
                    <div key={index} className="space-y-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {index + 1}. Over the last 2 weeks, how often have you been bothered by {question}?
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        {screeningOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => answerScreeningQuestion(index, option.value)}
                            className={`p-3 text-sm rounded-lg border transition-colors ${
                              screeningAnswers[index] === option.value
                                ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:border-purple-400 dark:text-purple-300'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {screeningAnswers.length === (currentScreening === 'phq9' ? 9 : currentScreening === 'gad7' ? 7 : 12) && (
                    <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {calculateScreeningScore()}/{currentScreening === 'phq9' ? 27 : currentScreening === 'gad7' ? 21 : 36}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {currentScreening?.toUpperCase()} Score
                        </div>
                        {(() => {
                          const interpretation = getScreeningInterpretation(calculateScreeningScore(), currentScreening!);
                          return (
                            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${interpretation.bg} ${interpretation.color}`}>
                              {interpretation.level}
                            </div>
                          );
                        })()}
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          Assessment completed. Results saved to your profile.
                        </div>
                        <button
                          onClick={() => setCurrentScreening(null)}
                          className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Complete Assessment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {!currentExercise ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{exercise.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{exercise.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>⏱️ {Math.floor(exercise.duration / 60)} minutes</span>
                          <span className="capitalize">🧘 {exercise.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Instructions:</div>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {exercise.instructions.slice(0, 3).map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                        {exercise.instructions.length > 3 && (
                          <li className="text-gray-500">... and {exercise.instructions.length - 3} more steps</li>
                        )}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => startExercise(exercise)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Exercise
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{currentExercise.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{currentExercise.description}</p>
                  
                  {/* Timer Display */}
                  <div className="mb-8">
                    <div className="text-6xl font-bold text-purple-600 mb-2">
                      {formatTime(exerciseTimer)}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${((currentExercise.duration - exerciseTimer) / currentExercise.duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Exercise Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <button
                      onClick={resetExercise}
                      className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <RotateCcw className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <button
                      onClick={toggleExercise}
                      className="p-4 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                    >
                      {isExerciseRunning ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </button>
                    
                    <button className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors">
                      <Volume2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Follow these steps:</h4>
                    <ol className="space-y-3">
                      {currentExercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={() => setCurrentExercise(null)}
                    className="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    End Exercise
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Mood Tracker Tab */}
        {activeTab === 'mood' && (
          <div className="space-y-6">
            {/* Mood Entry */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Smile className="w-5 h-5 mr-2 text-yellow-500" />
                How are you feeling today?
              </h3>
              
              <div className="flex justify-center space-x-4 mb-6">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{mood.label}</div>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="text-center">
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    Save Mood Entry
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Mood Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Weekly Mood Trends
              </h3>
              
              <div className="grid grid-cols-7 gap-2">
                {weeklyMoodData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{day.day}</div>
                    <div className="space-y-1">
                      <div 
                        className="bg-purple-400 rounded-full mx-auto transition-all"
                        style={{ 
                          height: `${day.mood * 8}px`, 
                          width: '8px' 
                        }}
                      ></div>
                      <div className="text-xs text-gray-600">{day.mood}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average mood: <span className="font-semibold text-purple-600">4.1/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}