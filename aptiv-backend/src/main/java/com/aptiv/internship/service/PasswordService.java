package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.ChangePasswordRequest;
import com.aptiv.internship.dto.response.ChangePasswordResponse;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ChangePasswordResponse changePassword(User user, ChangePasswordRequest request) {
        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return new ChangePasswordResponse(false, "Current password is incorrect");
        }

        // Validate new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new ChangePasswordResponse(false, "New password and confirmation do not match");
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return new ChangePasswordResponse(false, "New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new ChangePasswordResponse(true, "Password changed successfully");
    }
}