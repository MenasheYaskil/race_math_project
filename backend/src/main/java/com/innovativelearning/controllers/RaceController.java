package com.innovativelearning.controllers;

import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.RaceQuestionEntity;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.enums.RaceStatus;
import com.innovativelearning.enums.UserRole;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.BasicResponse;
import com.innovativelearning.responses.LobbyResponse;
import com.innovativelearning.responses.RaceActionResponse;
import com.innovativelearning.responses.ResultsResponse;
import com.innovativelearning.utils.EnvUtils;
import com.innovativelearning.utils.GameConstants;
import com.innovativelearning.utils.SseConnectionManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class RaceController {
    private final Persist persist;
    private final SseConnectionManager sseManager;

    public RaceController(Persist persist, SseConnectionManager sseManager) {
        this.persist = persist;
        this.sseManager = sseManager;
    }

    @GetMapping("/debug-users")
    public List<UserEntity> debugUsers() {
        return persist.list(UserEntity.class);
    }

    @PostMapping("/create-race")
    public RaceActionResponse createRace(@RequestParam String token, @RequestParam String raceTitle) {
        UserEntity teacher = persist.executeQuerySingle("from UserEntity where token = :t", Map.of("t", token), UserEntity.class);
        if (teacher == null) return new RaceActionResponse(false, "Unauthorized", null, null, null);

        RaceEntity race = new RaceEntity();
        race.setRoomCode(EnvUtils.generateRoomCode(GameConstants.ROOM_CODE_LENGTH));
        race.setTeacherUserId(teacher.getId());
        race.setTitle(raceTitle);
        race.setStatus(RaceStatus.LOBBY.name());
        race.setMaxParticipants(GameConstants.MAX_PARTICIPANTS);
        race.setTrackLength(GameConstants.TRACK_LENGTH);
        race.setCreatedAt(System.currentTimeMillis());
        persist.save(race);

        return new RaceActionResponse(true, "Race created", race.getId(), race.getRoomCode(), race.getStatus());
    }

    @PostMapping("/join-race")
    public RaceActionResponse joinRace(@RequestParam String raceCode, @RequestParam String displayName) {
        RaceEntity race = persist.executeQuerySingle("from RaceEntity where roomCode = :rc", Map.of("rc", raceCode), RaceEntity.class);
        if (race == null || !race.getStatus().equals(RaceStatus.LOBBY.name())) {
            return new RaceActionResponse(false, "Race not found or already started", null, null, null);
        }

        List<RaceParticipantEntity> existing = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", race.getId()), RaceParticipantEntity.class);
        if (existing.size() >= race.getMaxParticipants()) {
            return new RaceActionResponse(false, "Race full", null, null, null);
        }

        UserEntity student = new UserEntity();
        student.setRole(UserRole.STUDENT.name());
        student.setDisplayName(displayName);
        student.setToken(UUID.randomUUID().toString());
        student.setCreatedAt(System.currentTimeMillis());
        student.setActive(true);
        persist.save(student);

        RaceParticipantEntity participant = new RaceParticipantEntity();
        participant.setRaceId(race.getId());
        participant.setUserId(student.getId());
        participant.setJoinOrder(existing.size() + 1);
        participant.setPosition(0);
        participant.setPoints(0);
        participant.setDecisionMeter(0);
        participant.setSpeedMultiplier(1.0);
        participant.setFreezeUntil(0L);
        participant.setIsBehindEligible(false);
        participant.setFinished(false);
        participant.setDifficultyLevel(GameConstants.DIFFICULTY_START);
        participant.setDirtRoadQuestionsLeft(0);
        participant.setConsecutiveNoProgressCount(0);
        participant.setConsecutiveWrongCount(0);
        participant.setCorrectStreakAtLevel(0);
        participant.setWrongStreakAtLevel(0);
        participant.setSpeedMultiplierUntil(0L);
        participant.setCurrentState(com.innovativelearning.enums.ParticipantState.NORMAL);
        participant.setActiveLuckMultiplier(1.0);
        participant.setQuestionsAnsweredInCurrentState(0);
        participant.setLastDecisionMeterUpdate(System.currentTimeMillis() / 1000);
        persist.save(participant);
        sseManager.sendEvent(race.getId(), "lobby-participants-updated", "");

        return new RaceActionResponse(true, "Joined", race.getId(), race.getRoomCode(), race.getStatus()) {{
            this.studentToken = student.getToken();
        }};
    }

    @GetMapping("/get-race-lobby")
    public LobbyResponse getLobby(@RequestParam String token, @RequestParam Long raceId) {
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        List<RaceParticipantEntity> parts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        
        LobbyResponse res = new LobbyResponse();
        res.raceStatus = race.getStatus();
        res.maxParticipants = race.getMaxParticipants();
        res.participantsCount = parts.size();
        res.canStart = parts.size() > 0;
        res.participants = new ArrayList<>();
        
        for (RaceParticipantEntity p : parts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            LobbyResponse.ParticipantInfo pi = new LobbyResponse.ParticipantInfo();
            pi.id = p.getUserId();
            pi.displayName = u.getDisplayName();
            res.participants.add(pi);
        }
        return res;
    }

    @PostMapping("/start-race")
    public BasicResponse startRace(@RequestParam String token, @RequestParam Long raceId) {
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        race.setStatus(RaceStatus.LIVE.name());
        race.setStartedAt(System.currentTimeMillis());
        persist.update(race);
        sseManager.sendEvent(raceId, "race-started", null);
        return new BasicResponse(true, "Started");
    }

    @PostMapping("/finish-race")
    public BasicResponse finishRace(@RequestParam String token, @RequestParam Long raceId) {
        RaceEntity race = persist.get(RaceEntity.class, raceId);
        if (race.getStatus().equals(RaceStatus.FINISHED.name())) return new BasicResponse(true, "Already finished");
        race.setStatus(RaceStatus.FINISHED.name());
        race.setEndedAt(System.currentTimeMillis());
        persist.update(race);
        
        com.innovativelearning.utils.RaceUtils.determineWinnerAndLeaderboard(raceId, persist, sseManager);
        sseManager.sendEvent(raceId, "race-finished", null);
        return new BasicResponse(true, "Finished");
    }

    @GetMapping("/get-race-results")
    public ResultsResponse getResults(@RequestParam String token, @RequestParam Long raceId) {
        List<RaceParticipantEntity> parts = persist.executeQuery("from RaceParticipantEntity where raceId = :rid", Map.of("rid", raceId), RaceParticipantEntity.class);
        com.innovativelearning.utils.RaceUtils.sortParticipants(parts);
        UserEntity currentUser = persist.executeQuerySingle("from UserEntity where token = :t", Map.of("t", token), UserEntity.class);
        List<RaceQuestionEntity> raceQuestions = persist.executeQuery("from RaceQuestionEntity where raceId = :rid", Map.of("rid", raceId), RaceQuestionEntity.class);
        ResultsResponse res = new ResultsResponse();
        res.leaderboard = new ArrayList<>();
        int rank = 1;
        for (RaceParticipantEntity p : parts) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            ResultsResponse.LeaderboardEntry le = new ResultsResponse.LeaderboardEntry();
            le.rank = rank++;
            le.userId = u.getId();
            le.displayName = u.getDisplayName();
            le.points = p.getPoints();
            le.position = p.getPosition();
            le.isCurrentUser = (currentUser != null && currentUser.getId().equals(u.getId()));
            
            int displayedCount = 0;
            int correctCount = 0;
            int timedAnswersCount = 0;
            long totalAnswerTimeSeconds = 0;
            
            for (RaceQuestionEntity q : raceQuestions) {
                if (q.getParticipantId() != null && q.getParticipantId().equals(p.getId())) {
                    displayedCount++;
                    if (Boolean.TRUE.equals(q.getWasCorrect())) {
                        correctCount++;
                    }
                    if (Boolean.TRUE.equals(q.getIsAnswered())) {
                        if (q.getAnsweredAt() != null && q.getIssuedAt() != null && q.getAnsweredAt() >= q.getIssuedAt()) {
                            totalAnswerTimeSeconds += (q.getAnsweredAt() - q.getIssuedAt());
                            timedAnswersCount++;
                        }
                    }
                }
            }
            
            le.answeredQuestionsCount = displayedCount;
            le.correctAnswersCount = correctCount;
            le.accuracyPercent = (displayedCount > 0) ? (int) Math.round(((double) correctCount / displayedCount) * 100) : 0;
            le.averageAnswerTimeSeconds = (timedAnswersCount > 0) ? (int) Math.round(totalAnswerTimeSeconds / (double) timedAnswersCount) : 0;
            
            res.leaderboard.add(le);
        }
        if (!res.leaderboard.isEmpty()) {
            res.winner = new ResultsResponse.WinnerInfo();
            res.winner.userId = res.leaderboard.get(0).userId;
            res.winner.displayName = res.leaderboard.get(0).displayName;
        }
        res.summaryStats = "Race completed with " + parts.size() + " participants.";
        return res;
    }
}
