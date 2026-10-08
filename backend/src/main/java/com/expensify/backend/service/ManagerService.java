package com.expensify.backend.service;
import com.expensify.backend.enums.UserRole; import com.expensify.backend.model.AppUser; import com.expensify.backend.repository.AppUserRepository; import org.springframework.stereotype.Service; import java.util.*;
@Service
public class ManagerService {
    private final AppUserRepository users;
    public ManagerService(AppUserRepository users){this.users=users;}
    public AppUser assign(Long managerId,Long customerId){
        java.util.Optional<AppUser> foundManager=users.findById(managerId);
        if(foundManager.isEmpty()) throw new IllegalArgumentException("Manager not found");
        AppUser manager=foundManager.get();
        if(manager.getRole()!=UserRole.MANAGER && manager.getRole()!=UserRole.HEAD) throw new IllegalArgumentException("Only manager or head can manage customers");
        if(users.countByManagerId(managerId)>=1000) throw new IllegalArgumentException("Manager cannot manage more than 1000 customers");
        java.util.Optional<AppUser> foundCustomer=users.findById(customerId);
        if(foundCustomer.isEmpty()) throw new IllegalArgumentException("Customer not found");
        AppUser customer=foundCustomer.get();
        if(customer.getRole()!=UserRole.CUSTOMER) throw new IllegalArgumentException("Only customers can be assigned");
        customer.setManager(manager); return users.save(customer);
    }
    public List<AppUser> getCustomers(Long managerId){
        List<AppUser> result=new ArrayList<>(); for(AppUser user:users.findAll()){if(user.getManager()!=null && user.getManager().getId().equals(managerId)) result.add(user);} return result;
    }
}
