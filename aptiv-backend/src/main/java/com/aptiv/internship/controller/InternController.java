package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.InternRequest;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.service.InternService;
import com.aptiv.internship.util.ExcelParser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/interns")
@RequiredArgsConstructor
public class InternController {

    private final InternService internService;
    private final ExcelParser excelParser; // Add this dependency

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
}