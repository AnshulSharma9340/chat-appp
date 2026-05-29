package com.gagan.chat.controller;

import com.gagan.chat.entities.Message;
import com.gagan.chat.entities.Room;
import com.gagan.chat.playload.MessageRequest;
import com.gagan.chat.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Controller
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(
            RoomRepository roomRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.roomRepository = roomRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            MessageRequest request
    ) {
        Room room = roomRepository.findByRoomId(roomId);

        if (room == null) {
            room = new Room();
            room.setRoomId(roomId);
            room.setMessages(new ArrayList<>());
        }

        Message message = new Message();
        message.setSender(request.getSender());
        message.setContent(request.getContent());
        message.setTimeStamp(LocalDateTime.now());

        if (request.getFileUrl() != null) {
            message.setFileUrl(request.getFileUrl());
        }

        if (request.getFileType() != null) {
            message.setFileType(request.getFileType());
        }

        room.getMessages().add(message);
        roomRepository.save(room);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                message
        );

        System.out.println("Message Sent: " + message);
    }

    // user online/offline status
    public void sendUserStatus(String userId, boolean online) {
        Map<String, Object> status = new HashMap<>();
        status.put("userId", userId);
        status.put("online", online);

        messagingTemplate.convertAndSend("/topic/status", (Object) status);

        System.out.println("User Status Updated: " + userId + " -> " + online);
    }
}