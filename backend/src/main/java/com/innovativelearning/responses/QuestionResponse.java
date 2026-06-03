package com.innovativelearning.responses;

import java.util.List;

public class QuestionResponse {
    public Long questionId;
    public String questionText;
    public List<Option> options;
    public String status;
    public String questionType;
    public String branchType;
    public Long expiresAt;
    public boolean hintAvailable;
    public String hintText;
    public String helpUsed;

    public static class Option {
        public int id;
        public String text;
    }
}
