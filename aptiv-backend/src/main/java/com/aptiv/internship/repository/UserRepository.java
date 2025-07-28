package com.aptiv.internship.repository;

import com.aptiv.internship.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email); // Pour vérifier les doublons

    Page<User> findByRole(User.Role role, Pageable pageable);
}