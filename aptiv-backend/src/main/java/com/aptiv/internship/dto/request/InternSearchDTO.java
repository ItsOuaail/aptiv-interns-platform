package com.aptiv.internship.dto.request;

import com.aptiv.internship.entity.Intern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternSearchDTO {

    private String keyword;
    private String department;
    private String university;
    private String major;
    private String supervisor;
    private Intern.InternshipStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDateTo;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDateTo;

    // Sort options
    private String sortBy = "createdAt";
    private String sortDirection = "desc";

    // Pagination
    private int page = 0;
    private int size = 20;

    // Helper methods
    public boolean hasKeyword() {
        return keyword != null && !keyword.trim().isEmpty();
    }

    public boolean hasDepartment() {
        return department != null && !department.trim().isEmpty();
    }

    public boolean hasUniversity() {
        return university != null && !university.trim().isEmpty();
    }

    public boolean hasMajor() {
        return major != null && !major.trim().isEmpty();
    }

    public boolean hasSupervisor() {
        return supervisor != null && !supervisor.trim().isEmpty();
    }

    public boolean hasStatus() {
        return status != null;
    }

    public boolean hasStartDateRange() {
        return startDateFrom != null || startDateTo != null;
    }

    public boolean hasEndDateRange() {
        return endDateFrom != null || endDateTo != null;
    }

    public boolean hasDateFilters() {
        return hasStartDateRange() || hasEndDateRange();
    }

    public boolean hasAnyFilter() {
        return hasKeyword() || hasDepartment() || hasUniversity() ||
                hasMajor() || hasSupervisor() || hasStatus() || hasDateFilters();
    }
}