import axios from 'axios'

const API_BASE_URL = '/api/fitness'

export interface ExerciseSession {
  id?: string
  exercise: string
  reps: number
  sets: number
  duration: number
  calories: number
  accuracy: number
  timestamp?: Date
  userId: number
}

export interface WorkoutPlan {
  id: string
  name: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  exercises: string[]
  targetMuscles: string[]
  estimatedCalories: number
  description?: string
  imageUrl?: string
}

export interface ExerciseAnalysis {
  exerciseType: string
  detectedReps: number
  accuracy: number
  formFeedback: string[]
  poseKeypoints: Record<string, number>
  analysisMethod: string
  processingTime: number
  isCorrectForm: boolean
}

export interface FitnessStats {
  totalWorkouts: number
  totalReps: number
  totalCalories: number
  totalDuration: number
  averageAccuracy: number
  exerciseFrequency: Record<string, number>
  weeklyWorkouts: number
  weeklyCalories: number
}

class FitnessService {
  // Get all workout plans
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/workout-plans`)
      return response.data
    } catch (error) {
      console.error('Error fetching workout plans:', error)
      return this.getMockWorkoutPlans()
    }
  }

  // Get specific workout plan
  async getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/workout-plans/${planId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching workout plan:', error)
      return null
    }
  }

  // Save exercise session
  async saveExerciseSession(session: ExerciseSession): Promise<ExerciseSession> {
    try {
      const response = await axios.post(`${API_BASE_URL}/sessions`, session)
      return response.data
    } catch (error) {
      console.error('Error saving exercise session:', error)
      // Save to local storage as fallback
      this.saveSessionLocally(session)
      return { ...session, id: Date.now().toString() }
    }
  }

  // Get user exercise sessions
  async getUserSessions(userId: number): Promise<ExerciseSession[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/${userId}`)
      // Convert timestamp strings to Date objects
      return response.data.map((session: any) => ({
        ...session,
        timestamp: session.timestamp ? new Date(session.timestamp) : new Date()
      }))
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      return this.getLocalSessions(userId)
    }
  }

  // Get user fitness statistics
  async getUserStats(userId: number): Promise<FitnessStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user stats:', error)
      // Return local stats as fallback
      return this.calculateLocalStats(userId)
    }
  }

  // Analyze exercise video
  async analyzeExerciseVideo(
    videoFile: File,
    exerciseType: string,
    userId: number
  ): Promise<ExerciseAnalysis> {
    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('exerciseType', exerciseType)
      formData.append('userId', userId.toString())

      const response = await axios.post(`${API_BASE_URL}/analyze-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error analyzing exercise video:', error)
      return this.getMockAnalysis(exerciseType)
    }
  }

  // Analyze exercise pose from image
  async analyzeExercisePose(
    imageFile: File,
    exerciseType: string,
    userId: number
  ): Promise<ExerciseAnalysis> {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('exerciseType', exerciseType)
      formData.append('userId', userId.toString())

      const response = await axios.post(`${API_BASE_URL}/analyze-pose`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error analyzing exercise pose:', error)
      return this.getMockAnalysis(exerciseType)
    }
  }

  // Start workout session
  async startWorkout(userId: number, workoutPlanId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/start-workout`, null, {
        params: { userId, workoutPlanId }
      })
      return response.data
    } catch (error) {
      console.error('Error starting workout:', error)
      return { success: false, message: 'Failed to start workout' }
    }
  }

  // Complete workout session
  async completeWorkout(
    userId: number,
    workoutPlanId: string,
    duration: number,
    completedExercises: number
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/complete-workout`, null, {
        params: { userId, workoutPlanId, duration, completedExercises }
      })
      return response.data
    } catch (error) {
      console.error('Error completing workout:', error)
      return { success: false, message: 'Failed to complete workout' }
    }
  }

  // Get exercise recommendations
  async getRecommendations(userId: number): Promise<WorkoutPlan[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return this.getMockWorkoutPlans()
    }
  }

  // Local storage fallback methods
  private saveSessionLocally(session: ExerciseSession): void {
    const sessions = this.getLocalSessions(session.userId)
    sessions.unshift({ ...session, id: Date.now().toString(), timestamp: new Date() })
    localStorage.setItem(`fitness_sessions_${session.userId}`, JSON.stringify(sessions))
  }

  private getLocalSessions(userId: number): ExerciseSession[] {
    const stored = localStorage.getItem(`fitness_sessions_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  private calculateLocalStats(userId: number): FitnessStats {
    const sessions = this.getLocalSessions(userId)
    
    const stats: FitnessStats = {
      totalWorkouts: sessions.length,
      totalReps: sessions.reduce((sum, s) => sum + s.reps, 0),
      totalCalories: sessions.reduce((sum, s) => sum + s.calories, 0),
      totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
      averageAccuracy: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length 
        : 0,
      exerciseFrequency: {},
      weeklyWorkouts: 0,
      weeklyCalories: 0
    }

    // Calculate exercise frequency
    sessions.forEach(session => {
      stats.exerciseFrequency[session.exercise] = 
        (stats.exerciseFrequency[session.exercise] || 0) + 1
    })

    // Calculate weekly stats (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weekSessions = sessions.filter(s => 
      s.timestamp && new Date(s.timestamp) > weekAgo
    )
    
    stats.weeklyWorkouts = weekSessions.length
    stats.weeklyCalories = weekSessions.reduce((sum, s) => sum + s.calories, 0)

    return stats
  }

  private getMockWorkoutPlans(): WorkoutPlan[] {
    return [
      {
        id: '1',
        name: 'Upper Body Strength',
        difficulty: 'Intermediate',
        duration: 30,
        exercises: ['Push-ups', 'Bicep Curls', 'Shoulder Press', 'Tricep Dips'],
        targetMuscles: ['Chest', 'Arms', 'Shoulders'],
        estimatedCalories: 250,
        description: 'Build upper body strength with this comprehensive workout'
      },
      {
        id: '2',
        name: 'Core Blast',
        difficulty: 'Beginner',
        duration: 20,
        exercises: ['Plank', 'Crunches', 'Mountain Climbers', 'Russian Twists'],
        targetMuscles: ['Core', 'Abs'],
        estimatedCalories: 180,
        description: 'Strengthen your core with these effective exercises'
      },
      {
        id: '3',
        name: 'Full Body HIIT',
        difficulty: 'Advanced',
        duration: 45,
        exercises: ['Burpees', 'Jump Squats', 'Push-ups', 'High Knees'],
        targetMuscles: ['Full Body'],
        estimatedCalories: 400,
        description: 'High-intensity interval training for maximum results'
      }
    ]
  }

  private getMockAnalysis(exerciseType: string): ExerciseAnalysis {
    return {
      exerciseType,
      detectedReps: Math.floor(Math.random() * 15) + 5,
      accuracy: 80 + Math.random() * 15,
      formFeedback: [
        'Good posture detected',
        'Keep your core engaged',
        'Maintain steady breathing'
      ],
      poseKeypoints: {},
      analysisMethod: 'mock-analysis',
      processingTime: 1000,
      isCorrectForm: Math.random() > 0.3
    }
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`)
      return response.status === 200
    } catch (error) {
      console.error('Backend connection test failed:', error)
      return false
    }
  }
}

export const fitnessService = new FitnessService()
export default fitnessService