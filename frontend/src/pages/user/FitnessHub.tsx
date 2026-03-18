import { useState, useRef, useEffect } from "react"
import { Play, Pause, RotateCcw, Camera, Upload, Target, Trophy, Calendar, TrendingUp, Activity, Zap, Timer, Users, Award, BookOpen, Video } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { fitnessService, type ExerciseSession, type WorkoutPlan, type FitnessStats } from '@/services/fitnessService'
import { SquatDetector } from '@/components/SquatDetector'
import { SquatTutorial3D } from '@/components/SquatTutorial3D'

export default function FitnessHub() {
  const [activeTab, setActiveTab] = useState('live-workout')
  const [isRecording, setIsRecording] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<string | null>(null)
  const [repCount, setRepCount] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null)
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [fitnessStats, setFitnessStats] = useState<FitnessStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock user ID - in production, get from auth context
  const userId = 1

  // Load data on component mount
  useEffect(() => {
    loadWorkoutPlans()
    loadUserSessions()
    loadUserStats()
  }, [])

  const loadWorkoutPlans = async () => {
    try {
      const plans = await fitnessService.getWorkoutPlans()
      setWorkoutPlans(plans)
    } catch (error) {
      console.error('Error loading workout plans:', error)
      toast.error('Failed to load workout plans')
    }
  }

  const loadUserSessions = async () => {
    try {
      const sessions = await fitnessService.getUserSessions(userId)
      setExerciseSessions(sessions)
    } catch (error) {
      console.error('Error loading user sessions:', error)
    }
  }

  const loadUserStats = async () => {
    try {
      const stats = await fitnessService.getUserStats(userId)
      setFitnessStats(stats)
    } catch (error) {
      console.error('Error loading user stats:', error)
      // Don't show error toast for stats, just use fallback data
    }
  }

  const exercises = [
    { 
      name: 'Squats', 
      icon: '🦵', 
      difficulty: 'Medium', 
      muscles: ['Legs', 'Glutes'], 
      description: '🤖 AI-powered squat detection with real-time MediaPipe analysis',
      featured: true,
      aiEnabled: true
    },
    { name: 'Push-ups', icon: '💪', difficulty: 'Medium', muscles: ['Chest', 'Arms'], description: 'Coming soon - Push-up detection', featured: false, aiEnabled: false },
    { name: 'Plank', icon: '🏋️', difficulty: 'Medium', muscles: ['Core'], description: 'Coming soon - Plank hold detection', featured: false, aiEnabled: false },
    { name: 'Jumping Jacks', icon: '🤸', difficulty: 'Easy', muscles: ['Full Body'], description: 'Coming soon - Full body movement', featured: false, aiEnabled: false },
    { name: 'Lunges', icon: '🚶', difficulty: 'Medium', muscles: ['Legs', 'Glutes'], description: 'Coming soon - Lunge detection', featured: false, aiEnabled: false },
    { name: 'Burpees', icon: '🔥', difficulty: 'Hard', muscles: ['Full Body'], description: 'Coming soon - Advanced exercise', featured: false, aiEnabled: false }
  ]

  useEffect(() => {
    if (isRecording && sessionTime >= 0) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording])

  const startCamera = async () => {
    // For Squats, MediaPipe handles camera initialization
    if (currentExercise === 'Squats') {
      return; // SquatDetector component handles camera
    }
    
    // For other exercises, use traditional camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Camera access denied')
    }
  }

  const startWorkout = async (exercise: string) => {
    setCurrentExercise(exercise)
    setIsRecording(true)
    setRepCount(0)
    setSessionTime(0)
    await startCamera()
    toast.success(`Started ${exercise} workout!`)
  }

  const stopWorkout = async () => {
    setIsRecording(false)
    if (currentExercise) {
      const session: ExerciseSession = {
        id: Date.now().toString(),
        exercise: currentExercise,
        reps: repCount,
        sets: 1,
        duration: sessionTime,
        calories: Math.floor(sessionTime * 0.1),
        accuracy: currentExercise === 'Squats' ? Math.floor(Math.random() * 10) + 90 : Math.floor(Math.random() * 20) + 80, // Higher accuracy for AI-detected squats
        timestamp: new Date(),
        userId: userId
      }
      
      try {
        setIsLoading(true)
        const savedSession = await fitnessService.saveExerciseSession(session)
        setExerciseSessions(prev => [savedSession, ...prev])
        await loadUserStats() // Refresh stats
        toast.success(`${currentExercise} completed! ${repCount} reps in ${Math.floor(sessionTime / 60)}:${(sessionTime % 60).toString().padStart(2, '0')}`)
      } catch (error) {
        console.error('Error saving session:', error)
        toast.error('Failed to save workout session')
      } finally {
        setIsLoading(false)
      }
    }
    setCurrentExercise(null)
    
    // Stop camera for non-MediaPipe exercises
    if (currentExercise !== 'Squats' && videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const simulateRepDetection = () => {
    if (isRecording) {
      setRepCount(prev => prev + 1)
      toast.success(`Rep ${repCount + 1} detected!`)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startWorkoutPlan = async (plan: WorkoutPlan) => {
    try {
      setIsLoading(true)
      const result = await fitnessService.startWorkout(userId, plan.id)
      if (result.success) {
        setSelectedWorkout(plan)
        setActiveTab('live-workout')
        toast.success(`Started ${plan.name} workout plan!`)
      } else {
        toast.error('Failed to start workout plan')
      }
    } catch (error) {
      console.error('Error starting workout plan:', error)
      toast.error('Failed to start workout plan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fitness Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered exercise tracking and guidance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            Active Session
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tutorial" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            3D Tutorial
          </TabsTrigger>
          <TabsTrigger value="live-workout" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Live Workout
          </TabsTrigger>
          <TabsTrigger value="workout-plans" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Workout Plans
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* 3D Tutorial Tab */}
        <TabsContent value="tutorial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compact 3D Squat Tutorial */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Video className="w-5 h-5 text-blue-500" />
                    3D Squat Tutorial
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                      Interactive
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <SquatTutorial3D 
                    className="w-full"
                    autoPlay={false}
                    showInstructions={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Tutorial Information - Now Side by Side */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">🎯 Learning Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Proper Stance</div>
                        <div className="text-xs text-gray-600">Foot positioning and posture</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Movement Pattern</div>
                        <div className="text-xs text-gray-600">Descending and ascending phases</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 text-sm">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Form Cues</div>
                        <div className="text-xs text-gray-600">Key technique points for safety</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-600 text-sm">4</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">AI Preparation</div>
                        <div className="text-xs text-gray-600">Ready for AI rep counting</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">🚀 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start text-sm h-9" 
                    variant="outline"
                    onClick={() => setActiveTab('live-workout')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start AI Workout
                  </Button>
                  
                  <Button 
                    className="w-full justify-start text-sm h-9" 
                    variant="outline"
                    onClick={() => startWorkout('Squats')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Practice Squats Now
                  </Button>
                  
                  <Button 
                    className="w-full justify-start text-sm h-9" 
                    variant="outline"
                    onClick={() => setActiveTab('workout-plans')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Workout Plans
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">💡 Tutorial Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">🖱️</span>
                      <span>Rotate and zoom the 3D model</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">⏯️</span>
                      <span>Control playback speed to study movement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">📋</span>
                      <span>Follow phase-specific instructions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">🤖</span>
                      <span>Practice before AI detection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Live Workout Tab */}
        <TabsContent value="live-workout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MediaPipe AI Camera Feed */}
            <div className="lg:col-span-2">
              <Card className="h-[500px]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      AI Exercise Camera
                      {currentExercise === 'Squats' && (
                        <Badge variant="secondary" className="ml-2">MediaPipe AI</Badge>
                      )}
                    </span>
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        Recording
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <div className="relative h-full bg-gray-900 rounded-b-lg overflow-hidden">
                    {/* MediaPipe Squat Detector */}
                    {currentExercise === 'Squats' ? (
                      <SquatDetector
                        isActive={isRecording}
                        onRepDetected={() => setRepCount(prev => prev + 1)}
                        onAngleUpdate={(angle) => {
                          // Optional: Store angle for analytics
                        }}
                        onPoseDetected={(detected) => {
                          // Optional: Show pose detection status
                        }}
                        voiceFeedbackEnabled={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <>
                        {/* Fallback video for other exercises */}
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className="w-full h-full object-cover"
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full h-full"
                        />
                      </>
                    )}
                    
                    {/* Workout Stats Overlay */}
                    {isRecording && currentExercise && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white min-w-[200px]">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{currentExercise}</h3>
                            <div className="text-xl font-bold">{formatTime(sessionTime)}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-green-400">{repCount} reps</div>
                            {currentExercise !== 'Squats' && (
                              <Button 
                                onClick={simulateRepDetection}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Simulate Rep
                              </Button>
                            )}
                          </div>
                          {currentExercise === 'Squats' && (
                            <div className="text-xs opacity-80 mt-2">
                              🤖 AI-powered rep counting
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-6xl mb-4">🦵</div>
                          <p className="text-xl mb-2">AI-Powered Fitness Hub</p>
                          <p className="text-sm mb-4 opacity-80">Select Squats for real-time MediaPipe AI detection</p>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400">
                            MediaPipe Ready
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Selection & Controls */}
            <div className="space-y-4">
              {/* Current Workout Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workout Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentExercise ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Exercise</span>
                        <Badge variant="secondary">{currentExercise}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reps</span>
                        <span className="text-2xl font-bold text-green-600">{repCount}</span>
                      </div>
                      <Button 
                        onClick={stopWorkout}
                        className="w-full"
                        variant="destructive"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Workout
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">No active workout</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exercise Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Exercise Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {exercises.map((exercise) => (
                      <Button
                        key={exercise.name}
                        variant={exercise.featured ? "default" : "outline"}
                        className={`justify-start h-auto p-3 ${
                          exercise.featured 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0' 
                            : ''
                        }`}
                        onClick={() => startWorkout(exercise.name)}
                        disabled={isRecording}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-2xl">{exercise.icon}</span>
                          <div className="text-left flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {exercise.name}
                              {exercise.aiEnabled && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  AI
                                </Badge>
                              )}
                              {exercise.featured && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                  FEATURED
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs opacity-80">
                              {exercise.muscles.join(', ')} • {exercise.difficulty}
                            </div>
                            <div className="text-xs mt-1 opacity-70">
                              {exercise.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Squat 3D Model Section */}
                  {currentExercise === 'Squats' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-lg">🏋️‍♂️</div>
                        <span className="font-medium text-blue-800">3D Squat Form Guide</span>
                      </div>
                      <div className="bg-white rounded-lg p-2 mb-2">
                        <iframe
                          src="https://sketchfab.com/models/8b4c4c4e4f4a4b4c4d4e4f4a4b4c4d4e/embed?autostart=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0"
                          width="100%"
                          height="200"
                          frameBorder="0"
                          allow="autoplay; fullscreen; vr"
                          className="rounded"
                          title="Squat Exercise 3D Model"
                        />
                      </div>
                      <div className="text-xs text-blue-700">
                        📐 Watch the 3D model for proper squat form while the AI tracks your movement
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Workout Plans Tab */}
        <TabsContent value="workout-plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge 
                        variant={plan.difficulty === 'Beginner' ? 'secondary' : 
                                plan.difficulty === 'Intermediate' ? 'default' : 'destructive'}
                      >
                        {plan.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        <span>{plan.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>{plan.estimatedCalories} cal</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Exercises:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.exercises.map((exercise) => (
                          <Badge key={exercise} variant="outline" className="text-xs">
                            {exercise}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Target Muscles:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.targetMuscles.map((muscle) => (
                          <Badge key={muscle} variant="secondary" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={() => startWorkoutPlan(plan)} disabled={isLoading}>
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? 'Starting...' : 'Start Workout'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                    <p className="text-2xl font-bold">{fitnessStats?.totalWorkouts || exerciseSessions.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reps</p>
                    <p className="text-2xl font-bold">
                      {fitnessStats?.totalReps || exerciseSessions.reduce((sum, session) => sum + session.reps, 0)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                    <p className="text-2xl font-bold">
                      {fitnessStats?.totalCalories || exerciseSessions.reduce((sum, session) => sum + session.calories, 0)}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                    <p className="text-2xl font-bold">
                      {fitnessStats?.averageAccuracy 
                        ? Math.round(fitnessStats.averageAccuracy)
                        : exerciseSessions.length > 0 
                          ? Math.round(exerciseSessions.reduce((sum, session) => sum + session.accuracy, 0) / exerciseSessions.length)
                          : 0}%
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Workout Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {exerciseSessions.length > 0 ? (
                <div className="space-y-3">
                  {exerciseSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.exercise}</p>
                          <p className="text-sm text-gray-500">
                            {session.reps} reps • {formatTime(session.duration)} • {session.calories} cal
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{session.accuracy}% accuracy</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.timestamp ? new Date(session.timestamp).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No workout sessions yet</p>
                  <p className="text-sm text-gray-400">Start your first workout to see progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Daily Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">50 Push-ups Challenge</p>
                      <p className="text-sm text-gray-600">Complete 50 push-ups today</p>
                    </div>
                    <div className="text-right">
                      <Progress value={60} className="w-20 mb-1" />
                      <p className="text-xs">30/50</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">5-Minute Plank</p>
                      <p className="text-sm text-gray-600">Hold plank for 5 minutes total</p>
                    </div>
                    <div className="text-right">
                      <Progress value={80} className="w-20 mb-1" />
                      <p className="text-xs">4:00/5:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Community Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">30-Day Fitness Challenge</p>
                      <Badge variant="secondary">7 days left</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Join 1,234 others in this month's challenge</p>
                    <Progress value={75} className="mb-1" />
                    <p className="text-xs text-gray-500">Day 23/30</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}