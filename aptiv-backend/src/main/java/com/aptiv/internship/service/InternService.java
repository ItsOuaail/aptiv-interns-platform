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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

        // Extract user information from JWT
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        String keycloakId = jwt.getClaimAsString("sub");
        String fullName = jwt.getClaimAsString("name");
        String preferredUsername = jwt.getClaimAsString("preferred_username");

        // Extract roles from JWT to determine user role
        List<String> roles = extractRolesFromJwt(jwt);

        // Try to find user in database
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            // User doesn't exist in database, create them automatically
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(firstName != null ? firstName : "Unknown");
            newUser.setLastName(lastName != null ? lastName : "User");
            newUser.setKeycloakId(keycloakId);
            //newUser.setUsername(preferredUsername != null ? preferredUsername : email);

            // Set role based on JWT roles
            if (roles.contains("HR")) {
                newUser.setRole(User.Role.HR);
            } else if (roles.contains("INTERN")) {
                newUser.setRole(User.Role.INTERN);
            } else {
                // Default to INTERN if no specific role found
                newUser.setRole(User.Role.INTERN);
            }

            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            // Save and return the new user
            User savedUser = userRepository.save(newUser);
            System.out.println("Created new user: " + savedUser.getEmail() + " - " + savedUser.getFirstName() + " " + savedUser.getLastName() + " with role: " + savedUser.getRole());
            return savedUser;
        }
    }

    private List<String> extractRolesFromJwt(Jwt jwt) {
        // Extract roles from realm_access
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            return (List<String>) realmAccess.get("roles");
        }
        return List.of(); // Return empty list if no roles found
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