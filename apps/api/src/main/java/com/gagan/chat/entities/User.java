package com.gagan.chat.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String provider;
    private boolean online;
    private String lastSeen;

    public User(String name, String email, String password, String provider) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.provider = provider;
        this.online = false;
        this.lastSeen = null;
    }
}