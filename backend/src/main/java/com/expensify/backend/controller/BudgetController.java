package com.expensify.backend.controller;
import com.expensify.backend.dto.*; import com.expensify.backend.model.Budget; import com.expensify.backend.service.BudgetService; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgets; public BudgetController(BudgetService budgets){this.budgets=budgets;}
    @PostMapping("/user/{userId}") public Budget create(@PathVariable Long userId,@RequestBody BudgetRequest request, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return budgets.create(userId,request);
    }
    @GetMapping("/user/{userId}") public List<Budget> list(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return budgets.getByUser(userId);
    }
    @PutMapping("/{budgetId}/limit") public Budget changeLimit(@PathVariable Long budgetId,@RequestBody ChangeLimitRequest request, HttpServletRequest req){
        Long callerId = (Long) req.getAttribute("userId");
        return budgets.changeLimit(budgetId, request, callerId);
    }
}
