package com.innovativelearning.responses;

import java.util.List;

public class StudentRaceStateResponse {
    public String raceStatus;
    public boolean canPlay;
    public PlayerState playerState;
    public List<DashboardSnapshotResponse.ParticipantPosition> participantsPositions;

    public static class PlayerState {
        public Long id;
        public String displayName;
        public int position;
        public int points;
        public boolean isBehind;
        public boolean hasPendingDecision;
        public boolean hasPendingHelpChoice;
        public String currentState;
        public String status; // alias for currentState
        public Double activeLuckMultiplier;
        public int decisionMeter;
        public Long freezeUntil;
        public int rank;
        public boolean helpAvailable;
        public boolean raceFinished;
    }
}
