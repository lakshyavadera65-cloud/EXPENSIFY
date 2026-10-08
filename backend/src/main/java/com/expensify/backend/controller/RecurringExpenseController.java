package com.expensify.backend.controller;

import com.expensify.backend.dto.RecurringExpenseRequest;
import com.expensify.backend.model.RecurringExpense;
import com.expensify.backend.service.RecurringExpenseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-expenses")
public class RecurringExpenseController {
    private final RecurringExpenseService recurringExpenseService;

    public RecurringExpenseController(RecurringExpenseService recurringExpenseService) {
        this.recurringExpenseService = recurringExpenseService;
    }

    private Long getAuthId(HttpServletRequest req) {
        Long id = (Long) req.getAttribute("authenticatedUserId");
        if (id == null) id = (Long) req.getAttribute("userId");
        if (id == null) throw new SecurityException("Unauthorized: User not authenticated");
        return id;
    }

    @PostMapping
    public RecurringExpense create(@Valid @RequestBody RecurringExpenseRequest request, HttpServletRequest req) {
        Long userId = getAuthId(req);
        return recurringExpenseService.create(userId, request);
    }

    @GetMapping
    public List<RecurringExpense> list(HttpServletRequest req) {
        Long userId = getAuthId(req);
        return recurringExpenseService.listByUser(userId);
    }

    @GetMapping("/{id}")
    public RecurringExpense getById(@PathVariable Long id, HttpServletRequest req) {
        Long userId = getAuthId(req);
        return recurringExpenseService.getById(id, userId);
    }

    @PutMapping("/{id}")
    public RecurringExpense update(@PathVariable Long id, @Valid @RequestBody RecurringExpenseRequest request, HttpServletRequest req) {
        Long userId = getAuthId(req);
        return recurringExpenseService.update(id, request, userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        Long userId = getAuthId(req);
        recurringExpenseService.delete(id, userId);
    }

    @PatchMapping("/{id}/pause")
    public RecurringExpense pause(@PathVariable Long id, HttpServletRequest req) {
        Long userId = getAuthId(req);
        return recurringExpenseService.pause(id, userId);
    }

    @PatchMapping("/{id}/resume")
    public RecurringExpense resume(@PathVariable Long id, HttpServletRequest req) {
        Long userId = getAuthId(req);
        return recurringExpenseService.resume(id, userId);
    }

    @PostMapping("/process")
    public Map<String, Object> triggerProcessing(HttpServletRequest req) {
        getAuthId(req); // requires authentication
        int count = recurringExpenseService.processDueRecurringExpenses();
        return Map.of("status", "success", "expensesGenerated", count);
    }
}
