package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.InternSearchDTO;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InternSearchService {

    private final InternRepository internRepository;
    private final InternService internService;

    /**
     * Search interns using search DTO
     */
    @Transactional(readOnly = true)
    public Page<InternResponse> searchInterns(InternSearchDTO searchDTO) {
        Pageable pageable = createPageable(searchDTO);

        Page<Intern> interns = (Page<Intern>) internService.searchInterns(
                searchDTO.getKeyword(),
                searchDTO.getDepartment(),
                searchDTO.getUniversity(),
                searchDTO.getMajor(),
                searchDTO.getSupervisor(),
                searchDTO.getStatus(),
                searchDTO.getStartDateFrom(),
                searchDTO.getStartDateTo(),
                searchDTO.getEndDateFrom(),
                searchDTO.getEndDateTo(),
                pageable
        );

        return interns.map(this::convertToResponse);
    }

    /**
     * Get search filter options
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSearchFilterOptions() {
        Map<String, Object> options = new HashMap<>();

        options.put("departments", internRepository.findDistinctDepartments());
        options.put("universities", internRepository.findDistinctUniversities());
        options.put("majors", internRepository.findDistinctMajors());
        options.put("supervisors", internRepository.findDistinctSupervisors());
        options.put("statuses", Intern.InternshipStatus.values());

        return options;
    }

    /**
     * Get search statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSearchStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Count by status
        Map<String, Long> statusCounts = new HashMap<>();
        for (Intern.InternshipStatus status : Intern.InternshipStatus.values()) {
            statusCounts.put(status.name(), internRepository.countByStatus(status));
        }
        stats.put("statusCounts", statusCounts);

        // Total count
        stats.put("totalInterns", internRepository.count());

        // Active interns by date range
        stats.put("activeInternsByDateRange", internRepository.countActiveInternsByDateRange());

        // Top departments
        List<String> departments = internRepository.findDistinctDepartments();
        Map<String, Long> departmentCounts = new HashMap<>();
        for (String department : departments) {
            departmentCounts.put(department, internRepository.countByDepartment(department));
        }
        stats.put("departmentCounts", departmentCounts);

        // Top universities
        List<String> universities = internRepository.findDistinctUniversities();
        Map<String, Long> universityCounts = new HashMap<>();
        for (String university : universities) {
            universityCounts.put(university, internRepository.countByUniversity(university));
        }
        stats.put("universityCounts", universityCounts);

        return stats;
    }

    /**
     * Quick search suggestions
     */
    @Transactional(readOnly = true)
    public Map<String, List<String>> getSearchSuggestions(String query) {
        Map<String, List<String>> suggestions = new HashMap<>();

        if (query == null || query.trim().isEmpty()) {
            return suggestions;
        }

        String searchTerm = query.toLowerCase();

        // Department suggestions
        List<String> departments = internRepository.findDistinctDepartments()
                .stream()
                .filter(dept -> dept.toLowerCase().contains(searchTerm))
                .limit(5)
                .toList();
        suggestions.put("departments", departments);

        // University suggestions
        List<String> universities = internRepository.findDistinctUniversities()
                .stream()
                .filter(uni -> uni.toLowerCase().contains(searchTerm))
                .limit(5)
                .toList();
        suggestions.put("universities", universities);

        // Major suggestions
        List<String> majors = internRepository.findDistinctMajors()
                .stream()
                .filter(major -> major.toLowerCase().contains(searchTerm))
                .limit(5)
                .toList();
        suggestions.put("majors", majors);

        // Supervisor suggestions
        List<String> supervisors = internRepository.findDistinctSupervisors()
                .stream()
                .filter(supervisor -> supervisor.toLowerCase().contains(searchTerm))
                .limit(5)
                .toList();
        suggestions.put("supervisors", supervisors);

        return suggestions;
    }

    /**
     * Export search results
     */
    @Transactional(readOnly = true)
    public List<InternResponse> exportSearchResults(InternSearchDTO searchDTO) {
        // Remove pagination for export
        searchDTO.setPage(0);
        searchDTO.setSize(Integer.MAX_VALUE);

        Page<InternResponse> results = searchInterns(searchDTO);
        return results.getContent();
    }

    /**
     * Create pageable from search DTO
     */
    private Pageable createPageable(InternSearchDTO searchDTO) {
        Sort.Direction direction = searchDTO.getSortDirection().equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        Sort sort = Sort.by(direction, searchDTO.getSortBy());

        return PageRequest.of(searchDTO.getPage(), searchDTO.getSize(), sort);
    }

    /**
     * Convert Intern entity to response DTO
     */
    private InternResponse convertToResponse(Intern intern) {
        return internService.convertToResponse(intern);
    }
}