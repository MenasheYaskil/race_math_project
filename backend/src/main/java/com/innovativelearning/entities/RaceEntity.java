package com.innovativelearning.entities;

public class RaceEntity {
    private Long id;
    private String roomCode;
    private Long teacherUserId;
    private String title;
    private String status;
    private Integer maxParticipants;
    private Integer trackLength;
    private Long startedAt;
    private Long endedAt;
    private Long winnerUserId;
    private Long createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public Long getTeacherUserId() { return teacherUserId; }
    public void setTeacherUserId(Long teacherUserId) { this.teacherUserId = teacherUserId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public Integer getTrackLength() { return trackLength; }
    public void setTrackLength(Integer trackLength) { this.trackLength = trackLength; }
    public Long getStartedAt() { return startedAt; }
    public void setStartedAt(Long startedAt) { this.startedAt = startedAt; }
    public Long getEndedAt() { return endedAt; }
    public void setEndedAt(Long endedAt) { this.endedAt = endedAt; }
    public Long getWinnerUserId() { return winnerUserId; }
    public void setWinnerUserId(Long winnerUserId) { this.winnerUserId = winnerUserId; }
    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}
