package com.gagan.chat.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    public String getReply(String userMessage) {

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // Request body
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", userMessage);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.3-70b-versatile");
        requestBody.put("messages", List.of(message));
        requestBody.put("max_tokens", 500);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // API call
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, entity, Map.class);
            System.out.println("Full Response: " + response.getBody());

            List choices = (List) response.getBody().get("choices");
            Map choice = (Map) choices.get(0);
            Map msg = (Map) choice.get("message");
            return (String) msg.get("content");

        } catch (Exception e) {
            e.printStackTrace();
            return "Kuch gadbad ho gayi 😅 Please try again!";
        }
    }
}
