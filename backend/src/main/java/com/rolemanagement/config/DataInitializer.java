package com.rolemanagement.config;

import com.rolemanagement.entity.Permission;
import com.rolemanagement.entity.Role;
import com.rolemanagement.entity.User;
import com.rolemanagement.repository.PermissionRepository;
import com.rolemanagement.repository.RoleRepository;
import com.rolemanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PermissionRepository permissionRepository,
                           RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Granular Permissions
        List<PermissionSeed> defaultPermissions = Arrays.asList(
            new PermissionSeed("USER_READ", "View user lists and user profiles", "USER"),
            new PermissionSeed("USER_CREATE", "Create new user accounts", "USER"),
            new PermissionSeed("USER_UPDATE", "Update existing user profiles and status", "USER"),
            new PermissionSeed("USER_DELETE", "Delete user accounts", "USER"),

            new PermissionSeed("ROLE_READ", "View roles and role details", "ROLE"),
            new PermissionSeed("ROLE_CREATE", "Create new system roles", "ROLE"),
            new PermissionSeed("ROLE_UPDATE", "Update role details and permissions", "ROLE"),
            new PermissionSeed("ROLE_DELETE", "Delete system roles", "ROLE"),

            new PermissionSeed("PERMISSION_READ", "View permissions list", "PERMISSION"),
            new PermissionSeed("PERMISSION_CREATE", "Create new permissions", "PERMISSION"),
            new PermissionSeed("PERMISSION_UPDATE", "Update permission definitions", "PERMISSION"),
            new PermissionSeed("PERMISSION_DELETE", "Delete permissions", "PERMISSION")
        );

        for (PermissionSeed pSeed : defaultPermissions) {
            if (!permissionRepository.existsByName(pSeed.name)) {
                Permission p = new Permission(pSeed.name, pSeed.description, pSeed.category);
                permissionRepository.save(p);
            }
        }

        // 2. Fetch all permissions
        List<Permission> allPermissions = permissionRepository.findAll();
        Set<Permission> adminPermissions = new HashSet<>(allPermissions);

        Set<Permission> managerPermissions = new HashSet<>(
            permissionRepository.findAll().stream()
                .filter(p -> p.getName().startsWith("USER_") || p.getName().endsWith("_READ"))
                .toList()
        );

        Set<Permission> userPermissions = new HashSet<>(
            permissionRepository.findAll().stream()
                .filter(p -> p.getName().endsWith("_READ"))
                .toList()
        );

        // 3. Seed Standard Roles
        Role adminRole = createRoleIfNotFound("ROLE_ADMIN", "Full Administrator with all permissions", adminPermissions);
        Role managerRole = createRoleIfNotFound("ROLE_MANAGER", "Manager role with user management and read permissions", managerPermissions);
        Role userRole = createRoleIfNotFound("ROLE_USER", "Standard user role with read-only access", userPermissions);

        // 4. Seed Default Admin User
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("adminpassword"));
            admin.setEnabled(true);
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
        }

        // 5. Seed Sample Manager User
        if (!userRepository.existsByUsername("manager")) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setEmail("manager@example.com");
            manager.setPassword(passwordEncoder.encode("managerpassword"));
            manager.setEnabled(true);
            manager.getRoles().add(managerRole);
            userRepository.save(manager);
        }

        // 6. Seed Sample Standard User
        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@example.com");
            user.setPassword(passwordEncoder.encode("userpassword"));
            user.setEnabled(true);
            user.getRoles().add(userRole);
            userRepository.save(user);
        }
    }

    private Role createRoleIfNotFound(String name, String description, Set<Permission> permissions) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role(name, description);
            role.setPermissions(permissions);
            return roleRepository.save(role);
        });
    }

    private record PermissionSeed(String name, String description, String category) {}
}
