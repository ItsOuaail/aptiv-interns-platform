package com.aptiv.internship.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InternMessageRequest {
    @NotNull(message = "HR User ID is required")
    private Long hrUserId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Content is required")
    private String content;
}
