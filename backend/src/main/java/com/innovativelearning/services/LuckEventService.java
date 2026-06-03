package com.innovativelearning.services;

import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.utils.GameConstants;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class LuckEventService {

    private final Random random = new Random();
    private final java.util.concurrent.ConcurrentHashMap<Long, Long> lastLuckTimes = new java.util.concurrent.ConcurrentHashMap<>();

    public void evaluateLuckEvent(RaceParticipantEntity participant, int totalAnsweredQuestions, long currentTimeSeconds) {
        if (participant.getActiveLuckMultiplier() != null && participant.getActiveLuckMultiplier() != 1.0) {
            return;
        }

        long lastLuckEventTimeSeconds = lastLuckTimes.getOrDefault(participant.getId(), currentTimeSeconds); // default to current time to start the 180s clock from the first check

        boolean eligibleByQuestions = (totalAnsweredQuestions > 0 && totalAnsweredQuestions % GameConstants.LUCK_TRIGGER_QUESTIONS == 0);
        boolean eligibleByTime = (currentTimeSeconds - lastLuckEventTimeSeconds >= GameConstants.LUCK_TRIGGER_SECONDS);

        if (eligibleByQuestions || eligibleByTime) {
            triggerLuckEvent(participant);
            lastLuckTimes.put(participant.getId(), currentTimeSeconds);
        } else if (!lastLuckTimes.containsKey(participant.getId())) {
            // Initialize the clock for this participant if not already tracking
            lastLuckTimes.put(participant.getId(), currentTimeSeconds);
        }
    }

    private void triggerLuckEvent(RaceParticipantEntity participant) {
        int roll = random.nextInt(100);
        boolean isBoost = roll < 70;
        
        if (isBoost) {
            participant.setActiveLuckMultiplier(GameConstants.LUCK_BOOST_MULTIPLIER);
        } else {
            if (participant.getCurrentState() != ParticipantState.FROZEN) {
                participant.setActiveLuckMultiplier(GameConstants.LUCK_PUNCTURE_MULTIPLIER);
            }
        }
    }
}
