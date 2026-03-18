package com.healthcare.service;

import com.healthcare.dto.MentalHealthAssessmentDTO;
import com.healthcare.dto.MentalHealthStatsDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MentalHealthService {

    public MentalHealthAssessmentDTO saveAssessment(MentalHealthAssessmentDTO assessment) {
        // Mock implementation - replace with actual database logic
        assessment.setId(System.currentTimeMillis());
        assessment.setAssessmentDate(LocalDateTime.now());
        return assessment;
    }

    public List<MentalHealthAssessmentDTO> getAssessmentHistory(Long userId) {
        // Mock implementation - replace with actual database logic
        List<MentalHealthAssessmentDTO> assessments = new ArrayList<>();
        
        MentalHealthAssessmentDTO assessment = new MentalHealthAssessmentDTO();
        assessment.setId(1L);
        assessment.setUserId(userId);
        assessment.setMoodLevel("Good");
        assessment.setStressLevel("Low");
        assessment.setAnxietyLevel("Low");
        assessment.setSymptoms(Arrays.asList("None"));
        assessment.setNotes("Feeling well today");
        assessment.setAssessmentDate(LocalDateTime.now().minusDays(1));
        
        assessments.add(assessment);
        return assessments;
    }

    public MentalHealthStatsDTO getStats(Long userId) {
        // Mock implementation - replace with actual database logic
        MentalHealthStatsDTO stats = new MentalHealthStatsDTO();
        stats.setUserId(userId);
        stats.setOverallMoodTrend("Improving");
        stats.setAverageStressLevel("Low");
        stats.setAverageAnxietyLevel("Low");
        stats.setTotalAssessments(5);
        
        Map<String, Integer> moodDistribution = new HashMap<>();
        moodDistribution.put("Excellent", 2);
        moodDistribution.put("Good", 2);
        moodDistribution.put("Fair", 1);
        stats.setMoodDistribution(moodDistribution);
        
        Map<String, Integer> stressDistribution = new HashMap<>();
        stressDistribution.put("Low", 4);
        stressDistribution.put("Medium", 1);
        stats.setStressDistribution(stressDistribution);
        
        stats.setLastAssessmentDate(LocalDateTime.now().minusDays(1));
        stats.setRecommendations("Continue current wellness practices. Consider meditation for stress management.");
        
        return stats;
    }
}