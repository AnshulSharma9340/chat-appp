package com.gagan.chat.services;

import com.gagan.chat.config.JwtUtil;
import com.gagan.chat.entities.User;
import com.gagan.chat.playload.LoginRequest;
import com.gagan.chat.playload.RegisterRequest;
import com.gagan.chat.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public String register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User(
                request.getName(),
                email,
                passwordEncoder.encode(request.getPassword()),
                "LOCAL"
        );


        userRepository.save(user);

        return JwtUtil.generateToken(user.getEmail());
    }

    public String login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid password");
        }
        user.setOnline(true);
        userRepository.save(user);

        return JwtUtil.generateToken(user.getEmail());
    }

    public void logout(String email) {

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // ✅ Logout pe offline + lastSeen set karo
        user.setOnline(false);
        user.setLastSeen(Instant.now().toString());
        userRepository.save(user);
    }
}