package com.healthcare.controller;

import com.healthcare.dto.ExerciseSessionDTO;
import com.healthcare.dto.WorkoutPlanDTO;
import com.healthcare.dto.ExerciseAnalysisDTO;
import com.healthcare.service.FitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fitness")
@CrossOrigin(origins = "*")
public class FitnessController {

    @Autowired
    private FitnessService fitnessService;

    // Get all workout plans
    @GetMapping("/workout-plans")
    public ResponseEntity<List<WorkoutPlanDTO>> getAllWorkoutPlans() {
        try {
            List<WorkoutPlanDTO> plans = fitnessService.getAllWorkoutPlans();
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get specific workout plan
    @GetMapping("/workout-plans/{planId}")
    public ResponseEntity<WorkoutPlanDTO> getWorkoutPlan(@PathVariable String planId) {
        try {
            WorkoutPlanDTO plan = fitnessService.getWorkoutPlan(planId);
            if (plan != null) {
                return ResponseEntity.ok(plan);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Analyze exercise video
    @PostMapping("/analyze-video")
    public ResponseEntity<ExerciseAnalysisDTO> analyzeExerciseVideo(
            @RequestParam("video") MultipartFile video,
            @RequestParam("exerciseType") String exerciseType,
            @RequestParam("userId") Long userId) {
        try {
            ExerciseAnalysisDTO analysis = fitnessService.analyzeExerciseVideo(video, exerciseType, userId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Analyze exercise image/pose
    @PostMapping("/analyze-pose")
    public ResponseEntity<ExerciseAnalysisDTO> analyzeExercisePose(
            @RequestParam("image") MultipartFile image,
            @RequestParam("exerciseType") String exerciseType,
            @RequestParam("userId") Long userId) {
        try {
            ExerciseAnalysisDTO analysis = fitnessService.analyzeExerciseImage(image, exerciseType, userId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Save exercise session
    @PostMapping("/sessions")
    public ResponseEntity<ExerciseSessionDTO> saveExerciseSession(@RequestBody ExerciseSessionDTO session) {
        try {
            ExerciseSessionDTO savedSession = fitnessService.saveExerciseSession(session);
            return ResponseEntity.ok(savedSession);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get user exercise sessions
    @GetMapping("/sessions/{userId}")
    public ResponseEntity<List<ExerciseSessionDTO>> getUserExerciseSessions(@PathVariable Long userId) {
        try {
            List<ExerciseSessionDTO> sessions = fitnessService.getUserExerciseSessions(userId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get user fitness statistics
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserFitnessStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = fitnessService.getUserFitnessStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Fitness Controller is working!");
    }

    // Get exercise recommendations based on user history
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<WorkoutPlanDTO>> getExerciseRecommendations(@PathVariable Long userId) {
        try {
            // For now, return all plans. In production, this would be personalized
            List<WorkoutPlanDTO> recommendations = fitnessService.getAllWorkoutPlans();
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Start workout session
    @PostMapping("/start-workout")
    public ResponseEntity<Map<String, Object>> startWorkout(
            @RequestParam("userId") Long userId,
            @RequestParam("workoutPlanId") String workoutPlanId) {
        try {
            WorkoutPlanDTO plan = fitnessService.getWorkoutPlan(workoutPlanId);
            if (plan == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Workout started successfully",
                "workoutPlan", plan,
                "startTime", System.currentTimeMillis()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Complete workout session
    @PostMapping("/complete-workout")
    public ResponseEntity<Map<String, Object>> completeWorkout(
            @RequestParam("userId") Long userId,
            @RequestParam("workoutPlanId") String workoutPlanId,
            @RequestParam("duration") Integer duration,
            @RequestParam("completedExercises") Integer completedExercises) {
        try {
            WorkoutPlanDTO plan = fitnessService.getWorkoutPlan(workoutPlanId);
            if (plan == null) {
                return ResponseEntity.notFound().build();
            }

            // Calculate calories burned (rough estimate)
            int caloriesBurned = (int) (duration * 0.1 * completedExercises);

            // Create a summary session
            ExerciseSessionDTO summarySession = new ExerciseSessionDTO();
            summarySession.setUserId(userId);
            summarySession.setExercise(plan.getName());
            summarySession.setDuration(duration);
            summarySession.setCalories(caloriesBurned);
            summarySession.setSets(1);
            summarySession.setReps(completedExercises);
            summarySession.setAccuracy(85.0 + Math.random() * 10); // Mock accuracy

            ExerciseSessionDTO savedSession = fitnessService.saveExerciseSession(summarySession);

            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Workout completed successfully",
                "session", savedSession,
                "caloriesBurned", caloriesBurned,
                "completionRate", (completedExercises * 100.0) / plan.getExercises().size()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}