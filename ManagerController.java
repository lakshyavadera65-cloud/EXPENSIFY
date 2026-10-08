package com.expensify.backend.controller;
import com.expensify.backend.model.AppUser; import com.expensify.backend.service.ManagerService; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/managers")
public class ManagerController {
    private final ManagerService managers; public ManagerController(ManagerService managers){this.managers=managers;}
    @PostMapping("/{managerId}/customers/{customerId}") public AppUser assign(@PathVariable Long managerId,@PathVariable Long customerId){return managers.assign(managerId,customerId);}
    @GetMapping("/{managerId}/customers") public List<AppUser> customers(@PathVariable Long managerId){return managers.getCustomers(managerId);}
}
