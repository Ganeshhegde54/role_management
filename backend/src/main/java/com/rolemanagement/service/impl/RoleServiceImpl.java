package com.rolemanagement.service.impl;

import com.rolemanagement.dto.PagedResponse;
import com.rolemanagement.dto.PermissionDto;
import com.rolemanagement.dto.RoleCreateDto;
import com.rolemanagement.dto.RoleDto;
import com.rolemanagement.dto.RolePermissionAssignDto;
import com.rolemanagement.entity.Permission;
import com.rolemanagement.entity.Role;
import com.rolemanagement.exception.DuplicateResourceException;
import com.rolemanagement.exception.ResourceNotFoundException;
import com.rolemanagement.repository.PermissionRepository;
import com.rolemanagement.repository.RoleRepository;
import com.rolemanagement.repository.UserRepository;
import com.rolemanagement.service.RoleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public RoleServiceImpl(RoleRepository roleRepository,
                           PermissionRepository permissionRepository,
                           UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RoleDto> getAllRoles(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Role> rolesPage = roleRepository.searchRoles(search, pageable);
        List<RoleDto> content = rolesPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                rolesPage.getNumber(),
                rolesPage.getSize(),
                rolesPage.getTotalElements(),
                rolesPage.getTotalPages(),
                rolesPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRolesList() {
        return roleRepository.findAll(Sort.by("name")).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDto getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return mapToDto(role);
    }

    @Override
    @Transactional
    public RoleDto createRole(RoleCreateDto createDto) {
        String roleName = createDto.getName().trim().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        if (roleRepository.existsByName(roleName)) {
            throw new DuplicateResourceException("Role", "name", roleName);
        }

        Role role = new Role();
        role.setName(roleName);
        role.setDescription(createDto.getDescription());

        if (createDto.getPermissionIds() != null && !createDto.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(createDto.getPermissionIds()));
            role.setPermissions(permissions);
        }

        Role saved = roleRepository.save(role);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public RoleDto updateRole(Long id, RoleCreateDto updateDto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        String roleName = updateDto.getName().trim().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        if (!role.getName().equalsIgnoreCase(roleName) && roleRepository.existsByName(roleName)) {
            throw new DuplicateResourceException("Role", "name", roleName);
        }

        role.setName(roleName);
        role.setDescription(updateDto.getDescription());

        if (updateDto.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(updateDto.getPermissionIds()));
            role.setPermissions(permissions);
        }

        Role updated = roleRepository.save(role);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        
        // Remove associations from users before deleting role
        userRepository.findAll().forEach(user -> {
            if (user.getRoles().contains(role)) {
                user.getRoles().remove(role);
                userRepository.save(user);
            }
        });

        roleRepository.delete(role);
    }

    @Override
    @Transactional
    public RoleDto assignPermissionsToRole(Long roleId, RolePermissionAssignDto assignDto) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(assignDto.getPermissionIds()));
        role.setPermissions(permissions);

        Role updated = roleRepository.save(role);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public RoleDto removePermissionFromRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", permissionId));

        role.getPermissions().remove(permission);
        Role updated = roleRepository.save(role);
        return mapToDto(updated);
    }

    private RoleDto mapToDto(Role role) {
        Set<PermissionDto> permissionDtos = role.getPermissions().stream()
                .map(p -> new PermissionDto(p.getId(), p.getName(), p.getDescription(), p.getCategory(), p.getCreatedAt(), p.getUpdatedAt()))
                .collect(Collectors.toSet());

        // Count users assigned to this role
        int usersCount = (int) userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(role))
                .count();

        return new RoleDto(
                role.getId(),
                role.getName(),
                role.getDescription(),
                permissionDtos,
                usersCount,
                role.getCreatedAt(),
                role.getUpdatedAt()
        );
    }
}
