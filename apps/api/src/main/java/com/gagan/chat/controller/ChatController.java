package com.gagan.chat.controller;

import com.gagan.chat.entities.Message;
import com.gagan.chat.entities.Room;
import com.gagan.chat.playload.MessageRequest;
import com.gagan.chat.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin("http://localhost:3000")
public class ChatController {
    private RoomRepository roomRepository;
    public ChatController(RoomRepository roomRepository){
        this.roomRepository=roomRepository;
    }
    //for sending and receiving messages
    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ){
        Room room=roomRepository.findByRoomId(request.getRoonId());

        Message message=new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());
        if(room!=null){
            room.getMessages().add(message);
            roomRepository.save(room);

        }
        else{
            throw new RuntimeException("room not found!!");
        }
        return  message;
    }
}
