package com.innovativelearning.services;

import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.utils.GameConstants;
import org.springframework.stereotype.Service;

@Service
public class ScoringService {

    public double calculateScore(RaceParticipantEntity participant) {
        double baseScore = 0.0;
        if (participant.getCurrentState() == ParticipantState.NORMAL) {
            baseScore = GameConstants.TRACK_TOTAL_SCORE / GameConstants.SCORE_NORMAL_FRACTION;
        } else if (participant.getCurrentState() == ParticipantState.DIRT_ROAD) {
            baseScore = GameConstants.TRACK_TOTAL_SCORE / GameConstants.SCORE_DIRT_FRACTION;
        } else if (participant.getCurrentState() == ParticipantState.HIGHWAY) {
            baseScore = GameConstants.TRACK_TOTAL_SCORE / GameConstants.SCORE_HIGHWAY_FRACTION;
        } else {
            return 0.0;
        }
        
        double multiplier = participant.getActiveLuckMultiplier() != null ? participant.getActiveLuckMultiplier() : 1.0;
        double finalScore = baseScore * multiplier;
        
        if (multiplier != 1.0) {
            participant.setActiveLuckMultiplier(1.0);
        }
        
        return finalScore;
    }
}
