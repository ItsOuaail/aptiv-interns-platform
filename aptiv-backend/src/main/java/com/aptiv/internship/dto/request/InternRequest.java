package com.aptiv.internship.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InternRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number must be valid")
    private String phone;

    @NotBlank(message = "University is required")
    @Size(min = 2, max = 100, message = "University name must be between 2 and 100 characters")
    private String university;

    @NotBlank(message = "Major is required")
    @Size(min = 2, max = 100, message = "Major must be between 2 and 100 characters")
    private String major;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    @NotBlank(message = "Supervisor is required")
    @Size(min = 2, max = 100, message = "Supervisor name must be between 2 and 100 characters")
    private String supervisor;

    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 100, message = "Department must be between 2 and 100 characters")
    private String department;

    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateAfterStartDate() {
        return endDate == null || startDate == null || endDate.isAfter(startDate);
    }
}