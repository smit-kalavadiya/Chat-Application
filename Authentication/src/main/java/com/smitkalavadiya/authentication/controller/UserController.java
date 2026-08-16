package com.smitkalavadiya.authentication.controller;

import com.smitkalavadiya.authentication.dto.LoginRequest;
import com.smitkalavadiya.authentication.model.User;
import com.smitkalavadiya.authentication.security.JwtUtil;
import com.smitkalavadiya.authentication.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    UserService userService;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<User> addUser(@Valid @RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userService.addUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/getuser")
    public ResponseEntity<Optional<User>> findUserByEmail(@RequestBody User user) {
        Optional<User> fetchedUser = userService.findUserByEmail(user.getEmail());
        return ResponseEntity.ok(fetchedUser);
    }

    //Add Login Functionality
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        return jwtUtil.generateToken(request.getEmail());
    }

}
