package com.innovativelearning.responses;

public class AuthResponse extends BasicResponse {
    public String token;
    public String teacherName;

    public AuthResponse(boolean success, String message, String token, String teacherName) {
        super(success, message);
        this.token = token;
        this.teacherName = teacherName;
    }
}
