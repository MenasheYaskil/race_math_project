package com.innovativelearning.responses;

import java.util.List;

public class LobbyResponse {
    public String raceStatus;
    public List<ParticipantInfo> participants;
    public int participantsCount;
    public int maxParticipants;
    public boolean canStart;

    public static class ParticipantInfo {
        public Long id;
        public String displayName;
    }
}
