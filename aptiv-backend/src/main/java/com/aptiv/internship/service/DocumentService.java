package com.aptiv.internship.service;

import com.aptiv.internship.dto.response.DocumentResponse;
import com.aptiv.internship.entity.Document;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.DocumentRepository;
import com.aptiv.internship.repository.InternRepository;
import com.aptiv.internship.util.FileUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final InternRepository internRepository;

    @Value("${aptiv.internship.file-storage-path}")
    private String fileStoragePath;

    public DocumentResponse uploadDocument(MultipartFile file, String type) {
        Intern intern = getCurrentIntern();

        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = FileUtils.getFileExtension(originalFilename);
            String uniqueFilename = System.currentTimeMillis() + fileExtension;
            Path filePath = Paths.get(fileStoragePath, uniqueFilename);

            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            Document document = new Document();
            document.setFileName(uniqueFilename);
            document.setOriginalFileName(originalFilename);
            document.setMimeType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setFilePath(filePath.toString());
            document.setType(Document.DocumentType.valueOf(type));
            document.setIntern(intern);
            document.setUploadedAt(LocalDateTime.now());

            return convertToResponse(documentRepository.save(document));
        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getMyDocuments(Pageable pageable) {
        Intern intern = getCurrentIntern();
        return documentRepository.findByIntern(intern, pageable)
                .map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    // Make this public so controller can reuse it
    @Transactional(readOnly = true)
    public Document getDocumentEntity(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
    }

    // PUBLIC: load resource and enforce authorization (HR can access any; intern only their own)
    public Resource loadDocumentAsResource(Document document) {
        // Authorization check
        if (!isCurrentUserHR()) {
            // current user must be the owner intern
            Intern current = getCurrentIntern();
            if (!document.getIntern().getId().equals(current.getId())) {
                throw new AccessDeniedException("You are not allowed to download this file.");
            }
        }

        Path basePath = Paths.get(fileStoragePath).toAbsolutePath().normalize();
        Path filePath = basePath.resolve(document.getFileName()).normalize();

        // Prevent path traversal
        if (!filePath.startsWith(basePath)) {
            throw new RuntimeException("Cannot access file outside configured storage directory");
        }

        try {
            UrlResource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                // Use InputStreamResource if you want streaming, but UrlResource is fine here
                return new InputStreamResource(resource.getInputStream());
            } else {
                throw new ResourceNotFoundException("File", "fileName", document.getFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file path", e);
        } catch (IOException e) {
            throw new RuntimeException("Failed to open file stream", e);
        }
    }

    private Intern getCurrentIntern() {
        String email = getCurrentUserEmail();
        return internRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", email));
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return String.valueOf(principal);
    }

    private boolean isCurrentUserHR() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            if ("ROLE_HR".equals(a.getAuthority())) return true;
        }
        return false;
    }

    private DocumentResponse convertToResponse(Document document) {
        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId());
        response.setFileName(document.getFileName());
        response.setOriginalFileName(document.getOriginalFileName());
        response.setMimeType(document.getMimeType());
        response.setFileSize(document.getFileSize());
        response.setType(document.getType());
        response.setComment(document.getComment());
        response.setUploadedAt(document.getUploadedAt());
        response.setInternId(document.getIntern().getId());
        response.setInternName(document.getIntern().getFirstName() + " " + document.getIntern().getLastName());
        return response;
    }
}
