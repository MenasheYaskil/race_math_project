package com.innovativelearning.entities;

public class QuestionTemplateEntity {
    private Long id;
    private String subject;
    private String templateType;
    private String operator;
    private Integer difficulty;
    private Integer minValue;
    private Integer maxValue;
    private Integer baseTimeSeconds;
    private Boolean isActive;
    
    private String templateFamily;
    private String logicTag;
    private String antiRepeatGroup;
    private Integer difficultyBand;
    private String branchCompatibility;
    private Integer stepsCount;
    private Boolean allowsDecimal;
    private Integer maxDecimalPlaces;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getTemplateType() { return templateType; }
    public void setTemplateType(String templateType) { this.templateType = templateType; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }
    public Integer getMinValue() { return minValue; }
    public void setMinValue(Integer minValue) { this.minValue = minValue; }
    public Integer getMaxValue() { return maxValue; }
    public void setMaxValue(Integer maxValue) { this.maxValue = maxValue; }
    public Integer getBaseTimeSeconds() { return baseTimeSeconds; }
    public void setBaseTimeSeconds(Integer baseTimeSeconds) { this.baseTimeSeconds = baseTimeSeconds; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getTemplateFamily() { return templateFamily; }
    public void setTemplateFamily(String templateFamily) { this.templateFamily = templateFamily; }
    public String getLogicTag() { return logicTag; }
    public void setLogicTag(String logicTag) { this.logicTag = logicTag; }
    public String getAntiRepeatGroup() { return antiRepeatGroup; }
    public void setAntiRepeatGroup(String antiRepeatGroup) { this.antiRepeatGroup = antiRepeatGroup; }
    public Integer getDifficultyBand() { return difficultyBand; }
    public void setDifficultyBand(Integer difficultyBand) { this.difficultyBand = difficultyBand; }
    public String getBranchCompatibility() { return branchCompatibility; }
    public void setBranchCompatibility(String branchCompatibility) { this.branchCompatibility = branchCompatibility; }
    public Integer getStepsCount() { return stepsCount; }
    public void setStepsCount(Integer stepsCount) { this.stepsCount = stepsCount; }
    public Boolean getAllowsDecimal() { return allowsDecimal; }
    public void setAllowsDecimal(Boolean allowsDecimal) { this.allowsDecimal = allowsDecimal; }
    public Integer getMaxDecimalPlaces() { return maxDecimalPlaces; }
    public void setMaxDecimalPlaces(Integer maxDecimalPlaces) { this.maxDecimalPlaces = maxDecimalPlaces; }
}
