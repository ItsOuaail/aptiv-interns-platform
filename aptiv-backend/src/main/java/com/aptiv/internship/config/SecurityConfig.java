package com.aptiv.internship.config;

import jakarta.servlet.Filter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JWTAuthenticationFilter jwtAuthenticationFilter; // Add this field

    public SecurityConfig(JWTAuthenticationFilter jwtAuthenticationFilter, UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter; // Store it
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/test/public").permitAll()
                        .requestMatchers("/test/auth").authenticated()
                        .requestMatchers(HttpMethod.GET, "/interns/**").hasRole("HR")
                        .requestMatchers(HttpMethod.POST, "/interns").hasRole("HR")
                        .requestMatchers(HttpMethod.POST, "/interns/batch").hasRole("HR")
                        .requestMatchers(HttpMethod.PUT, "/interns/**").hasRole("HR")
                        .requestMatchers(HttpMethod.DELETE, "/interns/**").hasRole("HR")
                        .requestMatchers("/messages/send").hasRole("HR")
                        .requestMatchers("/reports/**").hasRole("HR")
                        .requestMatchers(HttpMethod.GET, "/activities/my").hasRole("INTERN")
                        .requestMatchers(HttpMethod.POST, "/activities").hasRole("INTERN")
                        .requestMatchers(HttpMethod.GET, "/documents/my").hasRole("INTERN")
                        .requestMatchers(HttpMethod.POST, "/documents").hasRole("INTERN")
                        .requestMatchers("/attendance/checkin").hasRole("INTERN")
                        .requestMatchers("/attendance/checkout").hasRole("INTERN")
                        .requestMatchers("/notifications/**").authenticated()
                        .requestMatchers("/messages/my").authenticated()
                        .requestMatchers("/auth/profile").authenticated()
                        .anyRequest().authenticated()
                )
        // You can uncomment this line now that jwtAuthenticationFilter is properly stored
         .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}