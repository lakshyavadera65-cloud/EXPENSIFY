package com.expensify.backend.service;

import com.expensify.backend.dto.ExpenseRequest;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Expense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final AppUserRepository userRepository;
    private final BudgetAlertService budgetAlertService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          AppUserRepository userRepository,
                          BudgetAlertService budgetAlertService) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.budgetAlertService = budgetAlertService;
    }

    @Transactional
    public Expense add(Long userId, ExpenseRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be greater than zero");
        }
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory() != null ? request.getCategory() : ExpenseCategory.OTHER);
        expense.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : ExpensePaymentMethod.UPI);
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        Expense saved = expenseRepository.save(expense);
        budgetAlertService.checkBudgets(user);
        return saved;
    }

    @Transactional
    public Expense update(Long id, ExpenseRequest request, Long userId) {
        Expense expense = get(id);
        if (!expense.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized to update this expense");
        }
        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            expense.setAmount(request.getAmount());
        }
        if (request.getCategory() != null) {
            expense.setCategory(request.getCategory());
        }
        if (request.getPaymentMethod() != null) {
            expense.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getDescription() != null) {
            expense.setDescription(request.getDescription());
        }
        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }
        Expense updated = expenseRepository.save(expense);
        budgetAlertService.checkBudgets(expense.getUser());
        return updated;
    }

    public List<Expense> getByUser(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    public Expense get(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with id: " + id));
    }

    @Transactional
    public void delete(Long id) {
        expenseRepository.deleteById(id);
    }
}
