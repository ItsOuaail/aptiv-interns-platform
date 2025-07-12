package com.aptiv.internship.repository;

import com.aptiv.internship.entity.Document;
import com.aptiv.internship.entity.Intern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByIntern(Intern intern);

    Page<Document> findByIntern(Intern intern, Pageable pageable);

    List<Document> findByInternAndType(Intern intern, Document.DocumentType type);

    @Query("SELECT d FROM Document d WHERE d.intern = :intern ORDER BY d.uploadedAt DESC")
    Page<Document> findByInternOrderByUploadedAtDesc(@Param("intern") Intern intern, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.intern.user.id = :userId ORDER BY d.uploadedAt DESC")
    Page<Document> findByInternUserIdOrderByUploadedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.intern = :intern")
    long countByIntern(@Param("intern") Intern intern);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.intern = :intern AND d.type = :type")
    long countByInternAndType(@Param("intern") Intern intern, @Param("type") Document.DocumentType type);

    @Query("SELECT d FROM Document d WHERE d.intern.id IN :internIds AND d.uploadedAt BETWEEN :startDate AND :endDate")
    List<Document> findByInternIdsAndUploadedAtBetween(
            @Param("internIds") List<Long> internIds,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    List<Document> findByType(Document.DocumentType type);
}