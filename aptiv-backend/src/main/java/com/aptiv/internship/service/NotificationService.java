package com.aptiv.internship.service;

import com.aptiv.internship.dto.response.NotificationResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.Notification;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.NotificationRepository;
import com.aptiv.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User user = getCurrentUser();
        return notificationRepository.findByUser(user, pageable)
                .map(this::convertToResponse);
    }

    public void markNotificationAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername(); // Assuming email is the username
    }

    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        if (notification.getIntern() != null) {
            response.setInternId(notification.getIntern().getId());
        }
        return response;
    }

    public void createNotification(String subject, String message, Notification.NotificationType notificationType, User user, Intern intern) {
        // Check if notification already exists to prevent duplicates
        boolean exists = notificationRepository.existsByInternAndTypeAndMessage(intern, notificationType, message);

        if (!exists) {
            Notification notification = new Notification();
            // DO NOT set the ID - let it be auto-generated
            notification.setTitle(subject);
            notification.setMessage(message);
            notification.setType(notificationType);
            notification.setUser(user);
            notification.setIntern(intern); // Set the intern relationship

            try {
                notificationRepository.save(notification);
            } catch (Exception e) {
                Logger log = null;
                log.error("Failed to save notification for intern {}: {}", intern.getId(), e.getMessage());
            }
        }
    }
}