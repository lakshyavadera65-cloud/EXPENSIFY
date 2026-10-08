package com.expensify.backend.repository;
import com.expensify.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId")
    List<Expense> findByUserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.expenseDate BETWEEN :from AND :to")
    List<Expense> findByUserIdAndExpenseDateBetween(@Param("userId") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
