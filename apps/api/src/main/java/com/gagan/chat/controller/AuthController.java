package com.gagan.chat.controller;

import com.gagan.chat.config.JwtUtil;
import com.gagan.chat.entities.User;
import com.gagan.chat.playload.AuthResponse;
import com.gagan.chat.playload.LoginRequest;
import com.gagan.chat.playload.RegisterRequest;
import com.gagan.chat.repositories.UserRepository;
import com.gagan.chat.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        String token = authService.register(request);
        return new AuthResponse(token);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return new AuthResponse(token);
    }

//     ✅ Logout endpoint add kiya
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("Authorization") String authHeader
    ) {
        // Bearer token se email nikalo
        String token = authHeader.replace("Bearer ", "");
        String email = JwtUtil.extractEmail(token);

        authService.logout(email);

        return ResponseEntity.ok("Logged out successfully");
    }

}