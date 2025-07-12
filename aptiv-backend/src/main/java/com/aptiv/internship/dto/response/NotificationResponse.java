package com.aptiv.internship.dto.response;

import com.aptiv.internship.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long internId;
    private String internName;
}