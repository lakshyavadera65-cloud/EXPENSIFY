package com.expensify.backend.controller;
import com.expensify.backend.model.Notification; import com.expensify.backend.repository.NotificationRepository; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/notifications")
public class NotificationController { 
    private final NotificationRepository notifications; 
    public NotificationController(NotificationRepository n){notifications=n;} 
    
    @GetMapping("/user/{userId}") 
    public List<Notification> list(@PathVariable Long userId, HttpServletRequest req){ 
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized"); 
        return notifications.findByUserIdOrderByCreatedAtDesc(userId);
    } 

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notifications.findById(id).ifPresent(n -> {
            n.setReadStatus(true);
            notifications.save(n);
        });
    }

    @PutMapping("/user/{userId}/read-all")
    public void markAllRead(@PathVariable Long userId, HttpServletRequest req) {
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        List<Notification> list = notifications.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setReadStatus(true);
        }
        notifications.saveAll(list);
    }
}
