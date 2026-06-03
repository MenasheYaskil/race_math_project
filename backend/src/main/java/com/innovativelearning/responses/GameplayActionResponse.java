package com.innovativelearning.responses;

public class GameplayActionResponse extends BasicResponse {
    public boolean isCorrect;
    public int progressDelta;
    public int pointsDelta;
    public int newPosition;
    public int decisionMeter;
    public boolean triggeredDecision;
    public String luckEvent;
    public boolean raceFinished;
    public String branchType;
    public String nextQuestionMode;
    public String currentState;
    public Double activeLuckMultiplier;
    public Long freezeUntil;
    
    public GameplayActionResponse(boolean success, String message) {
        super(success, message);
    }
}
