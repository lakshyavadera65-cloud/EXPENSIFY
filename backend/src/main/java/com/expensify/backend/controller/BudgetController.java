package com.expensify.backend.controller;
import com.expensify.backend.dto.*; import com.expensify.backend.model.Budget; import com.expensify.backend.service.BudgetService; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgets; public BudgetController(BudgetService budgets){this.budgets=budgets;}
    private Long getAuthId(HttpServletRequest req) {
        Long id = (Long) req.getAttribute("authenticatedUserId");
        if (id == null) id = (Long) req.getAttribute("userId");
        return id;
    }

    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authenticatedId = getAuthId(req);
        if (authenticatedId == null || !authenticatedId.equals(resourceUserId)) throw new RuntimeException("Unauthorized");
    }

    @PostMapping("/user/{userId}") public Budget create(@PathVariable Long userId,@RequestBody BudgetRequest request, HttpServletRequest req){
        verifyOwnership(req, userId);
        return budgets.create(userId,request);
    }
    @GetMapping("/user/{userId}") public List<Budget> list(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        return budgets.getByUser(userId);
    }
    @PutMapping("/{budgetId}/limit") public Budget changeLimit(@PathVariable Long budgetId,@RequestBody ChangeLimitRequest request, HttpServletRequest req){
        Long callerId = getAuthId(req);
        if (callerId == null) throw new RuntimeException("Unauthorized");
        return budgets.changeLimit(budgetId, request, callerId);
    }
}
