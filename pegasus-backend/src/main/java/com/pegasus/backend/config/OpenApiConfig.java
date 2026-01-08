package com.pegasus.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración de OpenAPI / Swagger UI
 * Accesible en: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
                .info(new Info()
                        .title("Pegasus E-commerce API")
                        .version("1.0.0")
                        .description("""
                                API REST para el sistema de e-commerce Pegasus.
                                
                                ## Autenticación
                                La mayoría de endpoints requieren autenticación JWT.
                                
                                1. Obtén un token en `/api/auth/admin/login` o `/api/auth/customer/login`
                                2. Haz clic en "Authorize" y pega el token (sin "Bearer ")
                                
                                ## Módulos
                                - **Auth**: Autenticación de usuarios y clientes
                                - **Catalog**: Productos, categorías, marcas, variantes
                                - **Inventory**: Almacenes, stock, movimientos
                                - **Orders**: Gestión de pedidos
                                - **Customers**: Gestión de clientes
                                - **Security**: Usuarios, roles y permisos (RBAC)
                                """)
                        .contact(new Contact()
                                .name("Pegasus Team")
                                .email("support@pegasus.com")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Servidor de desarrollo")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Ingresa el token JWT (sin el prefijo 'Bearer ')")));
    }
}
