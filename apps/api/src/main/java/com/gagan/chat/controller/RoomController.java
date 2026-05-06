package com.gagan.chat.controller;

import com.gagan.chat.entities.Room;
import com.gagan.chat.repositories.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.gagan.chat.entities.Message;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:3000")
public class RoomController {

    private RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //create room
    @PostMapping
    public ResponseEntity<?> createrRoom(@RequestBody String roomId){
        if(roomRepository.findByRoomId(roomId)!=null){
            return ResponseEntity.badRequest().body("room is already exists");
        }
        Room room =new Room();
        room.setRoomId(roomId);
        Room saveRoom=roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    //get room:join
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(
            @PathVariable String roomId
    ){
        Room room=roomRepository.findByRoomId(roomId);
        if(room==null){
            return ResponseEntity.badRequest().body("Room not found!!");
        }
        return ResponseEntity.ok(room);
    }

    //get message for room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value="page", defaultValue = "0",required = false)int page,
            @RequestParam(value="size", defaultValue = "20",required = false)int size
    )
    {
        Room room=roomRepository.findByRoomId(roomId);
        if(room==null){
            return ResponseEntity.badRequest().build()
                    ;
        }
        //get message
        //pagination

        List<Message> messages = room.getMessages();
        int start=Math.max(0,messages.size()-(page +1)*size);
        int end= Math.min(messages.size(),start+size);
        List<Message> paginatedMessages=messages.subList(start,end);
        return ResponseEntity.ok(paginatedMessages);

    }
}
