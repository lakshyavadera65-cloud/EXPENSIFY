package com.expensify.backend.config;

import com.expensify.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (request.getMethod().equals("OPTIONS")) return true;
        
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/") || path.equals("/api/health") || path.startsWith("/api/weather")) return true;
        
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        
        try {
            String token = header.substring(7);
            Claims claims = JwtUtil.validateToken(token);
            request.setAttribute("userId", Long.parseLong(claims.getSubject()));
            request.setAttribute("userRole", claims.get("role", String.class));
            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
    }
}

