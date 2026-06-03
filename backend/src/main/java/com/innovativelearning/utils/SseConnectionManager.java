package com.innovativelearning.utils;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SseConnectionManager {
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public void addEmitter(Long raceId, SseEmitter emitter) {
        emitters.computeIfAbsent(raceId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> removeEmitter(raceId, emitter));
        emitter.onTimeout(() -> removeEmitter(raceId, emitter));
        emitter.onError((e) -> removeEmitter(raceId, emitter));
        try {
            emitter.send(SseEmitter.event().name("connect").data("connected"));
        } catch (Exception e) {
            removeEmitter(raceId, emitter);
        }
    }

    private void removeEmitter(Long raceId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(raceId);
        if (list != null) {
            list.remove(emitter);
        }
    }

    public void sendEvent(Long raceId, String eventName, Object data) {
        List<SseEmitter> list = emitters.get(raceId);
        if (list != null) {
            for (SseEmitter emitter : list) {
                try {
                    Object sendData = data != null ? data : "";
                    emitter.send(SseEmitter.event().name(eventName).data(sendData));
                } catch (Exception e) {
                    list.remove(emitter);
                }
            }
        }
    }
}
