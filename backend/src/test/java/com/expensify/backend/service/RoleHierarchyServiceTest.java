package com.expensify.backend.service;

import com.expensify.backend.enums.UserRole;
import com.expensify.backend.exception.ForbiddenException;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleHierarchyServiceTest {

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private RoleHierarchyService roleHierarchyService;

    private AppUser customer1;
    private AppUser customer2;
    private AppUser manager;
    private AppUser admin;

    @BeforeEach
    void setUp() {
        manager = new AppUser();
        manager.setId(10L);
        manager.setRole(UserRole.MANAGER);

        customer1 = new AppUser();
        customer1.setId(1L);
        customer1.setRole(UserRole.CUSTOMER);
        customer1.setManager(manager); // Assigned to manager

        customer2 = new AppUser();
        customer2.setId(2L);
        customer2.setRole(UserRole.CUSTOMER);
        customer2.setManager(null); // Unassigned

        admin = new AppUser();
        admin.setId(99L);
        admin.setRole(UserRole.ADMIN);
    }

    @Test
    @DisplayName("Should strictly enforce numerical hierarchy ranking: ADMIN > HEAD > MANAGER > EMPLOYEE > CUSTOMER")
    void testRoleRanks() {
        assertTrue(roleHierarchyService.getRoleRank(UserRole.ADMIN) > roleHierarchyService.getRoleRank(UserRole.HEAD));
        assertTrue(roleHierarchyService.getRoleRank(UserRole.HEAD) > roleHierarchyService.getRoleRank(UserRole.MANAGER));
        assertTrue(roleHierarchyService.getRoleRank(UserRole.MANAGER) > roleHierarchyService.getRoleRank(UserRole.EMPLOYEE));
        assertTrue(roleHierarchyService.getRoleRank(UserRole.EMPLOYEE) > roleHierarchyService.getRoleRank(UserRole.CUSTOMER));
    }

    @Test
    @DisplayName("Customer should access own data without error")
    void testCustomerAccessOwnData() {
        assertDoesNotThrow(() -> roleHierarchyService.validateAccess(1L, 1L));
    }

    @Test
    @DisplayName("Customer cannot access another customer's data (ForbiddenException)")
    void testCustomerCannotAccessAnotherCustomer() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(customer2));

        assertThrows(ForbiddenException.class, () -> roleHierarchyService.validateAccess(1L, 2L));
    }

    @Test
    @DisplayName("Manager can access assigned customer data")
    void testManagerCanAccessAssignedCustomer() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer1));

        assertDoesNotThrow(() -> roleHierarchyService.validateAccess(10L, 1L));
    }

    @Test
    @DisplayName("Manager cannot access unassigned customer data")
    void testManagerCannotAccessUnassignedCustomer() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(2L)).thenReturn(Optional.of(customer2));

        assertThrows(ForbiddenException.class, () -> roleHierarchyService.validateAccess(10L, 2L));
    }

    @Test
    @DisplayName("Admin can access any user's data across the entire system")
    void testAdminAccessAnyUser() {
        when(userRepository.findById(99L)).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(customer2));

        assertDoesNotThrow(() -> roleHierarchyService.validateAccess(99L, 2L));
    }
}
