package com.innovativelearning.responses;

import java.util.List;

public class DashboardSnapshotResponse {
    public String raceStatus;
    public List<ParticipantPosition> participantsPositions;
    public List<ParticipantPosition> leaderboard;
    public List<String> recentEvents;

    public static class ParticipantPosition {
        public Long id;
        public String displayName;
        public int position;
        public int points;
        public int rank;
        public String currentState;
        public Double activeLuckMultiplier;
        public int decisionMeter;
        public Long freezeUntil;
        public boolean finished;
    }
}
