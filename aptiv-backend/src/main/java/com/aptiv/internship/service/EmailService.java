package com.aptiv.internship.service;

import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.Notification;
import com.aptiv.internship.entity.User;
import com.aptiv.internship.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final NotificationService notificationService;
    private final InternRepository internRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${aptiv.internship.hr-email}")
    private String hrEmail;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    @Scheduled(cron = "0 0 9 * * ?") // Daily at 9 AM
    public void checkInternshipEndDates() {
        LocalDate today = LocalDate.now();
        List<Intern> endingSoon = internRepository.findByEndDateBetween(
                today.plusDays(1),
                today.plusDays(30)
        );

        for (Intern intern : endingSoon) {
            long daysLeft = ChronoUnit.DAYS.between(today, intern.getEndDate());
            if (daysLeft == 30 || daysLeft == 7 || daysLeft == 1) {
                String subject = "Internship Ending Soon";
                String message = String.format(
                        "%s %s's internship ends in %d days (End date: %s)",
                        intern.getFirstName(),
                        intern.getLastName(),
                        daysLeft,
                        intern.getEndDate()
                );

                // Notify HR
                sendEmail(hrEmail, subject, message);

                // Save notification
                notificationService.createNotification(
                        subject,
                        message,
                        Notification.NotificationType.INTERNSHIP_ENDING,
                        intern.getUser(),
                        intern.getId()
                );
            }
        }
    }
}