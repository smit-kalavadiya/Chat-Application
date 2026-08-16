package com.smitkalavadiya.chatservice.controller;

import com.smitkalavadiya.chatservice.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/send")             // Receives messages sent to /app/chat
    @SendTo("/topic/messages")           // Broadcasts to /topic/messages
    public ChatMessage sendMessage(ChatMessage message) {
        System.out.println("Sending message: " + message.getFrom());
        return message; // broadcast to all connected clients
    }
}