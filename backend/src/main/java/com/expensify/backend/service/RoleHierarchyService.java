package com.expensify.backend.service;

import com.expensify.backend.enums.UserRole;
import com.expensify.backend.exception.ForbiddenException;
import com.expensify.backend.exception.ResourceNotFoundException;
import com.expensify.backend.model.AppUser;
import com.expensify.backend.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoleHierarchyService {
    private final AppUserRepository userRepository;

    public RoleHierarchyService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Numerical weight for hierarchical role comparisons:
     * ADMIN (5) > HEAD (4) > MANAGER (3) > EMPLOYEE (2) > CUSTOMER (1)
     */
    public int getRoleRank(UserRole role) {
        if (role == null) return 0;
        return switch (role) {
            case ADMIN -> 5;
            case HEAD -> 4;
            case MANAGER -> 3;
            case EMPLOYEE -> 2;
            case CUSTOMER -> 1;
        };
    }

    public boolean hasHigherOrEqualRole(UserRole actorRole, UserRole targetRole) {
        return getRoleRank(actorRole) >= getRoleRank(targetRole);
    }

    /**
     * Validates whether an actor has permission to read or manage target user financial data.
     * Throws ForbiddenException if access is not permitted.
     */
    public void validateAccess(Long actorId, Long targetUserId) {
        if (actorId == null || targetUserId == null) {
            throw new ForbiddenException("Actor ID and Target User ID are required");
        }
        if (actorId.equals(targetUserId)) {
            return; // Every user can access their own data
        }

        AppUser actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Actor not found: " + actorId));
        AppUser target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found: " + targetUserId));

        if (actor.getRole() == UserRole.ADMIN) {
            return; // Admins have full access across the entire system
        }

        if (actor.getRole() == UserRole.HEAD) {
            // Department Heads can view managers and any customers managed by their managers
            if (target.getManager() != null && target.getManager().getId().equals(actorId)) return;
            if (target.getRole() == UserRole.MANAGER) return;
            return;
        }

        if (actor.getRole() == UserRole.MANAGER) {
            // Managers can view only assigned customers/employees
            if (target.getManager() != null && target.getManager().getId().equals(actorId)) {
                return;
            }
        }

        throw new ForbiddenException("Access denied: User " + actorId + " (" + actor.getRole() + ") is not authorized to access user " + targetUserId);
    }

    /**
     * Returns all user IDs that the actor is authorized to inspect.
     */
    public List<Long> getPermittedUserIds(Long actorId) {
        AppUser actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actorId));

        List<Long> ids = new ArrayList<>();
        ids.add(actorId);

        if (actor.getRole() == UserRole.ADMIN) {
            for (AppUser u : userRepository.findAll()) {
                if (!ids.contains(u.getId())) ids.add(u.getId());
            }
            return ids;
        }

        if (actor.getRole() == UserRole.MANAGER || actor.getRole() == UserRole.HEAD) {
            for (AppUser u : userRepository.findAll()) {
                if (u.getManager() != null && u.getManager().getId().equals(actorId)) {
                    ids.add(u.getId());
                }
            }
        }

        return ids;
    }
}
