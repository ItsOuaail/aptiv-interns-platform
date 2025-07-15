package com.aptiv.internship;

import com.aptiv.internship.entity.User;
import com.aptiv.internship.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDefaultUser(UserService userService) {
		return args -> {
			// Create a default HR user if it doesn't exist
			User hrUser = userService.createUserIfNotExists(
					"hr@example.com",
					"Admin",
					"HR",
					"HR",
					"adminpass" // Plain text password to be hashed
			);
			System.out.println("Default HR user created or already exists: " + hrUser.getEmail() + " with role: " + hrUser.getRole());
		};
	}
}