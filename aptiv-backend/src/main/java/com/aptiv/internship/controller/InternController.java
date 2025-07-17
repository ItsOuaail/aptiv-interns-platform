package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.BatchMessageRequest;
import com.aptiv.internship.dto.request.BroadcastMessageRequest;
import com.aptiv.internship.dto.request.InternRequest;
import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.dto.response.InternSearchResponseDTO;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.service.InternService;
import com.aptiv.internship.util.ExcelParser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/interns")
@RequiredArgsConstructor
public class InternController {

    private final InternService internService;
    private final ExcelParser excelParser;

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<InternResponse> createIntern(@RequestBody InternRequest request) {
        return ResponseEntity.ok(internService.createIntern(request));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<InternResponse> getInternById(@PathVariable Long id) {
        return ResponseEntity.ok(internService.getInternById(id));
    }

    @GetMapping
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> getAllInterns(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(internService.getAllInterns(pageable));
    }

    /**
     * Advanced search with multiple filters
     */
    @GetMapping("/search")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> searchInterns(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String university,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String supervisor,
            @RequestParam(required = false) Intern.InternshipStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDateTo,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<InternResponse> results = (Page<InternResponse>) internService.searchInterns(
                keyword, department, university, major, supervisor, status,
                startDateFrom, startDateTo, endDateFrom, endDateTo, pageable);

        return ResponseEntity.ok(results);
    }

    /**
     * Simple keyword search
     */
    @GetMapping("/search/keyword")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public Page<InternSearchResponseDTO> searchByKeyword(
            @RequestParam String keyword,
            Pageable pageable) {

        Page<Intern> interns = internService.searchByKeyword(keyword, pageable);
        return interns.map(this::convertToDTO);
    }
    private InternSearchResponseDTO convertToDTO(Intern intern) {
        InternSearchResponseDTO dto = new InternSearchResponseDTO();
        dto.setId(intern.getId());
        dto.setFirstName(intern.getFirstName());
        dto.setLastName(intern.getLastName());
        dto.setEmail(intern.getEmail());

        // ... set other fields
        return dto;
    }
    /**
     * Search by department
     */
    @GetMapping("/search/department")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> searchByDepartment(
            @RequestParam String department,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(internService.getInternsByDepartment(department, pageable));
    }

    /**
     * Search by university
     */
    @GetMapping("/search/university")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> searchByUniversity(
            @RequestParam String university,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(internService.getInternsByUniversity(university, pageable));
    }

    /**
     * Search by status
     */
    @GetMapping("/search/status")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> searchByStatus(
            @RequestParam Intern.InternshipStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(internService.getInternsByStatus(status, pageable));
    }

    /**
     * Search by supervisor
     */
    @GetMapping("/search/supervisor")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> searchBySupervisor(
            @RequestParam String supervisor,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(internService.getInternsBySupervisor(supervisor, pageable));
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<InternResponse> getMyInternProfile() {
        return ResponseEntity.ok(internService.getCurrentInternProfile());
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<String> createInternsBatch(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal User user) {
        try {
            List<InternRequest> requests = excelParser.parseInterns(file);
            internService.createInternsBatch(requests, user);
            return ResponseEntity.ok("Interns added successfully: " + requests.size());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error in file data: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error reading file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<InternResponse> updateIntern(@PathVariable Long id, @RequestBody InternRequest request) {
        return ResponseEntity.ok(internService.updateIntern(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Void> deleteIntern(@PathVariable Long id) {
        internService.deleteIntern(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/message")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<MessageResponse> sendMessageToIntern(
            @PathVariable Long id,
            @RequestBody @Valid MessageRequest request) {

        // Override the internId with the path variable to ensure consistency
        request.setInternId(id);

        MessageResponse response = internService.sendMessageToIntern(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Send message to multiple interns
     */
    @PostMapping("/message/batch")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<MessageResponse>> sendMessageToMultipleInterns(
            @RequestBody @Valid BatchMessageRequest request) {

        List<MessageResponse> responses = internService.sendMessageToMultipleInterns(
                request.getInternIds(),
                request.getSubject(),
                request.getContent()
        );

        return ResponseEntity.ok(responses);
    }

    /**
     * Send message to all active interns
     */
    @PostMapping("/message/all")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<MessageResponse>> sendMessageToAllInterns(
            @RequestBody @Valid BroadcastMessageRequest request) {

        // Get all active interns
        List<Long> internIds = internService.getAllActiveInternIds();

        List<MessageResponse> responses = internService.sendMessageToMultipleInterns(
                internIds,
                request.getSubject(),
                request.getContent()
        );

        return ResponseEntity.ok(responses);
    }
}