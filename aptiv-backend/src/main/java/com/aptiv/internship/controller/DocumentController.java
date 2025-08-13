package com.aptiv.internship.controller;

import com.aptiv.internship.dto.response.DocumentResponse;
import com.aptiv.internship.entity.Document;
import com.aptiv.internship.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam String type) {
        return ResponseEntity.ok(documentService.uploadDocument(file, type));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<Page<DocumentResponse>> getMyDocuments(Pageable pageable) {
        return ResponseEntity.ok(documentService.getMyDocuments(pageable));
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Page<DocumentResponse>> getAllDocuments(Pageable pageable) {
        return ResponseEntity.ok(documentService.getAllDocuments(pageable));
    }

    // NEW: Download endpoint
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('HR','INTERN')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) throws IOException {
        Document document = documentService.getDocumentEntity(id);

        // service will check authorization (HR or owner) and load resource
        Resource resource = documentService.loadDocumentAsResource(document);

        String contentType = document.getMimeType();
        if (contentType == null || contentType.isBlank()) {
            // fallback to probe
            contentType = Files.probeContentType(Paths.get(document.getFilePath()));
            if (contentType == null) contentType = "application/octet-stream";
        }

        String encodedFilename = URLEncoder.encode(document.getOriginalFileName(), StandardCharsets.UTF_8);
        String contentDisposition = "attachment; filename*=UTF-8''" + encodedFilename;

        long contentLength = Files.size(Paths.get(document.getFilePath()));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentLength(contentLength)
                .body(resource);
    }
}
