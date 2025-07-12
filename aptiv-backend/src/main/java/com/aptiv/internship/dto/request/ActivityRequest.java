package com.aptiv.internship.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ActivityRequest {

    @NotNull(message = "Activity date is required")
    @PastOrPresent(message = "Activity date cannot be in the future")
    private LocalDate activityDate;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;
}