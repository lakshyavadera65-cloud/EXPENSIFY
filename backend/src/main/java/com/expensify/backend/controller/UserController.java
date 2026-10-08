package com.expensify.backend.controller;

import com.expensify.backend.model.AppUser;
import com.expensify.backend.repository.AppUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository users;

    public UserController(AppUserRepository users) {
        this.users = users;
    }

    @GetMapping("/{id}")
    public AppUser getUser(@PathVariable Long id, HttpServletRequest req) {
        if (!id.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @PutMapping("/{id}")
    public AppUser updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> body, HttpServletRequest req) {
        if (!id.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        AppUser user = users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (body.containsKey("name") && body.get("name") != null) user.setName(body.get("name").toString());
        if (body.containsKey("city") && body.get("city") != null) user.setCity(body.get("city").toString());
        if (body.containsKey("country") && body.get("country") != null) user.setCountry(body.get("country").toString());
        return users.save(user);
    }
}
