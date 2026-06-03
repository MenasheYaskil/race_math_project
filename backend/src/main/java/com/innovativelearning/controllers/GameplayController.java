package com.innovativelearning.controllers;

import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.enums.BranchType;
import com.innovativelearning.enums.ParticipantState;
import com.innovativelearning.enums.RaceStatus;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.BasicResponse;
import com.innovativelearning.responses.GameplayActionResponse;
import com.innovativelearning.responses.QuestionResponse;
import com.innovativelearning.responses.StudentRaceStateResponse;
import com.innovativelearning.responses.DashboardSnapshotResponse;
import com.innovativelearning.services.BranchingService;
import com.innovativelearning.services.DecisionMeterService;
import com.innovativelearning.services.LuckEventService;
import com.innovativelearning.services.QuestionGeneratorService;
import com.innovativelearning.services.ScoringService;
import com.innovativelearning.utils.GameConstants;
import com.innovativelearning.utils.SseConnectionManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
public class GameplayController {
    private final Persist persist;
    private final SseConnectionManager sseManager;
    private final ScoringService scoringService;
    private final DecisionMeterService decisionMeterService;
    private final BranchingService branchingService;
    private final LuckEventService luckEventService;
    private final QuestionGeneratorService questionGeneratorService;
    private final Random random = new Random();

    public GameplayController(Persist persist, SseConnectionManager sseManager, 
                              ScoringService scoringService, DecisionMeterService decisionMeterService,
                              BranchingService branchingService, LuckEventService luckEventService,
                              QuestionGeneratorService questionGeneratorService) {
        this.persist = persist;
        this.sseManager = sseManager;
        this.scoringService = scoringService;
        this.decisionMeterService = decisionMeterService;
        this.branchingService = branchingService;
        this.luckEventService = luckEventService;
        this.questionGeneratorService = questionGeneratorService;
    }

    private void broadcastRaceUpdate(Long raceId) {
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        List<RaceParticipantEntity> allParts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        com.innovativelearning.utils.RaceUtils.sortParticipants(allParts);
        
        DashboardSnapshotResponse snap = new DashboardSnapshotResponse();
        snap.raceStatus = race.getStatus();
        snap.participantsPositions = new ArrayList<>();
        snap.leaderboard = new ArrayList<>();
        
        int rank = 1;
        for (RaceParticipantEntity p : allParts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            DashboardSnapshotResponse.ParticipantPosition pp = new DashboardSnapshotResponse.ParticipantPosition();
            pp.id = p.getUserId();
            pp.displayName = u.getDisplayName();
            pp.position = p.getPosition() != null ? p.getPosition() : 0;
            pp.points = p.getPoints() != null ? p.getPoints() : 0;
            pp.rank = p.getFinishRank() != null ? p.getFinishRank() : rank++;
            pp.currentState = p.getCurrentState() != null ? p.getCurrentState().name() : ParticipantState.NORMAL.name();
            pp.activeLuckMultiplier = p.getActiveLuckMultiplier();
            pp.decisionMeter = p.getDecisionMeter() != null ? p.getDecisionMeter() : 0;
            pp.freezeUntil = p.getFreezeUntil();
            
            snap.participantsPositions.add(pp);
            snap.leaderboard.add(pp);
        }
        
        sseManager.sendEvent(raceId, "participant-progress-updated", snap);
    }

    @GetMapping(value = "/subscribe-student-race", produces = "text/event-stream")
    public SseEmitter subscribeStudent(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseManager.addEmitter(raceId, emitter);
        return emitter;
    }

    @GetMapping("/get-student-race-state")
    public StudentRaceStateResponse getStudentState(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());

        StudentRaceStateResponse res = new StudentRaceStateResponse();
        res.raceStatus = race.getStatus();
        
