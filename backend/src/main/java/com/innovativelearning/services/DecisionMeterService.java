package com.innovativelearning.services;

import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.utils.GameConstants;
import org.springframework.stereotype.Service;

@Service
public class DecisionMeterService {

    public void calculateMeterOnDemand(RaceParticipantEntity participant, long currentTimeSeconds) {
        if (participant.getCurrentState() != ParticipantState.NORMAL) {
            return;
        }
        
        long lastUpdate = participant.getLastDecisionMeterUpdate() != null ? participant.getLastDecisionMeterUpdate() : currentTimeSeconds;
        long secondsElapsed = currentTimeSeconds - lastUpdate;
        if (secondsElapsed < 0) secondsElapsed = 0;
        
        int currentMeter = participant.getDecisionMeter() != null ? participant.getDecisionMeter() : 0;
        int newMeter = currentMeter + (int) (secondsElapsed * GameConstants.DECISION_FILL_PER_SECOND);
        
        if (newMeter >= GameConstants.DECISION_METER_MAX) {
            newMeter = GameConstants.DECISION_METER_MAX;
            participant.setCurrentState(ParticipantState.DECISION_PENDING);
        }
        
        participant.setDecisionMeter(newMeter);
        participant.setLastDecisionMeterUpdate(currentTimeSeconds);
    }
    
    public void addCorrectAnswerBonus(RaceParticipantEntity participant) {
        if (participant.getCurrentState() == ParticipantState.NORMAL) {
            int currentMeter = participant.getDecisionMeter() != null ? participant.getDecisionMeter() : 0;
            int newMeter = currentMeter + GameConstants.DECISION_FILL_PER_CORRECT;
            if (newMeter >= GameConstants.DECISION_METER_MAX) {
                newMeter = GameConstants.DECISION_METER_MAX;
                participant.setCurrentState(ParticipantState.DECISION_PENDING);
            }
            participant.setDecisionMeter(newMeter);
        }
    }
    
    public void resetMeterAfterBranch(RaceParticipantEntity participant, long currentTimeSeconds) {
        participant.setDecisionMeter(0);
        participant.setLastDecisionMeterUpdate(currentTimeSeconds);
    }
}
