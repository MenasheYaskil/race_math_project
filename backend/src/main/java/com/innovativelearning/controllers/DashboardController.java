package com.innovativelearning.controllers;

import com.innovativelearning.entities.RaceEntity;
import com.innovativelearning.entities.RaceParticipantEntity;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.DashboardSnapshotResponse;
import com.innovativelearning.utils.SseConnectionManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class DashboardController {
    private final Persist persist;
    private final SseConnectionManager sseManager;

    public DashboardController(Persist persist, SseConnectionManager sseManager) {
        this.persist = persist;
        this.sseManager = sseManager;
    }

    @GetMapping("/get-dashboard-snapshot")
    public DashboardSnapshotResponse getSnapshot(@RequestParam String token, @RequestParam Long raceId) {
        // Teacher auth
        UserEntity teacher = persist.executeQuerySingle("from UserEntity where token = :t", Map.of("t", token), UserEntity.class);
        if (teacher == null) throw new RuntimeException("Unauthorized");

        RaceEntity race = persist.get(RaceEntity.class, raceId);
        List<RaceParticipantEntity> participants = persist.executeQuery("from RaceParticipantEntity where raceId = :rid order by position desc, points desc", Map.of("rid", raceId), RaceParticipantEntity.class);
        
        DashboardSnapshotResponse res = new DashboardSnapshotResponse();
        res.raceStatus = race.getStatus();
        res.participantsPositions = new ArrayList<>();
        res.leaderboard = new ArrayList<>();
        res.recentEvents = new ArrayList<>(); // Simple impl
        
        for (RaceParticipantEntity p : participants) {
            UserEntity u = persist.get(UserEntity.class, p.getUserId());
            DashboardSnapshotResponse.ParticipantPosition pp = new DashboardSnapshotResponse.ParticipantPosition();
            pp.id = p.getUserId();
            pp.displayName = u.getDisplayName();
            pp.position = p.getPosition();
            pp.points = p.getPoints();
            res.participantsPositions.add(pp);
            
            DashboardSnapshotResponse.ParticipantPosition leaderPp = new DashboardSnapshotResponse.ParticipantPosition();
            leaderPp.id = p.getUserId();
            leaderPp.displayName = u.getDisplayName();
            leaderPp.position = p.getPosition();
            leaderPp.points = p.getPoints();
            res.leaderboard.add(leaderPp);
        }
        return res;
    }

    @GetMapping(value = "/subscribe-race-dashboard", produces = "text/event-stream")
    public SseEmitter subscribe(@RequestParam String token, @RequestParam Long raceId) {
        UserEntity teacher = persist.executeQuerySingle("from UserEntity where token = :t", Map.of("t", token), UserEntity.class);
        if (teacher == null) throw new RuntimeException("Unauthorized");

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseManager.addEmitter(raceId, emitter);
        return emitter;
    }
}
