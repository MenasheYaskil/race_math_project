package com.innovativelearning.responses;

public class RaceActionResponse extends BasicResponse {
    public Long raceId;
    public String raceCode;
    public String raceStatus;
    public Long startedAt;
    public String studentToken;

    public RaceActionResponse(boolean success, String message, Long raceId, String raceCode, String raceStatus) {
        super(success, message);
        this.raceId = raceId;
        this.raceCode = raceCode;
        this.raceStatus = raceStatus;
    }
}
