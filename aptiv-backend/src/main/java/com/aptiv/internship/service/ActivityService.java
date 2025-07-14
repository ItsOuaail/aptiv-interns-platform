package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.ActivityRequest;
import com.aptiv.internship.dto.response.ActivityResponse;
import com.aptiv.internship.entity.Activity;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.ActivityRepository;
import com.aptiv.internship.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final InternRepository internRepository;

    public ActivityResponse createActivity(ActivityRequest request) {
        Intern intern = getCurrentIntern();

        Activity activity = new Activity();
        activity.setActivityDate(LocalDate.now());
        activity.setDescription(request.getDescription());
        activity.setIntern(intern);

        return convertToResponse(activityRepository.save(activity));
    }

    public Page<ActivityResponse> getMyActivities(Pageable pageable) {
        Intern intern = getCurrentIntern();
        return activityRepository.findByIntern(intern, pageable)
                .map(this::convertToResponse);
    }

    public Page<ActivityResponse> getAllActivities(Pageable pageable) {
        return activityRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    private Intern getCurrentIntern() {
        return internRepository.findByEmail(getCurrentUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", getCurrentUserEmail()));
    }

    private String getCurrentUserEmail() {
        return ((Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getClaimAsString("email");
    }

    private ActivityResponse convertToResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setActivityDate(activity.getActivityDate());
        response.setDescription(activity.getDescription());
        response.setCreatedAt(activity.getCreatedAt());
        response.setInternId(activity.getIntern().getId());
        response.setInternName(activity.getIntern().getFirstName() + " " + activity.getIntern().getLastName());
        return response;
    }
}