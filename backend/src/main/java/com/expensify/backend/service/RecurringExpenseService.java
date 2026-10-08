package com.expensify.backend.service;

import com.expensify.backend.dto.RecurringExpenseRequest;
import com.expensify.backend.enums.RecurringFrequency;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Expense;
import com.expensify.backend.model.RecurringExpense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.ExpenseRepository;
import com.expensify.backend.repository.RecurringExpenseRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringExpenseService {
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;
    private final AppUserRepository userRepository;
    private final BudgetAlertService budgetAlertService;

    public RecurringExpenseService(RecurringExpenseRepository recurringExpenseRepository,
                                   ExpenseRepository expenseRepository,
                                   AppUserRepository userRepository,
                                   BudgetAlertService budgetAlertService) {
        this.recurringExpenseRepository = recurringExpenseRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.budgetAlertService = budgetAlertService;
    }

    @Transactional
    public RecurringExpense create(Long userId, RecurringExpenseRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        RecurringExpense recurring = new RecurringExpense();
        recurring.setUser(user);
        recurring.setDescription(request.getDescription());
        recurring.setAmount(request.getAmount());
        recurring.setCategory(request.getCategory());
        recurring.setPaymentMethod(request.getPaymentMethod());
        recurring.setFrequency(request.getFrequency());
        recurring.setStartDate(request.getStartDate());
        recurring.setNextDueDate(request.getStartDate());
        recurring.setEndDate(request.getEndDate());
        recurring.setActive(true);

        return recurringExpenseRepository.save(recurring);
    }

    public List<RecurringExpense> listByUser(Long userId) {
        return recurringExpenseRepository.findByUserId(userId);
    }

    public RecurringExpense getById(Long id, Long userId) {
        RecurringExpense r = recurringExpenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurring expense not found: " + id));
        if (!r.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized to access recurring expense: " + id);
        }
        return r;
    }

    @Transactional
    public RecurringExpense update(Long id, RecurringExpenseRequest request, Long userId) {
        RecurringExpense r = getById(id, userId);
        if (request.getDescription() != null) r.setDescription(request.getDescription());
        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            r.setAmount(request.getAmount());
        }
        if (request.getCategory() != null) r.setCategory(request.getCategory());
        if (request.getPaymentMethod() != null) r.setPaymentMethod(request.getPaymentMethod());
        if (request.getFrequency() != null) r.setFrequency(request.getFrequency());
        if (request.getEndDate() != null) r.setEndDate(request.getEndDate());

        return recurringExpenseRepository.save(r);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        RecurringExpense r = getById(id, userId);
        recurringExpenseRepository.delete(r);
    }

    @Transactional
    public RecurringExpense pause(Long id, Long userId) {
        RecurringExpense r = getById(id, userId);
        r.setActive(false);
        return recurringExpenseRepository.save(r);
    }

    @Transactional
    public RecurringExpense resume(Long id, Long userId) {
        RecurringExpense r = getById(id, userId);
        r.setActive(true);
        if (r.getNextDueDate().isBefore(LocalDate.now())) {
            r.setNextDueDate(LocalDate.now());
        }
        return recurringExpenseRepository.save(r);
    }

    /**
     * Scheduled processor that runs daily to process all due recurring expenses.
     * Prevents duplicate expense generation using lastGeneratedDate check.
     */
    @Scheduled(cron = "0 0 1 * * ?") // 1:00 AM daily
    @Transactional
    public int processDueRecurringExpenses() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> dueList = recurringExpenseRepository.findDueRecurringExpenses(today);
        int generatedCount = 0;

        for (RecurringExpense r : dueList) {
            // Deduplication Guard: Never generate twice for the exact same due date
            if (r.getLastGeneratedDate() != null && r.getLastGeneratedDate().equals(r.getNextDueDate())) {
                LocalDate next = calculateNextDueDate(r.getNextDueDate(), r.getFrequency());
                r.setNextDueDate(next);
                if (r.getEndDate() != null && next.isAfter(r.getEndDate())) {
                    r.setActive(false);
                }
                recurringExpenseRepository.save(r);
                continue;
            }

            // Create actual Expense
            Expense expense = new Expense();
            expense.setUser(r.getUser());
            expense.setAmount(r.getAmount());
            expense.setCategory(r.getCategory());
            expense.setPaymentMethod(r.getPaymentMethod());
            expense.setDescription("[Recurring] " + r.getDescription());
            expense.setExpenseDate(r.getNextDueDate());
            expenseRepository.save(expense);
            generatedCount++;

            // Update recurring metadata
            r.setLastGeneratedDate(r.getNextDueDate());
            LocalDate next = calculateNextDueDate(r.getNextDueDate(), r.getFrequency());
            r.setNextDueDate(next);

            if (r.getEndDate() != null && next.isAfter(r.getEndDate())) {
                r.setActive(false);
            }
            recurringExpenseRepository.save(r);

            // Trigger budget alert check for the affected user
            budgetAlertService.checkBudgets(r.getUser());
        }

        return generatedCount;
    }

    public LocalDate calculateNextDueDate(LocalDate current, RecurringFrequency frequency) {
        if (current == null) return LocalDate.now();
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }
}
