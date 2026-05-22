package com.gagan.chat.controller;

import com.gagan.chat.entities.Message;
import com.gagan.chat.entities.Room;
import com.gagan.chat.playload.MessageRequest;
import com.gagan.chat.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.ArrayList;

    @Controller
    @CrossOrigin("http://localhost:3000")
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
        public void sendMessage(
                @DestinationVariable String roomId,
                MessageRequest request
        ) {

            Room room = roomRepository.findByRoomId(roomId);

            Message message = new Message();
            message.setContent(request.getContent());
            message.setSender(request.getSender());
            message.setTimeStamp(LocalDateTime.now());

            if (room == null) {
                room = new Room();
                room.setRoomId(roomId);
                room.setMessages(new ArrayList<>());
            }

            room.getMessages().add(message);
            roomRepository.save(room);

            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId,
                    message
            );

            System.out.println("Message Sent : " + message);
        }
    }