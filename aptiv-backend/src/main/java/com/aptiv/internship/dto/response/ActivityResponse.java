package com.aptiv.internship.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ActivityResponse {

    private Long id;
    private LocalDate activityDate;
    private String description;
    private LocalDateTime createdAt;
    private Long internId;
    private String internName;
}