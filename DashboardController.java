package com.expensify.backend.controller;
import com.expensify.backend.service.DashboardService; import org.springframework.web.bind.annotation.*; import java.math.BigDecimal; import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboard; public DashboardController(DashboardService dashboard){this.dashboard=dashboard;}
    
    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authenticatedId = (Long) req.getAttribute("authenticatedUserId");
        if (authenticatedId == null || !authenticatedId.equals(resourceUserId)) throw new RuntimeException("Unauthorized");
    }

    @GetMapping("/{userId}/daily") public Map<String,Object> daily(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        return dashboard.daily(userId);
    }
    @GetMapping("/{userId}/monthly") public Map<String,BigDecimal> monthly(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        return dashboard.monthly(userId);
    }
}
