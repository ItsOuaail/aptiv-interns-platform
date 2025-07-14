package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.ActivityRequest;
import com.aptiv.internship.dto.response.ActivityResponse;
import com.aptiv.internship.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @PostMapping
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<ActivityResponse> createActivity(@RequestBody ActivityRequest request) {
        return ResponseEntity.ok(activityService.createActivity(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<Page<ActivityResponse>> getMyActivities(Pageable pageable) {
        return ResponseEntity.ok(activityService.getMyActivities(pageable));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<ActivityResponse>> getAllActivities(Pageable pageable) {
        return ResponseEntity.ok(activityService.getAllActivities(pageable));
    }
}