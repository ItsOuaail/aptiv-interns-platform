package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.LoginRequest;
import com.aptiv.internship.dto.response.LoginResponse;
import com.aptiv.internship.dto.response.UserDTO;
import com.aptiv.internship.util.JwtUtil;
import com.aptiv.internship.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")  // Changed from "/api/auth"
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        User user = (User) authentication.getPrincipal(); // your custom User entity
        String token = jwtUtil.generateToken(user, user.getRole().name());

        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isActive()
        );

        LoginResponse response = new LoginResponse(token, userDTO);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/profile")
    public User getCurrentUser(@AuthenticationPrincipal User user) {
        return user;
    }

    public UserDetailsService getUserDetailsService() {
        return userDetailsService;
    }
}

