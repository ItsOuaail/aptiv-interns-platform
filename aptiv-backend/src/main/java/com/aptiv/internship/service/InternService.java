package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.InternRequest;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.InternRepository;
import com.aptiv.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InternService {
    private final InternRepository internRepository;
    private final UserRepository userRepository;

    public InternResponse createIntern(InternRequest request) {
        User hrUser = getCurrentUser();

        Intern intern = new Intern();
        intern.setFirstName(request.getFirstName());
        intern.setLastName(request.getLastName());
        intern.setEmail(request.getEmail());
        intern.setPhone(request.getPhone());
        intern.setUniversity(request.getUniversity());
        intern.setMajor(request.getMajor());
        intern.setStartDate(request.getStartDate());
        intern.setEndDate(request.getEndDate());
        intern.setSupervisor(request.getSupervisor());
        intern.setDepartment(request.getDepartment());
        intern.setUser(hrUser);

        return convertToResponse(internRepository.save(intern));
    }

    public InternResponse getInternById(Long id) {
        return convertToResponse(internRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", id)));
    }

    public Page<InternResponse> getAllInterns(Pageable pageable) {
        return internRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    public InternResponse getCurrentInternProfile() {
        User user = getCurrentUser();
        return convertToResponse(internRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", user.getEmail())));
    }

    private User getCurrentUser() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = jwt.getClaimAsString("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private InternResponse convertToResponse(Intern intern) {
        InternResponse response = new InternResponse();
        response.setId(intern.getId());
        response.setFirstName(intern.getFirstName());
        response.setLastName(intern.getLastName());
        response.setEmail(intern.getEmail());
        response.setPhone(intern.getPhone());
        response.setUniversity(intern.getUniversity());
        response.setMajor(intern.getMajor());
        response.setStartDate(intern.getStartDate());
        response.setEndDate(intern.getEndDate());
        response.setSupervisor(intern.getSupervisor());
        response.setDepartment(intern.getDepartment());
        response.setStatus(intern.getStatus());
        response.setCreatedAt(intern.getCreatedAt());
        response.setUpdatedAt(intern.getUpdatedAt());
        response.setHrName(intern.getUser().getFirstName() + " " + intern.getUser().getLastName());
        response.setHrEmail(intern.getUser().getEmail());
        return response;
    }
}