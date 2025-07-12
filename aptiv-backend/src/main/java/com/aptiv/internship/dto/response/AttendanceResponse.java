package com.aptiv.internship.dto.response;

import com.aptiv.internship.entity.Attendance;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceResponse {

    private Long id;
    private LocalDate attendanceDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Attendance.AttendanceStatus status;
    private String remarks;
    private Long internId;
    private String internName;
}