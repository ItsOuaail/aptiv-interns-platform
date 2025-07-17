package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.InternSearchDTO;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.service.InternSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interns/search")
@RequiredArgsConstructor
public class InternSearchController {

    private final InternSearchService internSearchService;

    /**
     * Advanced search with all parameters
     */
    @PostMapping("/advanced")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> advancedSearch(
            @RequestBody InternSearchDTO searchDTO) {

        Page<InternResponse> results = internSearchService.searchInterns(searchDTO);
        return ResponseEntity.ok(results);
    }

    /**
     * Quick search with query parameters
     */
    @GetMapping("/quick")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> quickSearch(
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
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        InternSearchDTO searchDTO = InternSearchDTO.builder()
                .keyword(keyword)
                .department(department)
                .university(university)
                .major(major)
                .supervisor(supervisor)
                .status(status)
                .startDateFrom(startDateFrom)
                .startDateTo(startDateTo)
                .endDateFrom(endDateFrom)
                .endDateTo(endDateTo)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .page(page)
                .size(size)
                .build();

        Page<InternResponse> results = internSearchService.searchInterns(searchDTO);
        return ResponseEntity.ok(results);
    }

    /**
     * Get filter options for search form
     */
    @GetMapping("/filters")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Map<String, Object> options = internSearchService.getSearchFilterOptions();
        return ResponseEntity.ok(options);
    }

    /**
     * Get search statistics
     */
    @GetMapping("/statistics")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getSearchStatistics() {
        Map<String, Object> stats = internSearchService.getSearchStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get search suggestions for autocomplete
     */
    @GetMapping("/suggestions")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, List<String>>> getSearchSuggestions(
            @RequestParam String query) {

        Map<String, List<String>> suggestions = internSearchService.getSearchSuggestions(query);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Export search results
     */
    @PostMapping("/export")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<InternResponse>> exportSearchResults(
            @RequestBody InternSearchDTO searchDTO) {

        List<InternResponse> results = internSearchService.exportSearchResults(searchDTO);
        return ResponseEntity.ok(results);
    }

    /**
     * Search by multiple criteria (alternative endpoint)
     */
    @GetMapping("/criteria")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<InternResponse>> searchByCriteria(
            @RequestParam(required = false) String[] departments,
            @RequestParam(required = false) String[] universities,
            @RequestParam(required = false) String[] majors,
            @RequestParam(required = false) String[] supervisors,
            @RequestParam(required = false) Intern.InternshipStatus[] statuses,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        // This endpoint can be extended to handle multiple values for each filter
        // For now, it's a placeholder for future enhancement

        InternSearchDTO searchDTO = InternSearchDTO.builder()
                .department(departments != null && departments.length > 0 ? departments[0] : null)
                .university(universities != null && universities.length > 0 ? universities[0] : null)
                .major(majors != null && majors.length > 0 ? majors[0] : null)
                .supervisor(supervisors != null && supervisors.length > 0 ? supervisors[0] : null)
                .status(statuses != null && statuses.length > 0 ? statuses[0] : null)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .build();

        Page<InternResponse> results = internSearchService.searchInterns(searchDTO);
        return ResponseEntity.ok(results);
    }
}