package com.expensify.backend.controller;
import com.expensify.backend.service.DashboardService; import org.springframework.web.bind.annotation.*; import java.math.BigDecimal; import java.util.Map;
@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboard; public DashboardController(DashboardService dashboard){this.dashboard=dashboard;}
    @GetMapping("/{userId}/daily") public Map<String,Object> daily(@PathVariable Long userId){return dashboard.daily(userId);}
    @GetMapping("/{userId}/monthly") public Map<String,BigDecimal> monthly(@PathVariable Long userId){return dashboard.monthly(userId);}
}
