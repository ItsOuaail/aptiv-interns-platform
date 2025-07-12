package com.aptiv.internship.repository;

import com.aptiv.internship.entity.Attendance;
import com.aptiv.internship.entity.Intern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByIntern(Intern intern);

    Page<Attendance> findByIntern(Intern intern, Pageable pageable);

    Optional<Attendance> findByInternAndAttendanceDate(Intern intern, LocalDate attendanceDate);

    List<Attendance> findByInternAndAttendanceDateBetween(Intern intern, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByInternAndStatus(Intern intern, Attendance.AttendanceStatus status);

    @Query("SELECT a FROM Attendance a WHERE a.intern = :intern AND a.status = :status ORDER BY a.attendanceDate DESC")
    List<Attendance> findByInternAndStatusOrderByAttendanceDateDesc(
            @Param("intern") Intern intern,
            @Param("status") Attendance.AttendanceStatus status
    );

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.intern = :intern AND a.status = :status")
    long countByInternAndStatus(@Param("intern") Intern intern, @Param("status") Attendance.AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.intern = :intern AND a.attendanceDate BETWEEN :startDate AND :endDate")
    long countByInternAndAttendanceDateBetween(
            @Param("intern") Intern intern,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM Attendance a WHERE a.intern = :intern AND a.status = 'ABSENT' AND a.attendanceDate BETWEEN :startDate AND :endDate ORDER BY a.attendanceDate")
    List<Attendance> findConsecutiveAbsences(
            @Param("intern") Intern intern,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT (COUNT(a) * 100.0 / (SELECT COUNT(*) FROM Attendance att WHERE att.intern = :intern AND att.attendanceDate BETWEEN :startDate AND :endDate)) " +
            "FROM Attendance a WHERE a.intern = :intern AND a.status = 'PRESENT' AND a.attendanceDate BETWEEN :startDate AND :endDate")
    Double calculateAttendanceRate(
            @Param("intern") Intern intern,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    boolean existsByInternAndAttendanceDate(Intern intern, LocalDate attendanceDate);
}