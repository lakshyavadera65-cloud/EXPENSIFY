package com.expensify.backend.controller;
import com.expensify.backend.dto.*; import com.expensify.backend.model.AppUser; import com.expensify.backend.service.*; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController @RequestMapping("/api/location-alerts")
public class LocationAlertController {
    private final UserService users; private final LocationAlertService alerts; private final PaymentAlertService payment;
    public LocationAlertController(UserService users,LocationAlertService alerts,PaymentAlertService payment){this.users=users;this.alerts=alerts;this.payment=payment;}
    @GetMapping("/user/{userId}") public List<LocationAlertResponse> get(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return alerts.getAlerts(users.getUser(userId));
    }
    @PostMapping("/coordinates") public List<LocationAlertResponse> coordinates(@Valid @RequestBody LocationRequest r, HttpServletRequest req){
        Long userId = (Long) req.getAttribute("userId");
        AppUser temp=new AppUser();temp.setLatitude(r.getLatitude());temp.setLongitude(r.getLongitude());return alerts.getAlerts(temp);
    }
    @PostMapping("/payment-disruption") public String payment(@RequestParam String title,@RequestParam String message,@RequestParam(defaultValue="MEDIUM") String severity, HttpServletRequest req){
        if (!"ADMIN".equals(req.getAttribute("userRole")) && !"MANAGER".equals(req.getAttribute("userRole"))) throw new SecurityException("Unauthorized");
        payment.add(title,message,severity,"EXPENSIFY ADMIN");return "Payment alert added";
    }
    @PostMapping("/user/{userId}/email") public String email(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        alerts.emailAlerts(users.getUser(userId));return "Email request completed";
    }
}
