package com.expensify.backend.service;

import com.expensify.backend.dto.*;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.repository.AppUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final AppUserRepository users;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(AppUserRepository users) { this.users = users; }

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
        user.setRole(request.getRole()); user.setCity(request.getCity()); user.setCountry(request.getCountry());
        user.setLatitude(request.getLatitude()); user.setLongitude(request.getLongitude());
        return users.save(user);
    }

    public LoginResponse login(UserLoginRequest request) {
        java.util.Optional<AppUser> foundUser = users.findByEmail(request.getEmail());
        if (foundUser.isEmpty()) throw new IllegalArgumentException("Invalid email or password");
        AppUser user = foundUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public AppUser getUser(Long id) {
        java.util.Optional<AppUser> foundUser = users.findById(id);
        if (foundUser.isEmpty()) throw new IllegalArgumentException("User not found");
        return foundUser.get();
    }
}
