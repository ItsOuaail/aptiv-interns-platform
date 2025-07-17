package com.aptiv.internship.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
public class InternSearchResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String university;
    private String major;
    private String department;
    private String supervisor;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    public void setId(Long id) {
    }

    // constructors, getters, and setters
}