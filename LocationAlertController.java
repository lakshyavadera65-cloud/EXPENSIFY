package com.expensify.backend.controller;
import com.expensify.backend.dto.*; import com.expensify.backend.model.AppUser; import com.expensify.backend.service.*; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController @RequestMapping("/api/location-alerts")
public class LocationAlertController {
    private final UserService users; private final LocationAlertService alerts; private final PaymentAlertService payment;
    public LocationAlertController(UserService users,LocationAlertService alerts,PaymentAlertService payment){this.users=users;this.alerts=alerts;this.payment=payment;}
    
    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authenticatedId = (Long) req.getAttribute("authenticatedUserId");
        if (authenticatedId == null || !authenticatedId.equals(resourceUserId)) throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/user/{userId}") public List<LocationAlertResponse> get(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        return alerts.getAlerts(users.getUser(userId));
    }
    @PostMapping("/coordinates") public List<LocationAlertResponse> coordinates(@Valid @RequestBody LocationRequest r){AppUser temp=new AppUser();temp.setLatitude(r.getLatitude());temp.setLongitude(r.getLongitude());return alerts.getAlerts(temp);}
    @PostMapping("/payment-disruption") public String payment(@RequestParam String title,@RequestParam String message,@RequestParam(defaultValue="MEDIUM") String severity){payment.add(title,message,severity,"EXPENSIFY ADMIN");return "Payment alert added";}
    @PostMapping("/user/{userId}/email") public String email(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        alerts.emailAlerts(users.getUser(userId));return "Email request completed";
    }
}
