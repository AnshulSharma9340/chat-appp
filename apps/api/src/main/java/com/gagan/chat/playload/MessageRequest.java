package com.gagan.chat.playload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageRequest {
    private  String content;
    private  String sender;
    private  String roomsId;
    private String fileUrl;
    private String fileType;
}