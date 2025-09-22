package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.ChangePasswordRequest;
import com.aptiv.internship.dto.request.LoginRequest;
import com.aptiv.internship.dto.response.ChangePasswordResponse;
import com.aptiv.internship.dto.response.LoginResponse;
import com.aptiv.internship.dto.response.UserDTO;
import com.aptiv.internship.service.PasswordService;
import com.aptiv.internship.util.JwtUtil;
import com.aptiv.internship.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final PasswordService passwordService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user, user.getRole().name());

        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isActive(),
                user.shouldChangePassword() // Include the shouldChangePassword flag
        );

        LoginResponse response = new LoginResponse(token, userDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {

        ChangePasswordResponse response = passwordService.changePassword(user, request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/profile")
    public User getCurrentUser(@AuthenticationPrincipal User user) {
        return user;
    }

    public UserDetailsService getUserDetailsService() {
        return userDetailsService;
    }
}