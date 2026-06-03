package com.innovativelearning.services;

import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.utils.GameConstants;
import org.springframework.stereotype.Service;

@Service
public class BranchingService {

    private final DecisionMeterService decisionMeterService;

    public BranchingService(DecisionMeterService decisionMeterService) {
        this.decisionMeterService = decisionMeterService;
    }

    public void enterBranch(RaceParticipantEntity participant, ParticipantState branch, long currentTimeSeconds) {
        if (participant.getCurrentState() == ParticipantState.DECISION_PENDING) {
            if (branch == ParticipantState.HIGHWAY || branch == ParticipantState.DIRT_ROAD) {
                participant.setCurrentState(branch);
                participant.setQuestionsAnsweredInCurrentState(0);
            } else {
                throw new IllegalArgumentException("Invalid branch selection: " + branch);
            }
        }
    }

    public void handleQuestionAnswered(RaceParticipantEntity participant, boolean correct, long currentTimeSeconds) {
        if (participant.getCurrentState() == ParticipantState.HIGHWAY) {
            int answered = participant.getQuestionsAnsweredInCurrentState() != null ? participant.getQuestionsAnsweredInCurrentState() : 0;
            answered++;
            participant.setQuestionsAnsweredInCurrentState(answered);

            if (!correct) {
                participant.setCurrentState(ParticipantState.FROZEN);
                participant.setFreezeUntil(currentTimeSeconds + GameConstants.HIGHWAY_FREEZE_SECONDS);
            } else if (answered >= GameConstants.HIGHWAY_QUESTION_COUNT) {
                completeBranch(participant, currentTimeSeconds);
            }
        } else if (participant.getCurrentState() == ParticipantState.DIRT_ROAD) {
            int answered = participant.getQuestionsAnsweredInCurrentState() != null ? participant.getQuestionsAnsweredInCurrentState() : 0;
            answered++;
            participant.setQuestionsAnsweredInCurrentState(answered);

            if (answered >= GameConstants.DIRT_QUESTION_COUNT) {
                completeBranch(participant, currentTimeSeconds);
            }
        }
    }
    
    public void checkUnfreeze(RaceParticipantEntity participant, long currentTimeSeconds) {
        if (participant.getCurrentState() == ParticipantState.FROZEN) {
            if (participant.getFreezeUntil() != null && currentTimeSeconds >= participant.getFreezeUntil()) {
                participant.setFreezeUntil(null);
                
                int answered = participant.getQuestionsAnsweredInCurrentState() != null ? participant.getQuestionsAnsweredInCurrentState() : 0;
                if (answered >= GameConstants.HIGHWAY_QUESTION_COUNT) {
                    completeBranch(participant, currentTimeSeconds);
                } else {
                    participant.setCurrentState(ParticipantState.HIGHWAY);
                }
            }
        }
    }

    private void completeBranch(RaceParticipantEntity participant, long currentTimeSeconds) {
        participant.setCurrentState(ParticipantState.NORMAL);
        participant.setQuestionsAnsweredInCurrentState(0);
        decisionMeterService.resetMeterAfterBranch(participant, currentTimeSeconds);
    }
}
