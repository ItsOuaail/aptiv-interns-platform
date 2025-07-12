package com.aptiv.internship.repository;

import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.User;
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
public interface InternRepository extends JpaRepository<Intern, Long> {

    Optional<Intern> findByEmail(String email);

    List<Intern> findByUser(User user);

    Page<Intern> findByUser(User user, Pageable pageable);

    List<Intern> findByStatus(Intern.InternshipStatus status);

    @Query("SELECT i FROM Intern i WHERE i.status = :status AND i.endDate BETWEEN :startDate AND :endDate")
    List<Intern> findByStatusAndEndDateBetween(
            @Param("status") Intern.InternshipStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT i FROM Intern i WHERE i.status = 'ACTIVE' AND i.endDate <= :date")
    List<Intern> findActiveInternsEndingBefore(@Param("date") LocalDate date);

    @Query("SELECT i FROM Intern i WHERE i.status = 'ACTIVE' AND i.endDate BETWEEN :startDate AND :endDate")
    List<Intern> findActiveInternsEndingBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(i) FROM Intern i WHERE i.user = :user AND i.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") Intern.InternshipStatus status);

    boolean existsByEmail(String email);

    @Query("SELECT i FROM Intern i WHERE " +
            "(:firstName IS NULL OR LOWER(i.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) AND " +
            "(:lastName IS NULL OR LOWER(i.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) AND " +
            "(:email IS NULL OR LOWER(i.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:department IS NULL OR LOWER(i.department) LIKE LOWER(CONCAT('%', :department, '%'))) AND " +
            "(:status IS NULL OR i.status = :status)")
    Page<Intern> findByFilters(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("email") String email,
            @Param("department") String department,
            @Param("status") Intern.InternshipStatus status,
            Pageable pageable
    );
}