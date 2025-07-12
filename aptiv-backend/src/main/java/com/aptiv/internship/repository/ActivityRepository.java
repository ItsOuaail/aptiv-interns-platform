package com.aptiv.internship.repository;

import com.aptiv.internship.entity.Activity;
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
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByIntern(Intern intern);

    Page<Activity> findByIntern(Intern intern, Pageable pageable);

    List<Activity> findByInternAndActivityDateBetween(Intern intern, LocalDate startDate, LocalDate endDate);

    Optional<Activity> findByInternAndActivityDate(Intern intern, LocalDate activityDate);

    @Query("SELECT a FROM Activity a WHERE a.intern = :intern ORDER BY a.activityDate DESC")
    Page<Activity> findByInternOrderByActivityDateDesc(@Param("intern") Intern intern, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.intern.user.id = :userId ORDER BY a.activityDate DESC")
    Page<Activity> findByInternUserIdOrderByActivityDateDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Activity a WHERE a.intern = :intern")
    long countByIntern(@Param("intern") Intern intern);

    @Query("SELECT COUNT(a) FROM Activity a WHERE a.intern = :intern AND a.activityDate BETWEEN :startDate AND :endDate")
    long countByInternAndActivityDateBetween(
            @Param("intern") Intern intern,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    boolean existsByInternAndActivityDate(Intern intern, LocalDate activityDate);

    @Query("SELECT a FROM Activity a WHERE a.intern.id IN :internIds AND a.activityDate BETWEEN :startDate AND :endDate")
    List<Activity> findByInternIdsAndDateRange(
            @Param("internIds") List<Long> internIds,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}