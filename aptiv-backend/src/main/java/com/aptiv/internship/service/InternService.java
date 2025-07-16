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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
                .peek(intern -> intern.setUser(hrUser))
                .collect(Collectors.toList());
        internRepository.saveAll(interns);
    }

    @Transactional
    public InternResponse updateIntern(Long id, InternRequest request) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", id));

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

        Intern updatedIntern = internRepository.save(intern);
        // Fetch user data within the transaction
        User user = userRepository.findById(updatedIntern.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", updatedIntern.getUser().getId()));
        return convertToResponse(updatedIntern, user);
    }

    @Transactional
    public void deleteIntern(Long id) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", id));
        internRepository.delete(intern);
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
                .status(Intern.InternshipStatus.ACTIVE)
                .build();
    }

    private InternResponse convertToResponse(Intern intern) {
        return convertToResponse(intern, intern.getUser());
    }

    private InternResponse convertToResponse(Intern intern, User user) {
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
        response.setHrName(user.getFirstName() + " " + user.getLastName());
        response.setHrEmail(user.getEmail());
        return response;
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName("Unknown");
            newUser.setLastName("User");

            List<String> roles = extractRolesFromContext();
            if (roles.contains("HR")) {
                newUser.setRole(User.Role.HR);
            } else if (roles.contains("INTERN")) {
                newUser.setRole(User.Role.INTERN);
            } else {
                newUser.setRole(User.Role.INTERN);
            }

            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(newUser);
            System.out.println("Created new user: " + savedUser.getEmail() + " - " + savedUser.getFirstName() + " " + savedUser.getLastName() + " with role: " + savedUser.getRole());
            return savedUser;
        }
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername();
    }

    private List<String> extractRolesFromContext() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .toList();
    }
}