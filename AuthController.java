package com.expensify.backend.controller;
import com.expensify.backend.dto.*; import com.expensify.backend.model.AppUser; import com.expensify.backend.service.UserService; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserService users; public AuthController(UserService users){this.users=users;}
    @PostMapping("/register") public AppUser register(@RequestBody RegisterUserRequest request){return users.register(request);}
    @PostMapping("/login") public LoginResponse login(@RequestBody UserLoginRequest request){return users.login(request);}
}
