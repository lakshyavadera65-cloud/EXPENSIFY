package com.expensify.backend.controller;

import com.expensify.backend.dto.ExpenseRequest;
import com.expensify.backend.model.Expense;
import com.expensify.backend.service.ExpenseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    private Long getAuthId(HttpServletRequest req) {
        Long id = (Long) req.getAttribute("authenticatedUserId");
        if (id == null) id = (Long) req.getAttribute("userId");
        return id;
    }

    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authId = getAuthId(req);
        if (authId == null || !authId.equals(resourceUserId)) {
            throw new SecurityException("Unauthorized: Access denied for user " + resourceUserId);
        }
    }

    @PostMapping("/user/{userId}")
    public Expense add(@PathVariable Long userId, @Valid @RequestBody ExpenseRequest request, HttpServletRequest req) {
        verifyOwnership(req, userId);
        return expenseService.add(userId, request);
    }

    @GetMapping("/user/{userId}")
    public List<Expense> list(@PathVariable Long userId, HttpServletRequest req) {
        verifyOwnership(req, userId);
        return expenseService.getByUser(userId);
    }

    @GetMapping("/{id}")
    public Expense get(@PathVariable Long id, HttpServletRequest req) {
        Expense expense = expenseService.get(id);
        verifyOwnership(req, expense.getUser().getId());
        return expense;
    }

    @PutMapping("/{id}")
    public Expense update(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request, HttpServletRequest req) {
        Long authId = getAuthId(req);
        if (authId == null) throw new SecurityException("Unauthorized");
        return expenseService.update(id, request, authId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        Expense expense = expenseService.get(id);
        verifyOwnership(req, expense.getUser().getId());
        expenseService.delete(id);
    }
}
