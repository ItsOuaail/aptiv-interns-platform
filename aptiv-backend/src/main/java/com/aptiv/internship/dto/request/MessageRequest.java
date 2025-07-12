package com.aptiv.internship.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull(message = "Intern ID is required")
    private Long internId;

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 200, message = "Subject must be between 5 and 200 characters")
    private String subject;

    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    private String content;
}