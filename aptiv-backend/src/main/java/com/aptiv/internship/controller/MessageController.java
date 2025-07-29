package com.aptiv.internship.controller;

import com.aptiv.internship.repository.UserRepository;
import com.aptiv.internship.dto.request.InternMessageRequest;
import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    private final UserRepository userRepository;

    /**
     * HR sends message to intern
     */
    @PostMapping("/to-intern")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<MessageResponse> sendMessageToIntern(@Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessageToIntern(request));
    }

    /**
     * Intern sends message to HR
     */
    @PostMapping("/to-hr")
    @PreAuthorize("hasRole('INTERN') or hasRole('HR')")
    public ResponseEntity<MessageResponse> sendMessageToHR(@Valid @RequestBody InternMessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessageToHR(request));
    }

    /**
     * Get my messages (works for both HR and INTERN)
     */
    @GetMapping("/my")
    public ResponseEntity<Page<MessageResponse>> getMyMessages(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(messageService.getMyMessages(pageable));
    }

    /**
     * Get conversation between intern and HR
     */
    @GetMapping("/conversation")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<MessageResponse>> getConversation(
            @RequestParam Long internId,
            @RequestParam Long hrUserId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(messageService.getConversation(internId, hrUserId, pageable));
    }

    /**
     * Mark message as read
     */
    @PatchMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount() {
        return ResponseEntity.ok(messageService.getUnreadMessageCount());
    }

    /**
     * Backward compatibility - keep existing endpoint for HR
     */
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessageToIntern(request));
    }

    /**
     * Get all HR users (for intern to choose who to send message to)
     */
    @GetMapping("/hr-users")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<Page<UserSummaryDTO>> getHRUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<User> hrUsers = userRepository.findByRole(User.Role.HR, pageable);
        Page<UserSummaryDTO> response = hrUsers.map(user -> new UserSummaryDTO(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail()
        ));
        return ResponseEntity.ok(response);
    }

    // Inner DTO class
    public static class UserSummaryDTO {
        private Long id;
        private String fullName;
        private String email;

        public UserSummaryDTO(Long id, String fullName, String email) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
        }

        // Getters
        public Long getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }

        // Setters
        public void setId(Long id) { this.id = id; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public void setEmail(String email) { this.email = email; }
    }
}