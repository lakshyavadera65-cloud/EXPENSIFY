package com.expensify.backend.controller;
import com.expensify.backend.model.Notification; import com.expensify.backend.repository.NotificationRepository; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/notifications")
public class NotificationController { 
    private final NotificationRepository notifications; 
    public NotificationController(NotificationRepository n){notifications=n;} 

    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authenticatedId = (Long) req.getAttribute("authenticatedUserId");
        if (authenticatedId == null || !authenticatedId.equals(resourceUserId)) throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/user/{userId}") public List<Notification> list(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        return notifications.findByUserIdOrderByCreatedAtDesc(userId);
    } 
}
