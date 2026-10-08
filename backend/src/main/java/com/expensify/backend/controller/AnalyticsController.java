package com.expensify.backend.controller;

import com.expensify.backend.dto.*;
import com.expensify.backend.service.AnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    private Long getAuthId(HttpServletRequest req) {
        Long id = (Long) req.getAttribute("authenticatedUserId");
        if (id == null) id = (Long) req.getAttribute("userId");
        if (id == null) throw new SecurityException("Unauthorized: User not authenticated");
        return id;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryDTO getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest req) {
        Long userId = getAuthId(req);
        return analyticsService.getSummary(userId, startDate, endDate);
    }

    @GetMapping("/categories")
    public List<CategorySpendingDTO> getCategories(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest req) {
        Long userId = getAuthId(req);
        return analyticsService.getCategoryAnalytics(userId, startDate, endDate);
    }

    @GetMapping("/payment-methods")
    public List<PaymentMethodSpendingDTO> getPaymentMethods(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest req) {
        Long userId = getAuthId(req);
        return analyticsService.getPaymentMethodAnalytics(userId, startDate, endDate);
    }

    @GetMapping("/daily")
    public List<DailySpendingDTO> getDaily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest req) {
        Long userId = getAuthId(req);
        return analyticsService.getDailyAnalytics(userId, startDate, endDate);
    }

    @GetMapping("/monthly")
    public List<MonthlySpendingDTO> getMonthly(
            @RequestParam(required = false) Integer year,
            HttpServletRequest req) {
        Long userId = getAuthId(req);
        return analyticsService.getMonthlyAnalytics(userId, year);
    }
}
