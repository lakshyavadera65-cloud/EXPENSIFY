package com.expensify.backend.controller;
import com.expensify.backend.dto.ExpenseRequest; import com.expensify.backend.model.Expense; import com.expensify.backend.service.ExpenseService; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController @RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenses; public ExpenseController(ExpenseService expenses){this.expenses=expenses;}
    
    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authenticatedId = (Long) req.getAttribute("authenticatedUserId");
        if (authenticatedId == null || !authenticatedId.equals(resourceUserId)) throw new RuntimeException("Unauthorized");
    }

    @PostMapping("/user/{userId}") public Expense add(@PathVariable Long userId,@Valid @RequestBody ExpenseRequest request, HttpServletRequest req){
        verifyOwnership(req, userId);
        return expenses.add(userId,request);
    }
    @GetMapping("/user/{userId}") public List<Expense> list(@PathVariable Long userId, HttpServletRequest req){
        verifyOwnership(req, userId);
        return expenses.getByUser(userId);
    }
    @GetMapping("/{id}") public Expense get(@PathVariable Long id, HttpServletRequest req){
        Expense e = expenses.get(id);
        verifyOwnership(req, e.getUser().getId());
        return e;
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id, HttpServletRequest req){
        Expense e = expenses.get(id);
        verifyOwnership(req, e.getUser().getId());
        expenses.delete(id);
    }
}
