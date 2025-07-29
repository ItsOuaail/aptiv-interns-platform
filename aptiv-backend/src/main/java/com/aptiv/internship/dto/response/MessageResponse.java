package com.aptiv.internship.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private Long id;
    private String subject;
    private String content;
    private Boolean isRead;
    private LocalDateTime sentAt;
    private String messageType; // "HR_TO_INTERN" or "INTERN_TO_HR"

    // Intern information (always present)
    private Long internId;
    private String internName;

    // Sender information (always present)
    private Long senderId;
    private String senderName;

    // Recipient information (only for INTERN_TO_HR messages)
    private Long recipientId;
    private String recipientName;

    // Helper methods for frontend
    public boolean isFromHR() {
        return "HR_TO_INTERN".equals(messageType);
    }

    public boolean isFromIntern() {
        return "INTERN_TO_HR".equals(messageType);
    }
}