package com.expensify.backend.config;

import com.expensify.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (request.getMethod().equals("OPTIONS")) return true;
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        Long userId = jwtService.extractUserId(token);
        String userRole = jwtService.extractRole(token);
        request.setAttribute("authenticatedUserId", userId);
        request.setAttribute("authenticatedUserRole", userRole);

        if (handler instanceof org.springframework.web.method.HandlerMethod) {
            org.springframework.web.method.HandlerMethod handlerMethod = (org.springframework.web.method.HandlerMethod) handler;
            com.expensify.backend.annotation.RequireRole requireRole = handlerMethod.getMethodAnnotation(com.expensify.backend.annotation.RequireRole.class);
            if (requireRole == null) {
                requireRole = handlerMethod.getBeanType().getAnnotation(com.expensify.backend.annotation.RequireRole.class);
            }
            if (requireRole != null) {
                boolean hasRole = false;
                for (com.expensify.backend.enums.UserRole role : requireRole.value()) {
                    if (role.name().equals(userRole)) {
                        hasRole = true;
                        break;
                    }
                }
                if (!hasRole) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
            }
        }
        return true;
    }
}

