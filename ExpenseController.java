package com.expensify.backend.controller;
import com.expensify.backend.dto.ExpenseRequest; import com.expensify.backend.model.Expense; import com.expensify.backend.service.ExpenseService; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenses; public ExpenseController(ExpenseService expenses){this.expenses=expenses;}
    @PostMapping("/user/{userId}") public Expense add(@PathVariable Long userId,@RequestBody ExpenseRequest request){return expenses.add(userId,request);}
    @GetMapping("/user/{userId}") public List<Expense> list(@PathVariable Long userId){return expenses.getByUser(userId);}
    @GetMapping("/{id}") public Expense get(@PathVariable Long id){return expenses.get(id);}
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id){expenses.delete(id);}
}
