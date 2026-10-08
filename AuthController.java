package com.expensify.backend.controller;
import com.expensify.backend.dto.*; import com.expensify.backend.model.AppUser; import com.expensify.backend.service.UserService; import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserService users; public AuthController(UserService users){this.users=users;}
    @PostMapping("/register") public UserResponse register(@Valid @RequestBody RegisterUserRequest request) {
        AppUser u = users.register(request);
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }
    @PostMapping("/login") public LoginResponse login(@Valid @RequestBody UserLoginRequest request){return users.login(request);}
    @PostMapping("/refresh") public LoginResponse refresh(@Valid @RequestBody RefreshTokenRequest request){return users.refreshToken(request);}
}
