package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.InternMessageRequest;
import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.Message;
import com.aptiv.internship.entity.Notification;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.InternRepository;
import com.aptiv.internship.repository.MessageRepository;
import com.aptiv.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {
    private final MessageRepository messageRepository;
    private final InternRepository internRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * HR sends message to intern
     */
    @Transactional
    public MessageResponse sendMessageToIntern(MessageRequest request) {
        User hrUser = getCurrentUser();
        Intern intern = internRepository.findById(request.getInternId())
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", request.getInternId()));

        // Build email content
        String subject = "[Internship Message] " + request.getSubject();
        String emailBody = buildEmailBodyHRToIntern(request.getContent(), hrUser, intern);

        try {
            // 1. Send email
            emailService.sendEmail(intern.getEmail(), subject, emailBody);

            // 2. Create notification
            notificationService.createNotification(
                    request.getSubject(),
                    request.getContent(),
                    Notification.NotificationType.MESSAGE_FROM_HR,
                    intern.getUser(),
                    intern
            );

            // 3. Save message to database
            Message message = Message.builder()
                    .subject(request.getSubject())
                    .content(request.getContent())
                    .intern(intern)
                    .sender(hrUser)
                    .messageType(Message.MessageType.HR_TO_INTERN)
                    .isRead(false)
                    .sentAt(LocalDateTime.now())
                    .build();

            Message savedMessage = messageRepository.save(message);
            log.info("Message sent from HR {} to intern {}", hrUser.getId(), intern.getId());

            return convertToResponse(savedMessage);

        } catch (Exception e) {
            log.error("Failed to send message from HR {} to intern {}: {}",
                    hrUser.getId(), intern.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send message: " + e.getMessage(), e);
        }
    }

    /**
     * Intern sends message to HR
     */
    @Transactional
    public MessageResponse sendMessageToHR(InternMessageRequest request) {
        User currentUser = getCurrentUser();

        // Get the intern record for the current user
        Intern intern = internRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", currentUser.getEmail()));

        // Get the HR user
        User hrUser = userRepository.findById(request.getHrUserId())
                .orElseThrow(() -> new ResourceNotFoundException("HR User", "id", request.getHrUserId()));

        // Verify the recipient is actually HR
        if (!hrUser.getRole().equals(User.Role.HR)) {
            throw new IllegalArgumentException("Recipient must be an HR user");
        }

        // Build email content
        String subject = "[Intern Message] " + request.getSubject();
        String emailBody = buildEmailBodyInternToHR(request.getContent(), intern, hrUser);

        try {
            // 1. Send email to HR
            emailService.sendEmail(hrUser.getEmail(), subject, emailBody);

            // 2. Create notification for HR
            notificationService.createNotification(
                    request.getSubject(),
                    request.getContent(),
                    Notification.NotificationType.MESSAGE_FROM_INTERN,
                    hrUser,
                    intern
            );

            // 3. Save message to database
            Message message = Message.builder()
                    .subject(request.getSubject())
                    .content(request.getContent())
                    .intern(intern)
                    .sender(currentUser) // The intern's user account
                    .recipient(hrUser)   // The HR user receiving the message
                    .messageType(Message.MessageType.INTERN_TO_HR)
                    .isRead(false)
                    .sentAt(LocalDateTime.now())
                    .build();

            Message savedMessage = messageRepository.save(message);
            log.info("Message sent from intern {} to HR {}", intern.getId(), hrUser.getId());

            return convertToResponse(savedMessage);

        } catch (Exception e) {
            log.error("Failed to send message from intern {} to HR {}: {}",
                    intern.getId(), hrUser.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send message: " + e.getMessage(), e);
        }
    }

    /**
     * Get messages for current user (works for both HR and INTERN)
     */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMyMessages(Pageable pageable) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole().equals(User.Role.HR)) {
            // HR sees all messages (sent and received)
            Page<Message> messages = messageRepository.findAllMessagesForHR(currentUser.getId(), pageable);
            return messages.map(this::convertToResponse);
        } else {
            // Intern sees messages related to them
            Intern intern = internRepository.findByEmail(currentUser.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", currentUser.getEmail()));

            Page<Message> messages = messageRepository.findByInternIdOrderBySentAtDesc(intern.getId(), pageable);
            return messages.map(this::convertToResponse);
        }
    }

    /**
     * Get a single message by ID (works for both HR and INTERN)
     */
    @Transactional(readOnly = true)
    public MessageResponse getMessage(Long messageId) {
        User currentUser = getCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));

        // Verify user has permission to view this message
        boolean canViewMessage = false;

        if (currentUser.getRole().equals(User.Role.HR)) {
            // HR can view messages they sent or received
            canViewMessage = message.getSender().getId().equals(currentUser.getId()) ||
                    (message.getRecipient() != null && message.getRecipient().getId().equals(currentUser.getId()));
        } else {
            // Intern can view messages they are involved in
            Intern intern = internRepository.findByEmail(currentUser.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", currentUser.getEmail()));
            canViewMessage = message.getIntern().getId().equals(intern.getId());
        }

        if (!canViewMessage) {
            throw new IllegalArgumentException("You don't have permission to view this message");
        }

        log.info("Message {} retrieved by user {}", messageId, currentUser.getId());
        return convertToResponse(message);
    }

    /**
     * Delete a message (works for both HR and INTERN)
     */
    @Transactional
    public void deleteMessage(Long messageId) {
        User currentUser = getCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));

        // Verify user has permission to delete this message
        boolean canDeleteMessage = false;

        if (currentUser.getRole().equals(User.Role.HR)) {
            // HR can delete messages they sent or received
            canDeleteMessage = message.getSender().getId().equals(currentUser.getId()) ||
                    (message.getRecipient() != null && message.getRecipient().getId().equals(currentUser.getId()));
        } else {
            // Intern can delete messages they are involved in
            Intern intern = internRepository.findByEmail(currentUser.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", currentUser.getEmail()));
            canDeleteMessage = message.getIntern().getId().equals(intern.getId());
        }

        if (!canDeleteMessage) {
            throw new IllegalArgumentException("You don't have permission to delete this message");
        }

        messageRepository.delete(message);
        log.info("Message {} deleted by user {}", messageId, currentUser.getId());
    }

    /**
     * Get conversation between intern and HR
     */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversation(Long internId, Long hrUserId, Pageable pageable) {
        Page<Message> messages = messageRepository.findConversationBetweenInternAndHR(internId, hrUserId, pageable);
        return messages.map(this::convertToResponse);
    }

    /**
     * Mark message as read
     */
    @Transactional
    public void markAsRead(Long messageId) {
        User currentUser = getCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));

        // Verify user has permission to mark this message as read
        boolean canMarkAsRead = false;

        if (currentUser.getRole().equals(User.Role.HR)) {
            // HR can mark messages sent to them by interns
            canMarkAsRead = message.getMessageType().equals(Message.MessageType.INTERN_TO_HR)
                    && message.getRecipient().getId().equals(currentUser.getId());
        } else {
            // Intern can mark messages sent to them by HR
            canMarkAsRead = message.getMessageType().equals(Message.MessageType.HR_TO_INTERN)
                    && message.getIntern().getUser().getId().equals(currentUser.getId());
        }

        if (!canMarkAsRead) {
            throw new IllegalArgumentException("You don't have permission to mark this message as read");
        }

        message.setIsRead(true);
        messageRepository.save(message);
    }

    /**
     * Get unread message count for current user
     */
    @Transactional(readOnly = true)
    public long getUnreadMessageCount() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole().equals(User.Role.HR)) {
            return messageRepository.countByRecipientIdAndIsReadFalseAndMessageType(
                    currentUser.getId(), Message.MessageType.INTERN_TO_HR);
        } else {
            Intern intern = internRepository.findByEmail(currentUser.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", currentUser.getEmail()));
            return messageRepository.countByInternIdAndIsReadFalseAndMessageType(
                    intern.getId(), Message.MessageType.HR_TO_INTERN);
        }
    }

    // Helper methods
    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername();
    }

    private String buildEmailBodyHRToIntern(String content, User hrUser, Intern intern) {
        return String.format("""
            Dear %s,
            
            You have received a new message from HR:
            
            %s
            
            Best regards,
            %s %s
            HR Department
            """, intern.getFirstName(), content, hrUser.getFirstName(), hrUser.getLastName());
    }

    private String buildEmailBodyInternToHR(String content, Intern intern, User hrUser) {
        return String.format("""
            Dear %s,
            
            You have received a new message from intern %s %s:
            
            %s
            
            You can reply through the internship management system.
            
            Best regards,
            %s %s
            """, hrUser.getFirstName(), intern.getFirstName(), intern.getLastName(),
                content, intern.getFirstName(), intern.getLastName());
    }

    private MessageResponse convertToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSubject(message.getSubject());
        response.setContent(message.getContent());
        response.setIsRead(message.getIsRead());
        response.setSentAt(message.getSentAt());
        response.setMessageType(message.getMessageType().name());

        response.setInternId(message.getIntern().getId());
        response.setInternName(message.getIntern().getFirstName() + " " + message.getIntern().getLastName());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());

        if (message.getRecipient() != null) {
            response.setRecipientId(message.getRecipient().getId());
            response.setRecipientName(message.getRecipient().getFirstName() + " " + message.getRecipient().getLastName());
        }

        return response;
    }
}