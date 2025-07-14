package com.aptiv.internship.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.Components;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${spring.keycloak.auth-server-url:http://localhost:8180}")
    private String keycloakServerUrl;

    @Value("${spring.keycloak.realm:aptiv}")
    private String realm;

    @Value("${spring.keycloak.resource:internship-management}")
    private String clientId;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Aptiv M6 Tanger - Internship Management API")
                        .version("1.0")
                        .description("API for managing internships at Aptiv M6 Tanger")
                        .contact(new Contact()
                                .name("Aptiv M6 Tanger")
                                .email("hr@aptiv.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .addSecurityItem(new SecurityRequirement().addList("oauth2"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT"))
                        .addSecuritySchemes("oauth2",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.OAUTH2)
                                        .flows(new OAuthFlows()
                                                .authorizationCode(new OAuthFlow()
                                                        .authorizationUrl(keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/auth")
                                                        .tokenUrl(keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token")
                                                        .scopes(new Scopes()
                                                                .addString("openid", "OpenID Connect")
                                                                .addString("profile", "Profile information")
                                                                .addString("email", "Email address"))))));
    }
}