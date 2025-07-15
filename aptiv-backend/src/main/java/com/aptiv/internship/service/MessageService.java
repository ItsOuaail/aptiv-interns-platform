package com.aptiv.internship.service;

import com.aptiv.internship.dto.request.MessageRequest;
import com.aptiv.internship.dto.response.MessageResponse;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.Message;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.exception.ResourceNotFoundException;
import com.aptiv.internship.repository.InternRepository;
import com.aptiv.internship.repository.MessageRepository;
import com.aptiv.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final InternRepository internRepository;
    private final UserRepository userRepository;

    public MessageResponse sendMessage(MessageRequest request) {
        User sender = getCurrentUser();
        Intern intern = internRepository.findById(request.getInternId())
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", request.getInternId()));

        Message message = new Message();
        message.setSubject(request.getSubject());
        message.setContent(request.getContent());
        message.setIntern(intern);
        message.setSender(sender);
        message.setSentAt(LocalDateTime.now());

        return convertToResponse(messageRepository.save(message));
    }

    public Page<MessageResponse> getMyMessages(Pageable pageable) {
        User user = getCurrentUser();
        if (user.getRole() == User.Role.INTERN) {
            Intern intern = internRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Intern", "email", user.getEmail()));
            return messageRepository.findByIntern(intern, pageable)
                    .map(this::convertToResponse);
        } else {
            return null;
        }
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private String getCurrentUserEmail() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername(); // Assuming email is the username
    }

    private MessageResponse convertToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSubject(message.getSubject());
        response.setContent(message.getContent());
        response.setIsRead(message.getIsRead());
        response.setSentAt(message.getSentAt());
        response.setInternId(message.getIntern().getId());
        response.setInternName(message.getIntern().getFirstName() + " " + message.getIntern().getLastName());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        return response;
    }
}