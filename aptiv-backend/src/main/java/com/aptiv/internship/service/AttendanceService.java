package com.aptiv.internship.service;

import com.aptiv.internship.dto.response.AttendanceResponse;
import com.aptiv.internship.entity.Attendance;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.AttendanceRepository;
import com.aptiv.internship.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final InternRepository internRepository;
    private final NotificationService notificationService;

    public AttendanceResponse checkIn() {
        Intern intern = getCurrentIntern();
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByInternAndAttendanceDate(intern, today)
                .orElseGet(() -> {
                    Attendance newAttendance = new Attendance();
                    newAttendance.setIntern(intern);
                    newAttendance.setAttendanceDate(today);
                    return newAttendance;
                });

        attendance.setCheckInTime(LocalTime.now());
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        return convertToResponse(attendanceRepository.save(attendance));
    }

    public AttendanceResponse checkOut() {
        Intern intern = getCurrentIntern();
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByInternAndAttendanceDate(intern, today)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "date", today.toString()));

        attendance.setCheckOutTime(LocalTime.now());

        return convertToResponse(attendanceRepository.save(attendance));
    }

    private Intern getCurrentIntern() {
        String email = getCurrentUserEmail();
        return internRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", email));
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername(); // Assuming email is the username
    }

    private AttendanceResponse convertToResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setAttendanceDate(attendance.getAttendanceDate());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());
        response.setStatus(attendance.getStatus());
        response.setRemarks(attendance.getRemarks());
        response.setInternId(attendance.getIntern().getId());
        response.setInternName(attendance.getIntern().getFirstName() + " " + attendance.getIntern().getLastName());
        return response;
    }
}