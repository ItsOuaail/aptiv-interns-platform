package com.aptiv.internship.dto.response;

import com.aptiv.internship.entity.Document;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentResponse {

    private Long id;
    private String fileName;
    private String originalFileName;
    private String mimeType;
    private Long fileSize;
    private Document.DocumentType type;
    private String comment;
    private LocalDateTime uploadedAt;
    private Long internId;
    private String internName;
}