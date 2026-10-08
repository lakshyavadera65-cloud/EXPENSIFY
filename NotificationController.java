package com.expensify.backend.controller;
import com.expensify.backend.model.Notification; import com.expensify.backend.repository.NotificationRepository; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/notifications")
public class NotificationController { private final NotificationRepository notifications; public NotificationController(NotificationRepository n){notifications=n;} @GetMapping("/user/{userId}") public List<Notification> list(@PathVariable Long userId){return notifications.findByUserIdOrderByCreatedAtDesc(userId);} }
