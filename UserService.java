package com.expensify.backend.service;

import com.expensify.backend.dto.*;
import com.expensify.backend.enums.UserRole;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.repository.AppUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final AppUserRepository users;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(AppUserRepository users, JwtService jwtService, LoginAttemptService loginAttemptService) { 
        this.users = users; this.jwtService = jwtService; this.loginAttemptService = loginAttemptService; 
    }

    public AppUser register(RegisterUserRequest request) {
        if (users.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            throw new IllegalArgumentException("Password must have at least 4 characters");
        }
        AppUser user = new AppUser();
        user.setName(request.getName()); user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CUSTOMER); user.setCity(request.getCity()); user.setCountry(request.getCountry());
        user.setLatitude(request.getLatitude()); user.setLongitude(request.getLongitude());
        return users.save(user);
    }

    public LoginResponse login(UserLoginRequest request) {
        String email = request.getEmail();
        if (loginAttemptService.isBlocked(email)) {
            throw new RuntimeException("Account is temporarily locked due to too many failed login attempts");
        }
        java.util.Optional<AppUser> foundUser = users.findByEmail(email);
        if (foundUser.isEmpty()) {
            loginAttemptService.loginFailed(email);
            throw new IllegalArgumentException("Invalid email or password");
        }
        AppUser user = foundUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            loginAttemptService.loginFailed(email);
            throw new IllegalArgumentException("Invalid email or password");
        }
        loginAttemptService.loginSucceeded(email);
        String token = jwtService.generateToken(user.getId(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token, refreshToken);
    }

    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        Long userId = jwtService.extractUserId(refreshToken);
        AppUser user = getUser(userId);
        String newToken = jwtService.generateToken(user.getId(), user.getRole().name());
        String newRefreshToken = jwtService.generateRefreshToken(user.getId());
        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), newToken, newRefreshToken);
    }

    public AppUser getUser(Long id) {
        java.util.Optional<AppUser> foundUser = users.findById(id);
        if (foundUser.isEmpty()) throw new IllegalArgumentException("User not found");
        return foundUser.get();
    }
}
