package com.aptiv.internship.controller;

import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<MessageResponse>> getMyMessages(Pageable pageable) {
        return ResponseEntity.ok(messageService.getMyMessages(pageable));
    }
}