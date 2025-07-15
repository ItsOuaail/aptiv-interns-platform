package com.aptiv.internship.dto.response;

import com.aptiv.internship.entity.Intern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InternResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String university;
    private String major;
    private LocalDate startDate;
    private LocalDate endDate;
    private String supervisor;
    private String department;
    private Intern.InternshipStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String hrName;
    private String hrEmail;
    private Long activitiesCount;
    private Long documentsCount;
    private Double attendanceRate;
}