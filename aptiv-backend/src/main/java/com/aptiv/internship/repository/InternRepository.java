package com.aptiv.internship.repository;

import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InternRepository extends JpaRepository<Intern, Long>, JpaSpecificationExecutor<Intern> {
    @Query("SELECT i FROM Intern i WHERE " +
            "LOWER(i.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.university) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.major) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.department) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.supervisor) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Intern> findByKeyword(String keyword, Pageable pageable);

    Optional<Intern> findByEmail(String email);


    /**
     * Count interns with end dates between two dates and specific status
     */
    long countByEndDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, Intern.InternshipStatus status);

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

    List<Intern> findByEndDateBetween(LocalDate localDate, LocalDate localDate1);
    Page<Intern> findByStatus(Intern.InternshipStatus status, Pageable pageable);

    Page<Intern> findByDepartmentContainingIgnoreCase(String department, Pageable pageable);

    Page<Intern> findByUniversityContainingIgnoreCase(String university, Pageable pageable);

    Page<Intern> findBySupervisorContainingIgnoreCase(String supervisor, Pageable pageable);

    Page<Intern> findByMajorContainingIgnoreCase(String major, Pageable pageable);

    // Advanced search queries
    @Query("SELECT i FROM Intern i WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(i.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.university) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.major) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.department) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.supervisor) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Intern> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT i FROM Intern i WHERE " +
            "(:department IS NULL OR LOWER(i.department) LIKE LOWER(CONCAT('%', :department, '%'))) AND " +
            "(:university IS NULL OR LOWER(i.university) LIKE LOWER(CONCAT('%', :university, '%'))) AND " +
            "(:major IS NULL OR LOWER(i.major) LIKE LOWER(CONCAT('%', :major, '%'))) AND " +
            "(:supervisor IS NULL OR LOWER(i.supervisor) LIKE LOWER(CONCAT('%', :supervisor, '%'))) AND " +
            "(:status IS NULL OR i.status = :status)")
    Page<Intern> searchByFilters(
            @Param("department") String department,
            @Param("university") String university,
            @Param("major") String major,
            @Param("supervisor") String supervisor,
            @Param("status") Intern.InternshipStatus status,
            Pageable pageable);

    // Search by date ranges
    @Query("SELECT i FROM Intern i WHERE " +
            "(:startDateFrom IS NULL OR i.startDate >= :startDateFrom) AND " +
            "(:startDateTo IS NULL OR i.startDate <= :startDateTo) AND " +
            "(:endDateFrom IS NULL OR i.endDate >= :endDateFrom) AND " +
            "(:endDateTo IS NULL OR i.endDate <= :endDateTo)")
    Page<Intern> searchByDateRanges(
            @Param("startDateFrom") java.time.LocalDate startDateFrom,
            @Param("startDateTo") java.time.LocalDate startDateTo,
            @Param("endDateFrom") java.time.LocalDate endDateFrom,
            @Param("endDateTo") java.time.LocalDate endDateTo,
            Pageable pageable);

    // Count methods for statistics
    long countByStatus(Intern.InternshipStatus status);

    long countByDepartment(String department);

    long countByUniversity(String university);

    @Query("SELECT COUNT(i) FROM Intern i WHERE " +
            "i.startDate <= CURRENT_DATE AND i.endDate >= CURRENT_DATE")
    long countActiveInternsByDateRange();

    // Get distinct values for filter options
    @Query("SELECT DISTINCT i.department FROM Intern i WHERE i.department IS NOT NULL ORDER BY i.department")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT i.university FROM Intern i WHERE i.university IS NOT NULL ORDER BY i.university")
    List<String> findDistinctUniversities();

    @Query("SELECT DISTINCT i.major FROM Intern i WHERE i.major IS NOT NULL ORDER BY i.major")
    List<String> findDistinctMajors();

    @Query("SELECT DISTINCT i.supervisor FROM Intern i WHERE i.supervisor IS NOT NULL ORDER BY i.supervisor")
    List<String> findDistinctSupervisors();
    List<Intern> findByEmailIn(List<String> emails);

    //Optional<Object> findAll(Specification<Intern> spec, Pageable pageable);

}