package com.innovativelearning.responses;

public class BasicResponse {
    public boolean success;
    public String message;

    public BasicResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
