package com.expensify.backend.controller;
import com.expensify.backend.service.DashboardService; import org.springframework.web.bind.annotation.*; import java.math.BigDecimal; import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboard; public DashboardController(DashboardService dashboard){this.dashboard=dashboard;}
    @GetMapping("/{userId}/daily") public Map<String,Object> daily(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return dashboard.daily(userId);
    }
    @GetMapping("/{userId}/monthly") public Map<String,BigDecimal> monthly(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return dashboard.monthly(userId);
    }
    @GetMapping("/user/{userId}") public Map<String,Object> getDashboard(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return dashboard.getDashboard(userId);
    }
}
