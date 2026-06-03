package com.innovativelearning.entities;

public class RaceQuestionEntity {
    private Long id;
    private Long raceId;
    private Long participantId;
    private Long templateId;
    private String questionText;
    private String correctAnswer;
    private Integer difficulty;
    private String branchType;
    private Long issuedAt;
    private Long expiresAt;
    private Long answeredAt;
    private Boolean isAnswered;
    private Boolean wasCorrect;
    private String helpUsed;
    
    private String optionsJson;
    private Integer correctOptionId;
    private String fingerprint;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRaceId() { return raceId; }
    public void setRaceId(Long raceId) { this.raceId = raceId; }
    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }
    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }
    public String getBranchType() { return branchType; }
    public void setBranchType(String branchType) { this.branchType = branchType; }
    public Long getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Long issuedAt) { this.issuedAt = issuedAt; }
    public Long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Long expiresAt) { this.expiresAt = expiresAt; }
    public Long getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(Long answeredAt) { this.answeredAt = answeredAt; }
    public Boolean getIsAnswered() { return isAnswered; }
    public void setIsAnswered(Boolean isAnswered) { this.isAnswered = isAnswered; }
    public Boolean getWasCorrect() { return wasCorrect; }
    public void setWasCorrect(Boolean wasCorrect) { this.wasCorrect = wasCorrect; }
    public String getHelpUsed() { return helpUsed; }
    public void setHelpUsed(String helpUsed) { this.helpUsed = helpUsed; }

    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }
    public Integer getCorrectOptionId() { return correctOptionId; }
    public void setCorrectOptionId(Integer correctOptionId) { this.correctOptionId = correctOptionId; }
    public String getFingerprint() { return fingerprint; }
    public void setFingerprint(String fingerprint) { this.fingerprint = fingerprint; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
