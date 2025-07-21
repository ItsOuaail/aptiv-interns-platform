package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.InternRequest;
import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.Notification;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.InternRepository;
import com.aptiv.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InternService {
    private final InternRepository internRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;


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
                // lambda explicite pour lever l’ambiguïté
                .map(intern -> convertToResponse(intern));
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> searchInterns(
            String keyword,
            String department,
            String university,
            String major,
            String supervisor,
            Intern.InternshipStatus status,
            LocalDate startDateFrom,
            LocalDate startDateTo,
            LocalDate endDateFrom,
            LocalDate endDateTo,
            Pageable pageable) {

        Specification<Intern> spec = buildSearchSpecification(
                keyword, department, university, major, supervisor, status,
                startDateFrom, startDateTo, endDateFrom, endDateTo);

        return internRepository.findAll(spec, pageable)
                .map(intern -> convertToResponse(intern)); // Explicitly use convertToResponse(Intern)
    }

    public Page<Intern> searchByKeyword(String keyword, Pageable pageable) {
        // Directly return the paginated result from the repository
        return internRepository.findByKeyword(keyword, pageable);
    }
    @Transactional(readOnly = true)
    public Object searchInternsByKeywsord(String keyword, Pageable pageable) {
        if (!StringUtils.hasText(keyword)) {
            return getAllInterns(pageable);
        }

        Specification<Intern> spec = (root, query, cb) -> {
            String searchTerm = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), searchTerm),
                    cb.like(cb.lower(root.get("lastName")), searchTerm),
                    cb.like(cb.lower(root.get("email")), searchTerm),
                    cb.like(cb.lower(root.get("university")), searchTerm),
                    cb.like(cb.lower(root.get("major")), searchTerm),
                    cb.like(cb.lower(root.get("department")), searchTerm),
                    cb.like(cb.lower(root.get("supervisor")), searchTerm)
            );
        };

        return internRepository.findAll(spec, pageable)
                .map(intern -> convertToResponse((Intern) intern));
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsByDepartment(String department, Pageable pageable) {
        return internRepository.findByDepartmentContainingIgnoreCase(department, pageable)
                .map(intern -> convertToResponse(intern));
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsByUniversity(String university, Pageable pageable) {
        return internRepository.findByUniversityContainingIgnoreCase(university, pageable)
                .map(intern -> convertToResponse(intern));
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsByStatus(Intern.InternshipStatus status, Pageable pageable) {
        return internRepository.findByStatus(status, pageable)
                .map(intern -> convertToResponse(intern));
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsBySupervisor(String supervisor, Pageable pageable) {
        return internRepository.findBySupervisorContainingIgnoreCase(supervisor, pageable)
                .map(intern -> convertToResponse(intern));
    }

    private Specification<Intern> buildSearchSpecification(
            String keyword,
            String department,
            String university,
            String major,
            String supervisor,
            Intern.InternshipStatus status,
            LocalDate startDateFrom,
            LocalDate startDateTo,
            LocalDate endDateFrom,
            LocalDate endDateTo) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String term = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), term),
                        cb.like(cb.lower(root.get("lastName")), term),
                        cb.like(cb.lower(root.get("email")), term),
                        cb.like(cb.lower(root.get("university")), term),
                        cb.like(cb.lower(root.get("major")), term),
                        cb.like(cb.lower(root.get("department")), term),
                        cb.like(cb.lower(root.get("supervisor")), term)
                ));
            }

            if (StringUtils.hasText(department)) {
                predicates.add(cb.like(cb.lower(root.get("department")), "%" + department.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(university)) {
                predicates.add(cb.like(cb.lower(root.get("university")), "%" + university.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(major)) {
                predicates.add(cb.like(cb.lower(root.get("major")), "%" + major.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(supervisor)) {
                predicates.add(cb.like(cb.lower(root.get("supervisor")), "%" + supervisor.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (startDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), startDateFrom));
            }
            if (startDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startDate"), startDateTo));
            }
            if (endDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("endDate"), endDateFrom));
            }
            if (endDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), endDateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
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
                .peek(i -> i.setUser(hrUser))
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

    InternResponse convertToResponse(Intern intern) {
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
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            return opt.get();
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName("Unknown");
            newUser.setLastName("User");
            List<String> roles = extractRolesFromContext();
            newUser.setRole(roles.contains("HR") ? User.Role.HR : User.Role.INTERN);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        }
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails =
                (UserDetails) SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getPrincipal();
        return userDetails.getUsername();
    }

    private List<String> extractRolesFromContext() {
        UserDetails userDetails =
                (UserDetails) SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getPrincipal();
        return userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .toList();
    }

    @Transactional
    public MessageResponse sendMessageToIntern(MessageRequest request) {
        User hrUser = getCurrentUser();
        Intern intern = internRepository.findById(request.getInternId())
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", request.getInternId()));

        String subject = "[Internship Message] " + request.getSubject();
        String body = buildEmailBody(request.getContent(), hrUser, intern);

        try {
            emailService.sendEmail(intern.getEmail(), subject, body);

            Notification notification = notificationService.createNotification(
                    request.getSubject(),
                    request.getContent(),
                    Notification.NotificationType.MESSAGE_FROM_HR,
                    intern.getUser(),
                    intern
            );

            MessageResponse resp = new MessageResponse();
            resp.setId(notification.getId());
            resp.setSubject(request.getSubject());
            resp.setContent(request.getContent());
            resp.setIsRead(false);
            resp.setSentAt(LocalDateTime.now());
            resp.setInternId(intern.getId());
            resp.setInternName(intern.getFirstName() + " " + intern.getLastName());
            resp.setSenderId(hrUser.getId());
            resp.setSenderName(hrUser.getFirstName() + " " + hrUser.getLastName());
            return resp;

        } catch (Exception e) {
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }

    @Transactional
    public List<MessageResponse> sendMessageToMultipleInterns(List<Long> internIds, String subject, String content) {
        List<MessageResponse> responses = new ArrayList<>();
        for (Long id : internIds) {
            try {
                MessageRequest req = new MessageRequest();
                req.setInternId(id);
                req.setSubject(subject);
                req.setContent(content);
                responses.add(sendMessageToIntern(req));
            } catch (Exception e) {
                MessageResponse err = new MessageResponse();
                err.setInternId(id);
                err.setSubject(subject);
                err.setContent("ERROR: " + e.getMessage());
                err.setSentAt(LocalDateTime.now());
                responses.add(err);
            }
        }
        return responses;
    }

    public List<Long> getAllActiveInternIds() {
        return internRepository.findByStatus(Intern.InternshipStatus.ACTIVE)
                .stream()
                .map(Intern::getId)
                .collect(Collectors.toList());
    }

    private String buildEmailBody(String content, User hrUser, Intern intern) {
        return String.format("""
            Dear %s %s,
            
            You have received a message from %s %s (HR Department):
            
            %s
            
            ---
            
            Best regards,
            %s %s
            HR Department
            Email: %s
            
            This is an automated message from the Internship Management System.
            """,
                intern.getFirstName(),
                intern.getLastName(),
                hrUser.getFirstName(),
                hrUser.getLastName(),
                content,
                hrUser.getFirstName(),
                hrUser.getLastName(),
                hrUser.getEmail()
        );
    }
    /**
     * Get total count of all interns
     */
    @Transactional(readOnly = true)
    public long getInternCount() {
        return internRepository.count();
    }

    /**
     * Get count of active interns
     */
    @Transactional(readOnly = true)
    public long getActiveInternCount() {
        return internRepository.countByStatus(Intern.InternshipStatus.ACTIVE);
    }

    /**
     * Get count of interns with upcoming end dates (within next 30 days)
     */
    @Transactional(readOnly = true)
    public long getUpcomingEndDatesCount() {
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(7);
        return internRepository.countByEndDateBetweenAndStatus(
                today,
                thirtyDaysFromNow,
                Intern.InternshipStatus.ACTIVE
        );
    }
}
