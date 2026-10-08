package com.expensify.backend.repository;
import com.expensify.backend.model.Budget;
import com.expensify.backend.enums.BudgetType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    Optional<Budget> findByUserIdAndBudgetType(Long userId, BudgetType type);
}
