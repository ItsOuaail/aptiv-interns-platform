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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

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

    public Page<DocumentResponse> getMyDocuments(Pageable pageable) {
        Intern intern = getCurrentIntern();
        return documentRepository.findByIntern(intern, pageable)
                .map(this::convertToResponse);
    }

    public Page<DocumentResponse> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable)
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