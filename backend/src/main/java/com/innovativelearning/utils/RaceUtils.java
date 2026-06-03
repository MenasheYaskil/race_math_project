package com.innovativelearning.utils;

import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.utils.SseConnectionManager;
import java.util.List;
import java.util.Map;

public class RaceUtils {
    public static void sortParticipants(List<RaceParticipantEntity> parts) {
        parts.sort((p1, p2) -> {
            boolean f1 = p1.getFinished() != null && p1.getFinished();
            boolean f2 = p2.getFinished() != null && p2.getFinished();
            if (f1 != f2) return f1 ? -1 : 1;
            
            if (f1 && f2) {
                int fr1 = p1.getFinishRank() != null ? p1.getFinishRank() : Integer.MAX_VALUE;
                int fr2 = p2.getFinishRank() != null ? p2.getFinishRank() : Integer.MAX_VALUE;
                if (fr1 != fr2) return Integer.compare(fr1, fr2);
            }
            
            int pts1 = p1.getPoints() != null ? p1.getPoints() : 0;
            int pts2 = p2.getPoints() != null ? p2.getPoints() : 0;
            if (pts1 != pts2) return Integer.compare(pts2, pts1);
            
            int pos1 = p1.getPosition() != null ? p1.getPosition() : 0;
            int pos2 = p2.getPosition() != null ? p2.getPosition() : 0;
            if (pos1 != pos2) return Integer.compare(pos2, pos1);
            
            long l1 = p1.getLastActionAt() != null ? p1.getLastActionAt() : Long.MAX_VALUE;
            long l2 = p2.getLastActionAt() != null ? p2.getLastActionAt() : Long.MAX_VALUE;
            if (l1 != l2) return Long.compare(l1, l2);
            
            int j1 = p1.getJoinOrder() != null ? p1.getJoinOrder() : Integer.MAX_VALUE;
            int j2 = p2.getJoinOrder() != null ? p2.getJoinOrder() : Integer.MAX_VALUE;
            return Integer.compare(j1, j2);
        });
    }

    public static void determineWinnerAndLeaderboard(Long raceId, Persist persist, SseConnectionManager sseManager) {
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        if (race == null) return;
        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
            
        sortParticipants(parts);
        
        if (!parts.isEmpty() && race.getWinnerUserId() == null) {
            boolean finishedRace = race.getStatus().equals("FINISHED");
            boolean firstCrossed = parts.get(0).getFinished() != null && parts.get(0).getFinished();
            
            if (finishedRace || firstCrossed) {
                race.setWinnerUserId(parts.get(0).getUserId());
                if (!finishedRace) {
                    race.setStatus("FINISHED");
                    race.setEndedAt(System.currentTimeMillis());
                }
                persist.update(race);
                if (sseManager != null) {
                    sseManager.sendEvent(raceId, "race-finished", "FINISHED");
                }
            }
        }
    }
}
