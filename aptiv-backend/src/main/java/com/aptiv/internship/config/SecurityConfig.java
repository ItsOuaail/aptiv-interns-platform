package com.aptiv.internship.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // HR endpoints
                        .requestMatchers(HttpMethod.GET, "/interns/**").hasRole("HR")
                        .requestMatchers(HttpMethod.POST, "/interns").hasRole("HR")
                        .requestMatchers(HttpMethod.PUT, "/interns/**").hasRole("HR")
                        .requestMatchers(HttpMethod.DELETE, "/interns/**").hasRole("HR")
                        .requestMatchers("/messages/send").hasRole("HR")
                        .requestMatchers("/reports/**").hasRole("HR")

                        // Intern endpoints
                        .requestMatchers(HttpMethod.GET, "/activities/my").hasRole("INTERN")
                        .requestMatchers(HttpMethod.POST, "/activities").hasRole("INTERN")
                        .requestMatchers(HttpMethod.GET, "/documents/my").hasRole("INTERN")
                        .requestMatchers(HttpMethod.POST, "/documents").hasRole("INTERN")
                        .requestMatchers("/attendance/checkin").hasRole("INTERN")
                        .requestMatchers("/attendance/checkout").hasRole("INTERN")

                        // Common endpoints
                        .requestMatchers("/notifications/**").authenticated()
                        .requestMatchers("/messages/my").authenticated()
                        .requestMatchers("/profile").authenticated()

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
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