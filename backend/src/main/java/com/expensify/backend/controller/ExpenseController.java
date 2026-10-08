package com.expensify.backend.controller;
import com.expensify.backend.dto.ExpenseRequest; import com.expensify.backend.model.Expense; import com.expensify.backend.service.ExpenseService; import org.springframework.web.bind.annotation.*; import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenses; public ExpenseController(ExpenseService expenses){this.expenses=expenses;}
    @PostMapping("/user/{userId}") public Expense add(@PathVariable Long userId,@RequestBody ExpenseRequest r, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return expenses.add(userId,r);
    }
    @GetMapping("/user/{userId}") public List<Expense> list(@PathVariable Long userId, HttpServletRequest req){
        if (!userId.equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return expenses.getByUser(userId);
    }
    @GetMapping("/{id}") public Expense get(@PathVariable Long id, HttpServletRequest req){
        Expense e = expenses.get(id);
        if (!e.getUser().getId().equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        return e;
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id, HttpServletRequest req){
        Expense e = expenses.get(id);
        if (!e.getUser().getId().equals(req.getAttribute("userId"))) throw new SecurityException("Unauthorized");
        expenses.delete(id);
    }
}
