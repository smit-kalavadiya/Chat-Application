package com.smitkalavadiya.authentication.controller;

import com.smitkalavadiya.authentication.model.User;
import com.smitkalavadiya.authentication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PublicController {

    @Autowired
    UserService userService;

    @GetMapping("/health")
    public String getData(){
        return "All Looks Good!";
    }

    @GetMapping("/me")
    public Optional<User> getUser(Authentication authentication){
        String email = authentication.getName();
        return userService.findUserByEmail(email);
    }
}
