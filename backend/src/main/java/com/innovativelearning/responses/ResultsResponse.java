package com.innovativelearning.responses;

import java.util.List;

public class ResultsResponse {
    public WinnerInfo winner;
    public List<LeaderboardEntry> leaderboard;
    public String summaryStats;

    public static class WinnerInfo {
        public Long userId;
        public String displayName;
    }

    public static class LeaderboardEntry {
        public int rank;
        public Long userId;
        public String displayName;
        public int points;
        public int position;
        public boolean isCurrentUser;
        public int answeredQuestionsCount;
        public int correctAnswersCount;
        public int accuracyPercent;
        public int averageAnswerTimeSeconds;
    }
}