        long now = System.currentTimeMillis() / 1000;
        
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);
        
        boolean frozen = participant.getCurrentState() == ParticipantState.FROZEN;
        res.canPlay = race.getStatus().equals(RaceStatus.LIVE.name()) && !Boolean.TRUE.equals(participant.getFinished()) && !frozen;

        persist.update(participant);

        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false and status = 'OPEN'",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);
        boolean hasActiveQ = activeQ != null && (activeQ.getExpiresAt() == null || activeQ.getExpiresAt() > now);

        res.playerState = new StudentRaceStateResponse.PlayerState();
        res.playerState.id = student.getId();
        res.playerState.displayName = student.getDisplayName();
        res.playerState.position = participant.getPosition() != null ? participant.getPosition() : 0;
        res.playerState.points = participant.getPoints() != null ? participant.getPoints() : 0;
        res.playerState.isBehind = checkIsBehind(raceId, res.playerState.position);
        res.playerState.hasPendingDecision = participant.getCurrentState() == ParticipantState.DECISION_PENDING && !hasActiveQ;
        res.playerState.currentState = participant.getCurrentState() != null ? participant.getCurrentState().name() : ParticipantState.NORMAL.name();
        res.playerState.status = res.playerState.currentState;
        res.playerState.activeLuckMultiplier = participant.getActiveLuckMultiplier();
        res.playerState.decisionMeter = participant.getDecisionMeter() != null ? participant.getDecisionMeter() : 0;
        res.playerState.freezeUntil = participant.getFreezeUntil();
        
        boolean helpAlreadyUsed = activeQ != null && activeQ.getHelpUsed() != null;
        res.playerState.hasPendingHelpChoice = isHelpEligibleNow(raceId, participant) && !res.playerState.hasPendingDecision && !helpAlreadyUsed;
        res.playerState.helpAvailable = res.playerState.hasPendingHelpChoice;
        res.playerState.raceFinished = Boolean.TRUE.equals(participant.getFinished());

        List<RaceParticipantEntity> allParts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        com.innovativelearning.utils.RaceUtils.sortParticipants(allParts);
        res.participantsPositions = new ArrayList<>();
        int rank = 1;
        for (RaceParticipantEntity p : allParts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            DashboardSnapshotResponse.ParticipantPosition pp = new DashboardSnapshotResponse.ParticipantPosition();
            pp.id = p.getUserId();
            pp.displayName = u.getDisplayName();
            pp.position = p.getPosition() != null ? p.getPosition() : 0;
            pp.points = p.getPoints() != null ? p.getPoints() : 0;
            pp.rank = p.getFinishRank() != null ? p.getFinishRank() : rank;
            pp.currentState = p.getCurrentState() != null ? p.getCurrentState().name() : ParticipantState.NORMAL.name();
            pp.activeLuckMultiplier = p.getActiveLuckMultiplier();
            pp.decisionMeter = p.getDecisionMeter() != null ? p.getDecisionMeter() : 0;
            pp.freezeUntil = p.getFreezeUntil();
            res.participantsPositions.add(pp);
            if (p.getId().equals(participant.getId())) res.playerState.rank = pp.rank;
            rank++;
        }

        return res;
    }

    @GetMapping("/get-current-question")
    public QuestionResponse getCurrentQuestion(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        ParticipantState beforeState = participant.getCurrentState();
        
        long now = System.currentTimeMillis() / 1000;
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);
        persist.update(participant);

        ParticipantState afterState = participant.getCurrentState();

        List<RaceQuestionEntity> existingQs = persist.executeQuery(
            "from RaceQuestionEntity where participantId = :pid",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);

        RaceQuestionEntity activeQ = null;
        for (RaceQuestionEntity q : existingQs) {
            if ("OPEN".equals(q.getStatus()) && !Boolean.TRUE.equals(q.getIsAnswered())) {
                if (q.getExpiresAt() == null || q.getExpiresAt() > now) {
                    activeQ = q;
                    break;
                } else {
                    // Expire old
                    q.setIsAnswered(true);
                    q.setWasCorrect(false);
                    q.setStatus("TIMEOUT");
                    persist.update(q);
                    branchingService.handleQuestionAnswered(participant, false, now);
                    persist.update(participant);
                    broadcastRaceUpdate(raceId);
                }
            }
        }

        if (afterState == ParticipantState.DECISION_PENDING && activeQ == null) {
            if (beforeState != afterState) {
                broadcastRaceUpdate(raceId);
            }
            return null;
        }
        if (afterState == ParticipantState.FROZEN) {
            if (beforeState != afterState) {
                broadcastRaceUpdate(raceId);
            }
            return null;
        }


        
        if (activeQ == null) {
            QuestionTemplateEntity tmpl = pickTemplate(participant, existingQs);
            activeQ = questionGeneratorService.generateQuestion(raceId, participant.getId(), tmpl, existingQs);
            persist.save(activeQ);
        }

        QuestionResponse qr = new QuestionResponse();
        qr.questionId = activeQ.getId();
        qr.questionText = activeQ.getQuestionText();
        setOptionsOnQuestionResponse(qr, activeQ.getOptionsJson());
        qr.status = activeQ.getStatus();
        qr.branchType = activeQ.getBranchType();
        qr.expiresAt = activeQ.getExpiresAt();
        qr.hintAvailable = checkIsBehind(raceId, participant.getPosition() != null ? participant.getPosition() : 0);
        if ("HINT".equals(activeQ.getHelpUsed())) {
            qr.hintText = "קרא את השאלה לאט, סמן את הנתונים החשובים ובדוק איזו פעולה מתמטית נדרשת."; // basic hint
        }
        qr.helpUsed = activeQ.getHelpUsed();
        return qr;
    }

    @PostMapping("/submit-answer")
    public GameplayActionResponse submitAnswer(@RequestParam String token, @RequestParam Long raceId, 
                                               @RequestParam Long questionId, @RequestParam Integer selectedOptionId) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());

        long now = System.currentTimeMillis() / 1000;
        
        if (participant.getCurrentState() == ParticipantState.FROZEN) {
            if (participant.getFreezeUntil() != null && now < participant.getFreezeUntil()) {
                return new GameplayActionResponse(false, "Participant is frozen");
            }
        }
        
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);

        RaceQuestionEntity q = persist.get(RaceQuestionEntity.class, questionId);
        if (q == null || Boolean.TRUE.equals(q.getIsAnswered()) || !"OPEN".equals(q.getStatus())) {
            return new GameplayActionResponse(false, "Invalid question");
        }

        q.setIsAnswered(true);
        q.setAnsweredAt(now);
        
        boolean isTimeout = (selectedOptionId != null && selectedOptionId == -1) 
            || (q.getExpiresAt() != null && now >= q.getExpiresAt());
        
        boolean correct = !isTimeout && q.getCorrectOptionId() != null && q.getCorrectOptionId().equals(selectedOptionId);
        q.setWasCorrect(correct);
        if (isTimeout) {
            q.setStatus("TIMEOUT");
        } else {
            q.setStatus(correct ? "ANSWERED_CORRECTLY" : "ANSWERED_WRONGLY");
        }
        persist.update(q);

        GameplayActionResponse res = new GameplayActionResponse(true, "Answer processed");
        res.isCorrect = correct;

        if (correct) {
            participant.setConsecutiveWrongCount(0);
            participant.setConsecutiveNoProgressCount(0);
            
            double finalScore = scoringService.calculateScore(participant);
            int scoreInt = (int) Math.round(finalScore);
            
            participant.setPoints((participant.getPoints() != null ? participant.getPoints() : 0) + scoreInt);
            participant.setPosition((participant.getPosition() != null ? participant.getPosition() : 0) + scoreInt);
            
            res.pointsDelta = scoreInt;
            res.progressDelta = scoreInt;
            
            decisionMeterService.addCorrectAnswerBonus(participant);
            
            int totalAnswered = persist.executeQuery("from RaceQuestionEntity where participantId = :pid and isAnswered = true", Map.of("pid", participant.getId()), RaceQuestionEntity.class).size();
            luckEventService.evaluateLuckEvent(participant, totalAnswered, now);
            
            branchingService.handleQuestionAnswered(participant, true, now);
            
        } else {
            int wrongCount = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
            participant.setConsecutiveWrongCount(wrongCount + 1);
            participant.setConsecutiveNoProgressCount(wrongCount + 1);
            
            branchingService.handleQuestionAnswered(participant, false, now);
        }

        if (participant.getPoints() != null && participant.getPoints() >= GameConstants.TRACK_TOTAL_SCORE) {
            participant.setFinished(true);
            res.raceFinished = true;
            persist.update(participant);
            com.innovativelearning.utils.RaceUtils.determineWinnerAndLeaderboard(raceId, persist, sseManager);
            sseManager.sendEvent(raceId, "race-finished", null);
        }

        persist.update(participant);
        
        res.newPosition = participant.getPosition() != null ? participant.getPosition() : 0;
        res.decisionMeter = participant.getDecisionMeter() != null ? participant.getDecisionMeter() : 0;
        res.triggeredDecision = participant.getCurrentState() == ParticipantState.DECISION_PENDING;
        res.currentState = participant.getCurrentState() != null ? participant.getCurrentState().name() : ParticipantState.NORMAL.name();
        res.activeLuckMultiplier = participant.getActiveLuckMultiplier();
        res.freezeUntil = participant.getFreezeUntil();
        
        broadcastRaceUpdate(raceId);

        return res;
    }

    @PostMapping("/choose-path")
    public BasicResponse choosePath(@RequestParam String token, @RequestParam Long raceId, @RequestParam String choice) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        long now = System.currentTimeMillis() / 1000;
        branchingService.checkUnfreeze(participant, now);
        decisionMeterService.calculateMeterOnDemand(participant, now);
        
        if (participant.getCurrentState() != ParticipantState.DECISION_PENDING) {
            return new BasicResponse(false, "Not in decision state");
        }
        
        ParticipantState branch = ParticipantState.NORMAL;
        try {
            branch = ParticipantState.valueOf(choice);
        } catch (Exception e) {
            return new BasicResponse(false, "Invalid choice");
        }
        
        branchingService.enterBranch(participant, branch, now);
        persist.update(participant);
        
        broadcastRaceUpdate(raceId);
        
        return new BasicResponse(true, "Path chosen");
    }

    @PostMapping("/use-help")
    public QuestionResponse useHelp(@RequestParam String token, @RequestParam Long raceId, @RequestParam String helpType) {
        UserEntity student = getStudentByToken(token);
        RaceParticipantEntity participant = getParticipant(raceId, student.getId());
        
        long now = System.currentTimeMillis() / 1000;
        
        RaceQuestionEntity activeQ = persist.executeQuerySingle(
            "from RaceQuestionEntity where participantId = :pid and isAnswered = false and status = 'OPEN'",
            Map.of("pid", participant.getId()), RaceQuestionEntity.class);

        if (activeQ == null) return null;

        if ("REPLACE".equals(helpType)) {
            activeQ.setIsAnswered(true);
            activeQ.setHelpUsed("REPLACE");
            activeQ.setStatus("TIMEOUT");
            persist.update(activeQ);
            
            participant.setConsecutiveWrongCount(0);
            participant.setConsecutiveNoProgressCount(0);
            persist.update(participant);
            
            List<RaceQuestionEntity> existingQs = persist.executeQuery(
                "from RaceQuestionEntity where participantId = :pid",
                Map.of("pid", participant.getId()), RaceQuestionEntity.class);
            
            QuestionTemplateEntity tmpl = pickTemplate(participant, existingQs);
            activeQ = questionGeneratorService.generateQuestion(raceId, participant.getId(), tmpl, existingQs);
            activeQ.setHelpUsed("POST_REPLACE");
            persist.save(activeQ);
            broadcastRaceUpdate(raceId);
        } else if ("HINT".equals(helpType)) {
            activeQ.setHelpUsed("HINT");
            persist.update(activeQ);
        } else {
            return null;
        }

        QuestionResponse qr = new QuestionResponse();
        qr.questionId = activeQ.getId();
        qr.questionText = activeQ.getQuestionText();
        setOptionsOnQuestionResponse(qr, activeQ.getOptionsJson());
        qr.status = activeQ.getStatus();
        qr.branchType = activeQ.getBranchType();
        qr.expiresAt = activeQ.getExpiresAt();
        if ("HINT".equals(helpType)) {
            qr.hintText = "קרא את השאלה לאט, סמן את הנתונים החשובים ובדוק איזו פעולה מתמטית נדרשת.";
        }
        qr.helpUsed = activeQ.getHelpUsed();
        return qr;
    }

    private QuestionTemplateEntity pickTemplate(RaceParticipantEntity participant, List<RaceQuestionEntity> existingQs) {
        List<QuestionTemplateEntity> allTemplates = persist.list(QuestionTemplateEntity.class);
        if (allTemplates.isEmpty()) throw new RuntimeException("No templates");
        
        List<QuestionTemplateEntity> active = allTemplates.stream().filter(t -> Boolean.TRUE.equals(t.getIsActive())).collect(Collectors.toList());
        if (active.isEmpty()) active = allTemplates;
        
        String currentBranch = participant.getCurrentState() != null ? participant.getCurrentState().name() : "NORMAL";
        if (currentBranch.equals("FROZEN") || currentBranch.equals("DECISION_PENDING")) currentBranch = "NORMAL";
        
        final String cb = currentBranch;
        List<QuestionTemplateEntity> branchTmpls = active.stream().filter(t -> cb.equals(t.getBranchCompatibility())).collect(Collectors.toList());
        if (branchTmpls.isEmpty()) branchTmpls = active;
        
        if (existingQs == null || existingQs.isEmpty()) {
            return branchTmpls.get(random.nextInt(branchTmpls.size()));
        }

        List<RaceQuestionEntity> recent = existingQs.stream()
            .filter(q -> q.getAnsweredAt() != null)
            .sorted((a,b) -> Long.compare(b.getAnsweredAt(), a.getAnsweredAt()))
            .collect(Collectors.toList());

        List<Long> recentTemplateIds = recent.stream().limit(5).map(RaceQuestionEntity::getTemplateId).collect(Collectors.toList());
        
        String fam1 = null; String fam2 = null;
        if (recent.size() >= 1) fam1 = getTemplateFamilyById(allTemplates, recent.get(0).getTemplateId());
        if (recent.size() >= 2) fam2 = getTemplateFamilyById(allTemplates, recent.get(1).getTemplateId());
        
        String bannedFamily = null;
        if (fam1 != null && fam1.equals(fam2)) bannedFamily = fam1;
        final String finalBannedFamily = bannedFamily;
        
        List<QuestionTemplateEntity> candidates = branchTmpls.stream()
            .filter(t -> !recentTemplateIds.contains(t.getId()))
            .filter(t -> finalBannedFamily == null || !finalBannedFamily.equals(t.getTemplateFamily()))
            .collect(Collectors.toList());
            
        if (candidates.isEmpty()) {
            candidates = branchTmpls;
        }
        
        return candidates.get(random.nextInt(candidates.size()));
    }

    private String getTemplateFamilyById(List<QuestionTemplateEntity> list, Long id) {
        if (id == null) return null;
        QuestionTemplateEntity tmpl = list.stream().filter(t -> id.equals(t.getId())).findFirst().orElse(null);
        return tmpl != null ? tmpl.getTemplateFamily() : null;
    }

    private UserEntity getStudentByToken(String token) {
        UserEntity student = persist.executeQuerySingle("from UserEntity where token = :t", Map.of("t", token), UserEntity.class);
        if (student == null) throw new RuntimeException("Unauthorized");
        return student;
    }

    private RaceParticipantEntity getParticipant(Long raceId, Long userId) {
        return persist.executeQuerySingle("from RaceParticipantEntity where raceId = :rid and userId = :uid", 
            Map.of("rid", raceId, "uid", userId), RaceParticipantEntity.class);
    }

    private boolean checkIsBehind(Long raceId, int myPosition) {
        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
        if (parts.size() < 2) return false;
        
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        int leaderPos = parts.get(0).getPosition() != null ? parts.get(0).getPosition() : 0;
        return (leaderPos - myPosition) >= GameConstants.BEHIND_DISTANCE_THRESHOLD;
    }

    private boolean isHelpEligibleNow(Long raceId, RaceParticipantEntity participant) {
        int wrongCount = participant.getConsecutiveWrongCount() != null ? participant.getConsecutiveWrongCount() : 0;
        int noProgress = participant.getConsecutiveNoProgressCount() != null ? participant.getConsecutiveNoProgressCount() : 0;
        if (wrongCount < 3 && noProgress < 3) return false;

        List<RaceParticipantEntity> parts = persist.executeQuery(
            "from RaceParticipantEntity where raceId = :rid", 
            Map.of("rid", raceId), RaceParticipantEntity.class);
        if (parts.size() < 2) return false;
        
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        RaceParticipantEntity leader = parts.get(0);
        if (leader.getId().equals(participant.getId())) return false;
        
        int posDiff = leader.getPosition() - (participant.getPosition() == null ? 0 : participant.getPosition());
        int ptsDiff = leader.getPoints() - (participant.getPoints() == null ? 0 : participant.getPoints());
        
        return posDiff >= GameConstants.BEHIND_DISTANCE_THRESHOLD || ptsDiff >= GameConstants.BEHIND_POINTS_THRESHOLD;
    }

    private void setOptionsOnQuestionResponse(QuestionResponse qr, String optionsJson) {
        if (optionsJson == null) return;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            qr.options = mapper.readValue(optionsJson, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<QuestionResponse.Option>>() {});
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
