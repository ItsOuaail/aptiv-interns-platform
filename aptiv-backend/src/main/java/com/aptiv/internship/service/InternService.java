package com.aptiv.internship.service;

import java.security.SecureRandom;
import com.aptiv.internship.repository.MessageRepository;
import com.aptiv.internship.entity.Message;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import com.aptiv.internship.dto.request.InternRequest;
import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.InternResponse;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.Notification;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.exception.DuplicateInternException;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.InternRepository;
import com.aptiv.internship.repository.UserRepository;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InternService {
    private final InternRepository internRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final MessageRepository messageRepository;

    @Transactional
    public InternResponse createIntern(InternRequest request) {
        // Check if intern already exists
        if (internRepository.existsByEmail(request.getEmail())) {
            log.warn("Attempt to create intern with existing email: {}", request.getEmail());
            throw new DuplicateInternException("Intern with email " + request.getEmail() + " already exists");
        }

        // Get the current HR user
        User hrUser = getCurrentUser();
        Intern intern = mapToEntity(request);
        intern.setUser(hrUser);

        // Create User entity for the intern
        User internUser = new User();
        internUser.setEmail(request.getEmail());
        internUser.setFirstName(request.getFirstName());
        internUser.setLastName(request.getLastName());
        internUser.setRole(User.Role.INTERN);
        internUser.setCreatedAt(LocalDateTime.now());
        internUser.setUpdatedAt(LocalDateTime.now());

        // Generate and set a random password
        String randomPassword = generateRandomPassword();
        internUser.setPassword(passwordEncoder.encode(randomPassword)); // Set the plain-text password
        // In production, hash it using passwordEncoder.encode(randomPassword)

        try {
            // Save the user entity
            userRepository.save(internUser);
            Intern savedIntern = internRepository.save(intern);

            // Send welcome email with the random password
            String subject = "Welcome to Your Internship at Aptiv!";
            String body = buildWelcomeEmailBody(request, hrUser, randomPassword);
            emailService.sendEmail(intern.getEmail(), subject, body);

            // Create a notification
            Notification notification = notificationService.createNotification(
                    subject,
                    "Welcome to your internship! Please review your details and contact HR if needed.",
                    Notification.NotificationType.WELCOME_MESSAGE,
                    internUser,
                    savedIntern
            );

            return convertToResponse(savedIntern);
        } catch (Exception e) {
            log.error("Failed to save intern with email {} or send welcome email: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create intern: " + e.getMessage(), e);
        }
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        int length = 12; // Adjustable length
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

    @Transactional
    public void createInternsBatch(List<InternRequest> requests, User hrUser) {
        // Check for duplicates within the batch
        Set<String> emailsInBatch = new HashSet<>();
        List<String> duplicateEmails = new ArrayList<>();
        for (InternRequest request : requests) {
            if (!emailsInBatch.add(request.getEmail())) {
                duplicateEmails.add(request.getEmail());
            }
        }
        if (!duplicateEmails.isEmpty()) {
            log.warn("Duplicate emails found in batch: {}", duplicateEmails);
            throw new IllegalArgumentException("Duplicate emails in batch: " + String.join(", ", duplicateEmails));
        }

        // Check for existing emails in the database
        List<String> existingEmails = internRepository.findByEmailIn(new ArrayList<>(emailsInBatch))
                .stream()
                .map(Intern::getEmail)
                .collect(Collectors.toList());
        if (!existingEmails.isEmpty()) {
            log.warn("Existing emails found in database: {}", existingEmails);
            throw new IllegalArgumentException("Interns with these emails already exist (Delete them and upload the file again): " + String.join(", ", existingEmails));
        }

        // Prepare lists
        List<Intern> interns = new ArrayList<>();
        List<User> users = new ArrayList<>();
        List<String> passwords = new ArrayList<>();

        for (InternRequest request : requests) {
            String randomPassword = generateRandomPassword();
            passwords.add(randomPassword);

            User internUser = new User();
            internUser.setEmail(request.getEmail());
            internUser.setFirstName(request.getFirstName());
            internUser.setLastName(request.getLastName());
            internUser.setRole(User.Role.INTERN);
            internUser.setPassword(randomPassword); // Set plain password
            internUser.setCreatedAt(LocalDateTime.now());
            internUser.setUpdatedAt(LocalDateTime.now());
            users.add(internUser);

            Intern intern = mapToEntity(request);
            intern.setUser(hrUser); // Set the HR user
            interns.add(intern);
        }

        try {
            userRepository.saveAll(users);
            internRepository.saveAll(interns);

            // Send welcome emails to all interns
            for (int i = 0; i < interns.size(); i++) {
                Intern intern = interns.get(i);
                InternRequest request = requests.get(i);
                String subject = "Welcome to Your Internship at Aptiv!";
                String body = buildWelcomeEmailBody(request, hrUser, passwords.get(i));
                emailService.sendEmail(intern.getEmail(), subject, body);

                // Create notification
                notificationService.createNotification(
                        subject,
                        "Welcome to your internship! Please review your details and contact HR if needed.",
                        Notification.NotificationType.WELCOME_MESSAGE,
                        users.get(i),
                        intern
                );
            }
        } catch (Exception e) {
            log.error("Failed to save batch of interns or send welcome emails: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create intern batch: " + e.getMessage(), e);
        }
    }

    public InternResponse getInternById(Long id) {
        return convertToResponse(internRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Intern with id {} not found", id);
                    return new ResourceNotFoundException("Intern", "id", id);
                }));
    }

    public Page<InternResponse> getAllInterns(Pageable pageable) {
        try {
            return internRepository.findAll(pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to retrieve all interns: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve interns: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> searchInterns(
            String keyword, String department, String university, String major, String supervisor,
            Intern.InternshipStatus status, LocalDate startDateFrom, LocalDate startDateTo,
            LocalDate endDateFrom, LocalDate endDateTo, Pageable pageable) {
        try {
            Specification<Intern> spec = buildSearchSpecification(keyword, department, university, major, supervisor,
                    status, startDateFrom, startDateTo, endDateFrom, endDateTo);
            return internRepository.findAll(spec, pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to search interns: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search interns: " + e.getMessage(), e);
        }
    }

    public Page<Intern> searchByKeyword(String keyword, Pageable pageable) {
        try {
            return internRepository.findByKeyword(keyword, pageable);
        } catch (Exception e) {
            log.error("Failed to search interns by keyword '{}': {}", keyword, e.getMessage(), e);
            throw new RuntimeException("Failed to search interns by keyword: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Object searchInternsByKeywsord(String keyword, Pageable pageable) {
        try {
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
            return internRepository.findAll(spec, pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to search interns by keyword '{}': {}", keyword, e.getMessage(), e);
            throw new RuntimeException("Failed to search interns by keyword: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsByDepartment(String department, Pageable pageable) {
        try {
            return internRepository.findByDepartmentContainingIgnoreCase(department, pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to retrieve interns by department '{}': {}", department, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve interns by department: " + e.getMessage(), e);
        }
    }

    public List<Intern> findInternsByCriteria(String keyword, EntityManager entityManager) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Intern> cq = cb.createQuery(Intern.class);
        Root<Intern> root = cq.from(Intern.class);

        List<Predicate> predicates = new ArrayList<>();
        if (keyword != null && !keyword.isEmpty()) {
            predicates.add(cb.like(root.get("name"), "%" + keyword + "%"));
        }

        cq.select(root).where(cb.and(predicates.toArray(new Predicate[0])));
        return entityManager.createQuery(cq).getResultList();
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsByUniversity(String university, Pageable pageable) {
        try {
            return internRepository.findByUniversityContainingIgnoreCase(university, pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to retrieve interns by university '{}': {}", university, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve interns by university: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsByStatus(Intern.InternshipStatus status, Pageable pageable) {
        try {
            return internRepository.findByStatus(status, pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to retrieve interns by status '{}': {}", status, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve interns by status: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<InternResponse> getInternsBySupervisor(String supervisor, Pageable pageable) {
        try {
            return internRepository.findBySupervisorContainingIgnoreCase(supervisor, pageable).map(this::convertToResponse);
        } catch (Exception e) {
            log.error("Failed to retrieve interns by supervisor '{}': {}", supervisor, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve interns by supervisor: " + e.getMessage(), e);
        }
    }

    public InternResponse getCurrentInternProfile() {
        User user = getCurrentUser();
        return convertToResponse(internRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> {
                    log.warn("Intern with email {} not found", user.getEmail());
                    return new ResourceNotFoundException("Intern", "email", user.getEmail());
                }));
    }

    @Transactional
    public InternResponse updateIntern(Long id, InternRequest request) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Intern with id {} not found for update", id);
                    return new ResourceNotFoundException("Intern", "id", id);
                });

        // Only update non-null fields
        if (request.getFirstName() != null) {
            intern.setFirstName(request.getFirstName());
        }
        if (request.getStatus() != null) {
            intern.setStatus(request.getStatus());
        }
        if (request.getLastName() != null) {
            intern.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            intern.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            intern.setPhone(request.getPhone());
        }
        if (request.getUniversity() != null) {
            intern.setUniversity(request.getUniversity());
        }
        if (request.getMajor() != null) {
            intern.setMajor(request.getMajor());
        }
        if (request.getStartDate() != null) {
            intern.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            intern.setEndDate(request.getEndDate());
        }
        if (request.getSupervisor() != null) {
            intern.setSupervisor(request.getSupervisor());
        }
        if (request.getDepartment() != null) {
            intern.setDepartment(request.getDepartment());
        }

        try {
            Intern updatedIntern = internRepository.save(intern);
            return convertToResponse(updatedIntern);
        } catch (Exception e) {
            log.error("Failed to update intern with id {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update intern: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteIntern(Long id) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Intern with id {} not found for deletion", id);
                    return new ResourceNotFoundException("Intern", "id", id);
                });
        try {
            internRepository.delete(intern);
        } catch (Exception e) {
            log.error("Failed to delete intern with id {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete intern: " + e.getMessage(), e);
        }
    }

    @Transactional
    public MessageResponse sendMessageToIntern(MessageRequest request) {
        User hrUser = getCurrentUser();
        Intern intern = internRepository.findById(request.getInternId())
                .orElseThrow(() -> {
                    log.warn("Intern with id {} not found for messaging", request.getInternId());
                    return new ResourceNotFoundException("Intern", "id", request.getInternId());
                });

        String subject = "[Internship Message] " + request.getSubject();
        String body = buildEmailBody(request.getContent(), hrUser, intern);

        try {
            // 1. Send email
            emailService.sendEmail(intern.getEmail(), subject, body);

            // 2. Create notification
            Notification notification = notificationService.createNotification(
                    request.getSubject(),
                    request.getContent(),
                    Notification.NotificationType.MESSAGE_FROM_HR,
                    intern.getUser(),
                    intern
            );

            // 3. Save message to messages table
            Message message = Message.builder()
                    .subject(request.getSubject())
                    .content(request.getContent())
                    .intern(intern)
                    .sender(hrUser)
                    .isRead(false)
                    .sentAt(LocalDateTime.now())
                    .build();

            Message savedMessage = messageRepository.save(message);

            // 4. Build response
            MessageResponse resp = new MessageResponse();
            resp.setId(savedMessage.getId()); // Use message ID instead of notification ID
            resp.setSubject(request.getSubject());
            resp.setContent(request.getContent());
            resp.setIsRead(false);
            resp.setSentAt(savedMessage.getSentAt());
            resp.setInternId(intern.getId());
            resp.setInternName(intern.getFirstName() + " " + intern.getLastName());
            resp.setSenderId(hrUser.getId());
            resp.setSenderName(hrUser.getFirstName() + " " + hrUser.getLastName());

            log.info("Message sent successfully to intern {} by user {}", intern.getId(), hrUser.getId());
            return resp;

        } catch (Exception e) {
            log.error("Failed to send message to intern {}: {}", intern.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send message to intern: " + e.getMessage(), e);
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
                log.error("Failed to send message to intern {}: {}", id, e.getMessage(), e);
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
        try {
            return internRepository.findByStatus(Intern.InternshipStatus.ACTIVE)
                    .stream()
                    .map(Intern::getId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to retrieve active intern IDs: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve active intern IDs: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long getInternCount() {
        try {
            return internRepository.count();
        } catch (Exception e) {
            log.error("Failed to get intern count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get intern count: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long getActiveInternCount() {
        try {
            return internRepository.countByStatus(Intern.InternshipStatus.ACTIVE);
        } catch (Exception e) {
            log.error("Failed to get active intern count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get active intern count: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long getUpcomingEndDatesCount() {
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(7);
        try {
            return internRepository.countByEndDateBetweenAndStatus(today, thirtyDaysFromNow, Intern.InternshipStatus.ACTIVE);
        } catch (Exception e) {
            log.error("Failed to get upcoming end dates count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get upcoming end dates count: " + e.getMessage(), e);
        }
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

    private String buildWelcomeEmailBody(InternRequest request, User hrUser, String randomPassword) {
        return String.format("""
            Dear %s %s,
            
            Congratulations on joining Aptiv as an intern! We are excited to have you on board.
            
            **Your Internship Details:**
            - **Department:** %s
            - **Supervisor:** %s
            - **Start Date:** %s
            - **End Date:** %s
            - **University:** %s
            - **Major:** %s
            
            **Your Login Credentials:**
            - **Email:** %s
            - **Password:** %s
            
            Please review your details and contact HR if there are any discrepancies.
            
            If you have any questions, feel free to reach out to %s %s at %s.
            
            ---
            
            Best regards,
            %s %s
            HR Department
            Email: %s
            
            This is an automated message from the Internship Management System.
            """,
                request.getFirstName(), request.getLastName(),
                request.getDepartment(), request.getSupervisor(),
                request.getStartDate(), request.getEndDate(),
                request.getUniversity(), request.getMajor(),
                request.getEmail(), randomPassword,
                hrUser.getFirstName(), hrUser.getLastName(), hrUser.getEmail(),
                hrUser.getFirstName(), hrUser.getLastName(), hrUser.getEmail()
        );
    }

    InternResponse convertToResponse(Intern intern) {
        User user = intern.getUser();
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
        try {
            return userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setFirstName("Unknown");
                        newUser.setLastName("User");
                        List<String> roles = extractRolesFromContext();
                        newUser.setRole(roles.contains("HR") ? User.Role.HR : User.Role.INTERN);
                        newUser.setCreatedAt(LocalDateTime.now());
                        newUser.setUpdatedAt(LocalDateTime.now());
                        return userRepository.save(newUser);
                    });
        } catch (Exception e) {
            log.error("Failed to get or create current user with email {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve or create current user: " + e.getMessage(), e);
        }
    }

    private String getCurrentUserEmail() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return userDetails.getUsername();
        } catch (Exception e) {
            log.error("Failed to get current user email from security context: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get current user email: " + e.getMessage(), e);
        }
    }

    private List<String> extractRolesFromContext() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return userDetails.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to extract roles from security context: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract user roles: " + e.getMessage(), e);
        }
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
                intern.getFirstName(), intern.getLastName(),
                hrUser.getFirstName(), hrUser.getLastName(),
                content,
                hrUser.getFirstName(), hrUser.getLastName(),
                hrUser.getEmail()
        );
    }

    private Specification<Intern> buildSearchSpecification(
            String keyword, String department, String university, String major, String supervisor,
            Intern.InternshipStatus status, LocalDate startDateFrom, LocalDate startDateTo,
            LocalDate endDateFrom, LocalDate endDateTo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String term = "%" + keyword.toLowerCase() + "%";
                predicates.add((Predicate) cb.or(
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
                predicates.add((Predicate) cb.like(cb.lower(root.get("department")), "%" + department.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(university)) {
                predicates.add((Predicate) cb.like(cb.lower(root.get("university")), "%" + university.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(major)) {
                predicates.add((Predicate) cb.like(cb.lower(root.get("major")), "%" + major.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(supervisor)) {
                predicates.add((Predicate) cb.like(cb.lower(root.get("supervisor")), "%" + supervisor.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add((Predicate) cb.equal(root.get("status"), status));
            }
            if (startDateFrom != null) {
                predicates.add((Predicate) cb.greaterThanOrEqualTo(root.get("startDate"), startDateFrom));
            }
            if (startDateTo != null) {
                predicates.add((Predicate) cb.lessThanOrEqualTo(root.get("startDate"), startDateTo));
            }
            if (endDateFrom != null) {
                predicates.add((Predicate) cb.greaterThanOrEqualTo(root.get("endDate"), endDateFrom));
            }
            if (endDateTo != null) {
                predicates.add((Predicate) cb.lessThanOrEqualTo(root.get("endDate"), endDateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0])); };
    }
}