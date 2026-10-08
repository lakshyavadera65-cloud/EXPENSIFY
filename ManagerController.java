package com.expensify.backend.controller;
import com.expensify.backend.dto.CustomerResponse; import com.expensify.backend.model.AppUser; import com.expensify.backend.service.ManagerService; import org.springframework.web.bind.annotation.*; import java.util.List; import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;
import com.expensify.backend.annotation.RequireRole;
import com.expensify.backend.enums.UserRole;

@RestController @RequestMapping("/api/managers")
@RequireRole(UserRole.MANAGER)
public class ManagerController {
    private final ManagerService managers; public ManagerController(ManagerService managers){this.managers=managers;}

    private void verifyOwnership(HttpServletRequest req, Long resourceUserId) {
        Long authenticatedId = (Long) req.getAttribute("authenticatedUserId");
        if (authenticatedId == null || !authenticatedId.equals(resourceUserId)) throw new RuntimeException("Unauthorized");
    }

    @PostMapping("/{managerId}/customers/{customerId}") public CustomerResponse assign(@PathVariable Long managerId,@PathVariable Long customerId, HttpServletRequest req){
        verifyOwnership(req, managerId);
        AppUser u = managers.assign(managerId,customerId);
        return new CustomerResponse(u.getId(), u.getName(), u.getEmail());
    }
    @GetMapping("/{managerId}/customers") public List<CustomerResponse> customers(@PathVariable Long managerId, HttpServletRequest req){
        verifyOwnership(req, managerId);
        return managers.getCustomers(managerId).stream()
            .map(u -> new CustomerResponse(u.getId(), u.getName(), u.getEmail()))
            .collect(Collectors.toList());
    }
}
