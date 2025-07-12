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
    private Long internId;
    private String internName;
    private Long senderId;
    private String senderName;
}