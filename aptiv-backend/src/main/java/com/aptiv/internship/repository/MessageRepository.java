package com.aptiv.internship.repository;

import com.aptiv.internship.entity.Message;
import com.aptiv.internship.entity.Intern;
import com.aptiv.internship.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByIntern(Intern intern);

    Page<Message> findByIntern(Intern intern, Pageable pageable);

    List<Message> findBySender(User sender);

    @Query("SELECT m FROM Message m WHERE m.intern = :intern ORDER BY m.sentAt DESC")
    Page<Message> findByInternOrderBySentAtDesc(@Param("intern") Intern intern, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.sender = :sender ORDER BY m.sentAt DESC")
    Page<Message> findBySenderOrderBySentAtDesc(@Param("sender") User sender, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.intern = :intern AND m.isRead = false")
    long countUnreadByIntern(@Param("intern") Intern intern);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.sender = :sender")
    long countBySender(@Param("sender") User sender);

    List<Message> findByInternAndIsRead(Intern intern, boolean isRead);

    @Query("SELECT m FROM Message m WHERE m.intern.user.id = :userId ORDER BY m.sentAt DESC")
    Page<Message> findByInternUserIdOrderBySentAtDesc(@Param("userId") Long userId, Pageable pageable);

    Page<Message> findByInternIdOrderBySentAtDesc(Long id, Pageable pageable);

    // Find all messages for HR (both sent and received)
    @Query("SELECT m FROM Message m " +
            "JOIN FETCH m.intern i " +
            "JOIN FETCH m.sender s " +
            "LEFT JOIN FETCH m.recipient r " +
            "WHERE (m.sender.id = :hrUserId AND m.messageType = 'HR_TO_INTERN') " +
            "OR (m.recipient.id = :hrUserId AND m.messageType = 'INTERN_TO_HR') " +
            "ORDER BY m.sentAt DESC")
    Page<Message> findAllMessagesForHR(@Param("hrUserId") Long hrUserId, Pageable pageable);

    // Find conversation between intern and HR
    @Query("SELECT m FROM Message m " +
            "JOIN FETCH m.intern i " +
            "JOIN FETCH m.sender s " +
            "LEFT JOIN FETCH m.recipient r " +
            "WHERE m.intern.id = :internId " +
            "AND ((m.sender.id = :hrUserId AND m.messageType = 'HR_TO_INTERN') " +
            "OR (m.recipient.id = :hrUserId AND m.messageType = 'INTERN_TO_HR')) " +
            "ORDER BY m.sentAt DESC")
    Page<Message> findConversationBetweenInternAndHR(@Param("internId") Long internId,
                                                     @Param("hrUserId") Long hrUserId,
                                                     Pageable pageable);

    long countByRecipientIdAndIsReadFalseAndMessageType(Long recipientId, Message.MessageType messageType);

    long countByInternIdAndIsReadFalseAndMessageType(Long id, Message.MessageType messageType);
}