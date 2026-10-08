package com.expensify.backend.config;

import com.expensify.backend.enums.BudgetType;
import com.expensify.backend.enums.UserRole;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Budget;
import com.expensify.backend.model.Expense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.BudgetRepository;
import com.expensify.backend.repository.ExpenseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final com.expensify.backend.repository.NotificationRepository notificationRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(AppUserRepository userRepository,
                           ExpenseRepository expenseRepository,
                           BudgetRepository budgetRepository,
                           com.expensify.backend.repository.NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // 1. Manager User
        AppUser manager = new AppUser();
        manager.setName("Raj Sharma");
        manager.setEmail("manager@expensify.app");
        manager.setPasswordHash(passwordEncoder.encode("password123"));
        manager.setRole(UserRole.MANAGER);
        manager.setCity("Bengaluru");
        manager.setCountry("India");
        manager.setLatitude(12.9716);
        manager.setLongitude(77.5946);
        manager = userRepository.save(manager);

        // 2. Customer User (Lakshya Vadera)
        AppUser customer = new AppUser();
        customer.setName("Lakshya Vadera");
        customer.setEmail("lakshya@expensify.app");
        customer.setPasswordHash(passwordEncoder.encode("password123"));
        customer.setRole(UserRole.CUSTOMER);
        customer.setCity("Bengaluru");
        customer.setCountry("India");
        customer.setLatitude(12.9716);
        customer.setLongitude(77.5946);
        customer.setManager(manager);
        customer = userRepository.save(customer);

        // 3. Budgets for Customer
        Budget daily = new Budget();
        daily.setUser(customer);
        daily.setBudgetType(BudgetType.DAILY);
        daily.setBudgetAmount(new BigDecimal("1000.00"));
        daily.setLimitAmount(new BigDecimal("800.00"));
        daily.setStartDate(LocalDate.now());
        budgetRepository.save(daily);

        Budget monthly = new Budget();
        monthly.setUser(customer);
        monthly.setBudgetType(BudgetType.MONTHLY);
        monthly.setBudgetAmount(new BigDecimal("35000.00"));
        monthly.setLimitAmount(new BigDecimal("30000.00"));
        monthly.setStartDate(LocalDate.now().withDayOfMonth(1));
        budgetRepository.save(monthly);

        // 4. Sample Expenses
        createExpense(customer, "460.00", "Food", "Swiggy lunch with team", LocalDate.now());
        createExpense(customer, "380.00", "Travel", "Uber to office", LocalDate.now());
        createExpense(customer, "1020.00", "Health", "Monthly medicines", LocalDate.now().minusDays(1));
        createExpense(customer, "3200.00", "Bills", "Electricity bill", LocalDate.now().minusDays(2));
        createExpense(customer, "4800.00", "Shopping", "Festive kurta set", LocalDate.now().minusDays(3));
        createExpense(customer, "900.00", "Entertainment", "PVR movie night", LocalDate.now().minusDays(4));
        createExpense(customer, "2650.00", "Food", "Groceries", LocalDate.now().minusDays(5));

        // 5. Seed Initial Notifications
        com.expensify.backend.model.Notification n1 = new com.expensify.backend.model.Notification();
        n1.setUser(customer);
        n1.setTitle("Monthly Budget Threshold");
        n1.setMessage("You have spent ₹13,410 of your ₹30,000 threshold limit (44%). Tracking comfortably.");
        n1.setThreshold("2:80");
        n1.setReadStatus(false);
        notificationRepository.save(n1);

        com.expensify.backend.model.Notification n2 = new com.expensify.backend.model.Notification();
        n2.setUser(customer);
        n2.setTitle("Daily Limit Advisory");
        n2.setMessage("Today's spending (₹840.00) crossed your daily limit of ₹800.00.");
        n2.setThreshold("1:100");
        n2.setReadStatus(false);
        notificationRepository.save(n2);
    }

    private void createExpense(AppUser user, String amount, String category, String desc, LocalDate date) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(new BigDecimal(amount));
        expense.setCategory(category);
        expense.setDescription(desc);
        expense.setExpenseDate(date);
        expenseRepository.save(expense);
    }
}
