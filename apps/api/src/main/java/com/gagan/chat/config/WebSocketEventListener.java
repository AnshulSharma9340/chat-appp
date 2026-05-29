package com.gagan.chat.config;

import com.gagan.chat.controller.ChatController;
import com.gagan.chat.services.UserServices;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
public class WebSocketEventListener {

    private final UserServices userService;
    private final ChatController chatController;

    public WebSocketEventListener(
            UserServices userService,
            ChatController chatController
    ) {
        this.userService = userService;
        this.chatController = chatController;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor =
                StompHeaderAccessor.wrap(event.getMessage());

        String userId = headerAccessor.getFirstNativeHeader("userId");

        if (userId != null && !userId.isEmpty()) {

            Map<String, Object> sessionAttributes =
                    headerAccessor.getSessionAttributes();

            if (sessionAttributes != null) {
                sessionAttributes.put("userId", userId);
                userService.setOnline(userId, true);
                chatController.sendUserStatus(userId, true);
                System.out.println("✅ User connected: " + userId);
            } else {
                System.out.println("⚠️ Session attributes null for userId: " + userId);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Map<String, Object> sessionAttributes =
                headerAccessor.getSessionAttributes();

        if (sessionAttributes == null) {
            System.out.println("⚠️ Disconnect: session attributes null");
            return;
        }

        String userId = (String) sessionAttributes.get("userId");

        if (userId != null && !userId.isEmpty()) {
            userService.setOnline(userId, false);
            chatController.sendUserStatus(userId, false);
            System.out.println("🔴 User disconnected: " + userId);
        }
    }
}