package com.innovativelearning.services;

import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class QuestionGeneratorService {

    public RaceQuestionEntity generateQuestion(Long raceId, Long participantId, QuestionTemplateEntity template, List<RaceQuestionEntity> existingQuestions) {
        if (existingQuestions != null) {
            for (RaceQuestionEntity q : existingQuestions) {
                if ("OPEN".equals(q.getStatus()) && q.getRaceId().equals(raceId) && q.getParticipantId().equals(participantId)) {
                    if (q.getExpiresAt() == null || q.getExpiresAt() > System.currentTimeMillis() / 1000) {
                        return q;
                    }
                }
            }
        }

        if (template.getIsActive() != null && !template.getIsActive()) {
            throw new IllegalArgumentException("Template is not active");
        }

        QuestionTemplateCatalog.WordProblem wp = null;
        
        for (int attempt = 0; attempt < 5; attempt++) {
            wp = QuestionTemplateCatalog.generate(template);
            boolean isRecent = false;
            if (existingQuestions != null) {
                for (RaceQuestionEntity eq : existingQuestions) {
                    if (wp.fingerprint.equals(eq.getFingerprint()) && eq.getAnsweredAt() != null) {
                        isRecent = true;
                        break;
                    }
                }
            }
            if (!isRecent) break;
        }

        Set<Integer> validOptions = new LinkedHashSet<>();
        validOptions.add(wp.correctAnswer);
        
        for (Integer d : wp.distractors) {
            if (d >= 0) { 
                validOptions.add(d);
            }
        }
        
        int offset = 1;
        while (validOptions.size() < 4) {
            int candidate1 = wp.correctAnswer + offset;
            int candidate2 = wp.correctAnswer - offset;
            if (candidate1 >= 0) validOptions.add(candidate1);
            if (validOptions.size() < 4 && candidate2 >= 0) validOptions.add(candidate2);
            offset++;
        }
        
        List<Integer> finalOptions = new ArrayList<>();
        for (Integer opt : validOptions) {
            finalOptions.add(opt);
            if (finalOptions.size() == 4) break;
        }
        
        Collections.shuffle(finalOptions);
        int correctIndex = finalOptions.indexOf(wp.correctAnswer);
        
        StringBuilder optionsJson = new StringBuilder();
        optionsJson.append("[");
        for (int i = 0; i < finalOptions.size(); i++) {
            optionsJson.append("{\"id\":").append(i).append(",\"text\":\"").append(finalOptions.get(i)).append("\"}");
            if (i < finalOptions.size() - 1) optionsJson.append(",");
        }
        optionsJson.append("]");

        int timeToLive = template.getBaseTimeSeconds() != null && template.getBaseTimeSeconds() > 0 ? template.getBaseTimeSeconds() : 60;

        RaceQuestionEntity newQuestion = new RaceQuestionEntity();
        newQuestion.setRaceId(raceId);
        newQuestion.setParticipantId(participantId);
        newQuestion.setTemplateId(template.getId());
        newQuestion.setQuestionText(wp.questionText);
        newQuestion.setCorrectAnswer(String.valueOf(wp.correctAnswer));
        newQuestion.setDifficulty(template.getDifficulty());
        newQuestion.setBranchType(template.getBranchCompatibility());
        newQuestion.setIssuedAt(System.currentTimeMillis() / 1000);
        newQuestion.setExpiresAt(newQuestion.getIssuedAt() + timeToLive);
        newQuestion.setIsAnswered(false);
        newQuestion.setStatus("OPEN");
        newQuestion.setFingerprint(wp.fingerprint);
        newQuestion.setOptionsJson(optionsJson.toString());
        newQuestion.setCorrectOptionId(correctIndex);

        return newQuestion;
    }
}
