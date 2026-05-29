package com.gagan.chat.services;

import com.gagan.chat.entities.User;
import com.gagan.chat.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UserServices {

    private final UserRepository userRepository;

    public UserServices(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void setOnline(String userId, boolean status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setOnline(status);

        if (!status) {
            user.setLastSeen(Instant.now().toString());
        }

        userRepository.save(user);
    }
}