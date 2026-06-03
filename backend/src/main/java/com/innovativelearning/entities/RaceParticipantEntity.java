package com.innovativelearning.entities;

import com.innovativelearning.enums.ParticipantState;

public class RaceParticipantEntity {
    private Long id;
    private Long raceId;
    private Long userId;
    private Integer joinOrder;
    private Integer position;
    private Integer points;
    private Integer decisionMeter;
    private Double speedMultiplier;
    private Long freezeUntil;
    private Boolean isBehindEligible;
    private Boolean finished;
    private Integer finishRank;
    private Long lastActionAt;
    
    private Integer difficultyLevel;
    private Integer dirtRoadQuestionsLeft;
    private Integer consecutiveNoProgressCount;
    private Integer consecutiveWrongCount;
    private Integer correctStreakAtLevel;
    private Integer wrongStreakAtLevel;
    private Long speedMultiplierUntil;
    private Long lastDecisionMeterUpdate;
    
    private ParticipantState currentState;
    private Double activeLuckMultiplier;
    private Integer questionsAnsweredInCurrentState;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRaceId() { return raceId; }
    public void setRaceId(Long raceId) { this.raceId = raceId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getJoinOrder() { return joinOrder; }
    public void setJoinOrder(Integer joinOrder) { this.joinOrder = joinOrder; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public Integer getDecisionMeter() { return decisionMeter; }
    public void setDecisionMeter(Integer decisionMeter) { this.decisionMeter = decisionMeter; }
    public Double getSpeedMultiplier() { return speedMultiplier; }
    public void setSpeedMultiplier(Double speedMultiplier) { this.speedMultiplier = speedMultiplier; }
    public Long getFreezeUntil() { return freezeUntil; }
    public void setFreezeUntil(Long freezeUntil) { this.freezeUntil = freezeUntil; }
    public Boolean getIsBehindEligible() { return isBehindEligible; }
    public void setIsBehindEligible(Boolean isBehindEligible) { this.isBehindEligible = isBehindEligible; }
    public Boolean getFinished() { return finished; }
    public void setFinished(Boolean finished) { this.finished = finished; }
    public Integer getFinishRank() { return finishRank; }
    public void setFinishRank(Integer finishRank) { this.finishRank = finishRank; }
    public Long getLastActionAt() { return lastActionAt; }
    public void setLastActionAt(Long lastActionAt) { this.lastActionAt = lastActionAt; }

    public Integer getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(Integer difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public Integer getDirtRoadQuestionsLeft() { return dirtRoadQuestionsLeft; }
    public void setDirtRoadQuestionsLeft(Integer dirtRoadQuestionsLeft) { this.dirtRoadQuestionsLeft = dirtRoadQuestionsLeft; }
    public Integer getConsecutiveNoProgressCount() { return consecutiveNoProgressCount; }
    public void setConsecutiveNoProgressCount(Integer consecutiveNoProgressCount) { this.consecutiveNoProgressCount = consecutiveNoProgressCount; }
    public Integer getConsecutiveWrongCount() { return consecutiveWrongCount; }
    public void setConsecutiveWrongCount(Integer consecutiveWrongCount) { this.consecutiveWrongCount = consecutiveWrongCount; }
    public Integer getCorrectStreakAtLevel() { return correctStreakAtLevel; }
    public void setCorrectStreakAtLevel(Integer correctStreakAtLevel) { this.correctStreakAtLevel = correctStreakAtLevel; }
    public Integer getWrongStreakAtLevel() { return wrongStreakAtLevel; }
    public void setWrongStreakAtLevel(Integer wrongStreakAtLevel) { this.wrongStreakAtLevel = wrongStreakAtLevel; }
    public Long getSpeedMultiplierUntil() { return speedMultiplierUntil; }
    public void setSpeedMultiplierUntil(Long speedMultiplierUntil) { this.speedMultiplierUntil = speedMultiplierUntil; }
    public Long getLastDecisionMeterUpdate() { return lastDecisionMeterUpdate; }
    public void setLastDecisionMeterUpdate(Long lastDecisionMeterUpdate) { this.lastDecisionMeterUpdate = lastDecisionMeterUpdate; }

    public ParticipantState getCurrentState() { return currentState; }
    public void setCurrentState(ParticipantState currentState) { this.currentState = currentState; }
    public Double getActiveLuckMultiplier() { return activeLuckMultiplier; }
    public void setActiveLuckMultiplier(Double activeLuckMultiplier) { this.activeLuckMultiplier = activeLuckMultiplier; }
    public Integer getQuestionsAnsweredInCurrentState() { return questionsAnsweredInCurrentState; }
    public void setQuestionsAnsweredInCurrentState(Integer questionsAnsweredInCurrentState) { this.questionsAnsweredInCurrentState = questionsAnsweredInCurrentState; }
}
