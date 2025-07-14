package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.InternRequest;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.service.InternService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/interns")
@RequiredArgsConstructor
public class InternController {
    private final InternService internService;

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
    public ResponseEntity<Page<InternResponse>> getAllInterns(Pageable pageable) {
        return ResponseEntity.ok(internService.getAllInterns(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<InternResponse> getMyInternProfile() {
        return ResponseEntity.ok(internService.getCurrentInternProfile());
    }
}