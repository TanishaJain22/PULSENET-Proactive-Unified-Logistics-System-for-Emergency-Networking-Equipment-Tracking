package com.healthcare.service;

import com.healthcare.dto.ExerciseSessionDTO;
import com.healthcare.dto.WorkoutPlanDTO;
import com.healthcare.dto.ExerciseAnalysisDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FitnessService {
    
    private static final Logger logger = LoggerFactory.getLogger(FitnessService.class);
    
    @Autowired
    private ExerciseAIService exerciseAIService;
    
    // In-memory storage for demo (replace with database in production)
    private final Map<Long, List<ExerciseSessionDTO>> userSessions = new HashMap<>();
    private final List<WorkoutPlanDTO> workoutPlans = new ArrayList<>();
    
    public FitnessService() {
        initializeWorkoutPlans();
    }
    
    private void initializeWorkoutPlans() {
        workoutPlans.add(new WorkoutPlanDTO(
            "1", "Upper Body Strength", "Intermediate", 30,
            Arrays.asList("Push-ups", "Bicep Curls", "Shoulder Press", "Tricep Dips"),
            Arrays.asList("Chest", "Arms", "Shoulders"),
            250, "Build upper body strength with this comprehensive workout", null
        ));
        
        workoutPlans.add(new WorkoutPlanDTO(
            "2", "Core Blast", "Beginner", 20,
            Arrays.asList("Plank", "Crunches", "Mountain Climbers", "Russian Twists"),
            Arrays.asList("Core", "Abs"),
            180, "Strengthen your core with these effective exercises", null
        ));
        
        workoutPlans.add(new WorkoutPlanDTO(
            "3", "Full Body HIIT", "Advanced", 45,
            Arrays.asList("Burpees", "Jump Squats", "Push-ups", "High Knees"),
            Arrays.asList("Full Body"),
            400, "High-intensity interval training for maximum results", null
        ));
        
        workoutPlans.add(new WorkoutPlanDTO(
            "4", "Cardio Burn", "Intermediate", 25,
            Arrays.asList("Jumping Jacks", "High Knees", "Butt Kicks", "Mountain Climbers"),
            Arrays.asList("Cardiovascular"),
            300, "Get your heart pumping with this cardio-focused workout", null
        ));
        
        workoutPlans.add(new WorkoutPlanDTO(
            "5", "Lower Body Power", "Advanced", 35,
            Arrays.asList("Squats", "Lunges", "Jump Squats", "Calf Raises"),
            Arrays.asList("Legs", "Glutes"),
            280, "Build powerful legs and glutes", null
        ));
    }
    
    public List<WorkoutPlanDTO> getAllWorkoutPlans() {
        return new ArrayList<>(workoutPlans);
    }
    
    public WorkoutPlanDTO getWorkoutPlan(String planId) {
        return workoutPlans.stream()
            .filter(plan -> plan.getId().equals(planId))
            .findFirst()
            .orElse(null);
    }
    
    public ExerciseAnalysisDTO analyzeExerciseVideo(MultipartFile video, String exerciseType, Long userId) {
        logger.info("Analyzing exercise video for user: {} exercise: {}", userId, exerciseType);
        return exerciseAIService.analyzeExercise(video, exerciseType, userId);
    }
    
    public ExerciseAnalysisDTO analyzeExerciseImage(MultipartFile image, String exerciseType, Long userId) {
        logger.info("Analyzing exercise image for user: {} exercise: {}", userId, exerciseType);
        return exerciseAIService.analyzeExercise(image, exerciseType, userId);
    }
    
    public ExerciseSessionDTO saveExerciseSession(ExerciseSessionDTO session) {
        try {
            session.setId(UUID.randomUUID().toString());
            session.setTimestamp(LocalDateTime.now());
            
            userSessions.computeIfAbsent(session.getUserId(), k -> new ArrayList<>()).add(session);
            
            logger.info("Saved exercise session: {} for user: {}", session.getExercise(), session.getUserId());
            return session;
            
        } catch (Exception e) {
            logger.error("Error saving exercise session: ", e);
            throw new RuntimeException("Failed to save exercise session");
        }
    }
    
    public List<ExerciseSessionDTO> getUserExerciseSessions(Long userId) {
        List<ExerciseSessionDTO> sessions = userSessions.getOrDefault(userId, new ArrayList<>());
        // Sort by timestamp descending (most recent first)
        sessions.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return sessions;
    }
    
    public Map<String, Object> getUserFitnessStats(Long userId) {
        List<ExerciseSessionDTO> sessions = getUserExerciseSessions(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalWorkouts", sessions.size());
        stats.put("totalReps", sessions.stream().mapToInt(s -> s.getReps() != null ? s.getReps() : 0).sum());
        stats.put("totalCalories", sessions.stream().mapToInt(s -> s.getCalories() != null ? s.getCalories() : 0).sum());
        stats.put("totalDuration", sessions.stream().mapToInt(s -> s.getDuration() != null ? s.getDuration() : 0).sum());
        stats.put("averageAccuracy", sessions.stream()
            .filter(s -> s.getAccuracy() != null)
            .mapToDouble(ExerciseSessionDTO::getAccuracy)
            .average()
            .orElse(0.0));
        
        // Exercise frequency
        Map<String, Long> exerciseFrequency = new HashMap<>();
        sessions.forEach(session -> {
            exerciseFrequency.merge(session.getExercise(), 1L, Long::sum);
        });
        stats.put("exerciseFrequency", exerciseFrequency);
        
        // Weekly progress (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<ExerciseSessionDTO> weekSessions = sessions.stream()
            .filter(s -> s.getTimestamp().isAfter(weekAgo))
            .toList();
        stats.put("weeklyWorkouts", weekSessions.size());
        stats.put("weeklyCalories", weekSessions.stream().mapToInt(s -> s.getCalories() != null ? s.getCalories() : 0).sum());
        
        return stats;
    }
}