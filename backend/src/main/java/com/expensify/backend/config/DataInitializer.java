package com.expensify.backend.config;

import com.expensify.backend.enums.BudgetType;
import com.expensify.backend.enums.ExpenseCategory;
import com.expensify.backend.enums.ExpensePaymentMethod;
import com.expensify.backend.enums.RecurringFrequency;
import com.expensify.backend.enums.UserRole;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.model.Budget;
import com.expensify.backend.model.Expense;
import com.expensify.backend.model.Notification;
import com.expensify.backend.model.RecurringExpense;
import com.expensify.backend.repository.AppUserRepository;
import com.expensify.backend.repository.BudgetRepository;
import com.expensify.backend.repository.ExpenseRepository;
import com.expensify.backend.repository.NotificationRepository;
import com.expensify.backend.repository.RecurringExpenseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final NotificationRepository notificationRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(AppUserRepository userRepository,
                           ExpenseRepository expenseRepository,
                           BudgetRepository budgetRepository,
                           NotificationRepository notificationRepository,
                           RecurringExpenseRepository recurringExpenseRepository) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.notificationRepository = notificationRepository;
        this.recurringExpenseRepository = recurringExpenseRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // 1. Manager User (Raj Sharma)
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

        // 4. Sample Expenses with Categories and Payment Methods
        createExpense(customer, "460.00", ExpenseCategory.FOOD, ExpensePaymentMethod.UPI, "Swiggy lunch with team", LocalDate.now());
        createExpense(customer, "380.00", ExpenseCategory.TRAVEL, ExpensePaymentMethod.CREDIT_CARD, "Uber to office", LocalDate.now());
        createExpense(customer, "1020.00", ExpenseCategory.HEALTH, ExpensePaymentMethod.DEBIT_CARD, "Monthly medicines", LocalDate.now().minusDays(1));
        createExpense(customer, "3200.00", ExpenseCategory.BILLS, ExpensePaymentMethod.BANK_TRANSFER, "Electricity bill", LocalDate.now().minusDays(2));
        createExpense(customer, "4800.00", ExpenseCategory.SHOPPING, ExpensePaymentMethod.CREDIT_CARD, "Festive kurta set", LocalDate.now().minusDays(3));
        createExpense(customer, "900.00", ExpenseCategory.ENTERTAINMENT, ExpensePaymentMethod.UPI, "PVR movie night", LocalDate.now().minusDays(4));
        createExpense(customer, "2650.00", ExpenseCategory.GROCERIES, ExpensePaymentMethod.UPI, "Groceries from Zepto", LocalDate.now().minusDays(5));
        createExpense(customer, "12000.00", ExpenseCategory.RENT, ExpensePaymentMethod.BANK_TRANSFER, "Apartment rent share", LocalDate.now().minusDays(7));
        createExpense(customer, "1499.00", ExpenseCategory.EDUCATION, ExpensePaymentMethod.CREDIT_CARD, "Spring Boot Microservices Course", LocalDate.now().minusDays(10));
        createExpense(customer, "649.00", ExpenseCategory.SUBSCRIPTIONS, ExpensePaymentMethod.CREDIT_CARD, "Netflix Subscription", LocalDate.now().minusDays(12));

        // 5. Seed Initial Notifications
        Notification n1 = new Notification();
        n1.setUser(customer);
        n1.setTitle("Monthly Budget Threshold");
        n1.setMessage("You have spent ₹27,338 of your ₹30,000 threshold limit (91%). Tracking near limit.");
        n1.setThreshold("2:90");
        n1.setReadStatus(false);
        notificationRepository.save(n1);

        Notification n2 = new Notification();
        n2.setUser(customer);
        n2.setTitle("Daily Limit Advisory");
        n2.setMessage("Today's spending (₹840.00) crossed your daily limit of ₹800.00.");
        n2.setThreshold("1:100");
        n2.setReadStatus(false);
        notificationRepository.save(n2);

        // 6. Seed Recurring Expenses
        RecurringExpense rec1 = new RecurringExpense();
        rec1.setUser(customer);
        rec1.setDescription("Netflix 4K Ultra Subscription");
        rec1.setAmount(new BigDecimal("649.00"));
        rec1.setCategory(ExpenseCategory.SUBSCRIPTIONS);
        rec1.setPaymentMethod(ExpensePaymentMethod.CREDIT_CARD);
        rec1.setFrequency(RecurringFrequency.MONTHLY);
        rec1.setStartDate(LocalDate.now().minusMonths(1));
        rec1.setNextDueDate(LocalDate.now().plusDays(5));
        rec1.setActive(true);
        recurringExpenseRepository.save(rec1);

        RecurringExpense rec2 = new RecurringExpense();
        rec2.setUser(customer);
        rec2.setDescription("Airtel Fiber Broadband");
        rec2.setAmount(new BigDecimal("1178.00"));
        rec2.setCategory(ExpenseCategory.BILLS);
        rec2.setPaymentMethod(ExpensePaymentMethod.UPI);
        rec2.setFrequency(RecurringFrequency.MONTHLY);
        rec2.setStartDate(LocalDate.now().minusMonths(2));
        rec2.setNextDueDate(LocalDate.now().plusDays(14));
        rec2.setActive(true);
        recurringExpenseRepository.save(rec2);
    }

    private void createExpense(AppUser user, String amount, ExpenseCategory category, ExpensePaymentMethod pm, String desc, LocalDate date) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(new BigDecimal(amount));
        expense.setCategory(category);
        expense.setPaymentMethod(pm);
        expense.setDescription(desc);
        expense.setExpenseDate(date);
        expenseRepository.save(expense);
    }
}
