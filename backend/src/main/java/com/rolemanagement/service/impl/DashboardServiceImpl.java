package com.rolemanagement.service.impl;

import com.rolemanagement.dto.DashboardStatsDto;
import com.rolemanagement.dto.RoleDto;
import com.rolemanagement.dto.UserDto;
import com.rolemanagement.entity.Role;
import com.rolemanagement.entity.User;
import com.rolemanagement.repository.PermissionRepository;
import com.rolemanagement.repository.RoleRepository;
import com.rolemanagement.repository.UserRepository;
import com.rolemanagement.service.DashboardService;
import com.rolemanagement.service.RoleService;
import com.rolemanagement.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserService userService;
    private final RoleService roleService;

    public DashboardServiceImpl(UserRepository userRepository,
                                RoleRepository roleRepository,
                                PermissionRepository permissionRepository,
                                UserService userService,
                                RoleService roleService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userService = userService;
        this.roleService = roleService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalRoles = roleRepository.count();
        long totalPermissions = permissionRepository.count();
        long activeUsers = userRepository.countByEnabled(true);

        // Role distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        List<User> allUsers = userRepository.findAll();
        List<Role> allRoles = roleRepository.findAll();

        for (Role role : allRoles) {
            long count = allUsers.stream()
                    .filter(u -> u.getRoles().contains(role))
                    .count();
            roleDistribution.put(role.getName(), count);
        }

        // Recent top 5 users
        List<UserDto> recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(u -> userService.getUserById(u.getId()))
                .collect(Collectors.toList());

        // Recent top 5 roles
        List<RoleDto> recentRoles = roleService.getAllRolesList().stream()
                .limit(5)
                .collect(Collectors.toList());

        return new DashboardStatsDto(
                totalUsers,
                totalRoles,
                totalPermissions,
                activeUsers,
                roleDistribution,
                recentUsers,
                recentRoles
        );
    }
}
