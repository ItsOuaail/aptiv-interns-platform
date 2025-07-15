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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public void createInternsBatch(List<InternRequest> requests, User hrUser) {
        List<Intern> interns = requests.stream()
                .map(this::mapToEntity)
                .peek(intern -> intern.setUser(hrUser)) // Associate with HR user
                .collect(Collectors.toList());
        internRepository.saveAll(interns); // Batch save
    }

    private Intern mapToEntity(InternRequest request) {
        return Intern.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .university(request.getUniversity())
                .major(request.getMajor())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .supervisor(request.getSupervisor())
                .department(request.getDepartment())
                .status(Intern.InternshipStatus.ACTIVE) // Default status
                .build();
    }

    private InternResponse mapToResponse(Intern intern) {
        // Placeholder for response mapping based on your InternResponse DTO
        return InternResponse.builder()
                .id(intern.getId())
                .firstName(intern.getFirstName())
                .lastName(intern.getLastName())
                .email(intern.getEmail())
                // Add other fields as needed
                .build();
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();

        // Try to find user in database
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            // User doesn't exist in database, create them automatically
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName("Unknown"); // Default if not in JWT
            newUser.setLastName("User");     // Default if not in JWT
            //newUser.setKeycloakId(null);     // Remove if not needed
            //newUser.setUsername(email);      // Remove if username is email

            // Set role based on a simplified approach (adjust based on your JWT)
            List<String> roles = extractRolesFromContext(); // Custom role extraction
            if (roles.contains("HR")) {
                newUser.setRole(User.Role.HR);
            } else if (roles.contains("INTERN")) {
                newUser.setRole(User.Role.INTERN);
            } else {
                newUser.setRole(User.Role.INTERN); // Default role
            }

            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            // Save and return the new user
            User savedUser = userRepository.save(newUser);
            System.out.println("Created new user: " + savedUser.getEmail() + " - " + savedUser.getFirstName() + " " + savedUser.getLastName() + " with role: " + savedUser.getRole());
            return savedUser;
        }
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername(); // Assuming email is the username
    }

    private List<String> extractRolesFromContext() {
        // This is a placeholder; adjust based on how roles are stored in your custom JWT
        // Example: If roles are in a custom claim, access them via JwtUtil or Authentication
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // If roles are part of UserDetails authorities, convert them
        return userDetails.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5)) // Remove "ROLE_" prefix
                .toList();
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