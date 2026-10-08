package com.expensify.backend.config;
import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.Configuration; import org.springframework.web.servlet.config.annotation.*;
@Configuration public class CorsConfig implements WebMvcConfigurer {
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}") private String allowedOrigins;
    private final AuthInterceptor authInterceptor;
    public CorsConfig(AuthInterceptor authInterceptor) { this.authInterceptor = authInterceptor; }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**");
    }

    public void addCorsMappings(CorsRegistry registry){registry.addMapping("/api/**").allowedOrigins(allowedOrigins.split(",")).allowedMethods("GET","POST","PUT","DELETE","OPTIONS").allowedHeaders("*");}
}
