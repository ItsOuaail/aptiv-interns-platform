package com.aptiv.internship.controller;

import com.aptiv.internship.dto.response.AttendanceResponse;
import com.aptiv.internship.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping("/checkin")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<AttendanceResponse> checkIn() {
        return ResponseEntity.ok(attendanceService.checkIn());
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<AttendanceResponse> checkOut() {
        return ResponseEntity.ok(attendanceService.checkOut());
    }
}