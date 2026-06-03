package com.innovativelearning.controllers;

import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.responses.AuthResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {
    private final Persist persist;

    public AuthController(Persist persist) {
        this.persist = persist;
    }

    @PostMapping("/teacher-login")
    public AuthResponse login(@RequestParam String usernameOrEmail, @RequestParam String password) {
        UserEntity user = persist.executeQuerySingle(
            "from UserEntity where loginName = :ln and passwordHash = :pwd",
            Map.of("ln", usernameOrEmail, "pwd", password),
            UserEntity.class
        );

        if (user != null) {
            return new AuthResponse(true, "Login successful", user.getToken(), user.getDisplayName());
        }
        return new AuthResponse(false, "Invalid credentials", null, null);
    }
}
