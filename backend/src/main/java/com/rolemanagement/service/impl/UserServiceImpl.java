package com.rolemanagement.service.impl;

import com.rolemanagement.dto.*;
import com.rolemanagement.entity.Role;
import com.rolemanagement.entity.User;
import com.rolemanagement.exception.DuplicateResourceException;
import com.rolemanagement.exception.ResourceNotFoundException;
import com.rolemanagement.repository.RoleRepository;
import com.rolemanagement.repository.UserRepository;
import com.rolemanagement.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getAllUsers(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> usersPage = userRepository.searchUsers(search, pageable);
        List<UserDto> content = usersPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsersList() {
        return userRepository.findAll(Sort.by("username")).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserDto createUser(UserCreateDto createDto) {
        if (userRepository.existsByUsername(createDto.getUsername())) {
            throw new DuplicateResourceException("User", "username", createDto.getUsername());
        }

        if (userRepository.existsByEmail(createDto.getEmail())) {
            throw new DuplicateResourceException("User", "email", createDto.getEmail());
        }

        User user = new User();
        user.setUsername(createDto.getUsername());
        user.setEmail(createDto.getEmail());
        user.setPassword(passwordEncoder.encode(createDto.getPassword()));
        user.setEnabled(createDto.isEnabled());

        if (createDto.getRoleIds() != null && !createDto.getRoleIds().isEmpty()) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(createDto.getRoleIds()));
            user.setRoles(roles);
        } else {
            // Default USER role if none specified
            roleRepository.findByName("ROLE_USER").ifPresent(user.getRoles()::add);
        }

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UserUpdateDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (updateDto.getEmail() != null && !updateDto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(updateDto.getEmail())) {
                throw new DuplicateResourceException("User", "email", updateDto.getEmail());
            }
            user.setEmail(updateDto.getEmail());
        }

        if (updateDto.getPassword() != null && !updateDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }

        if (updateDto.getEnabled() != null) {
            user.setEnabled(updateDto.getEnabled());
        }

        if (updateDto.getRoleIds() != null) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(updateDto.getRoleIds()));
            user.setRoles(roles);
        }

        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserDto assignRolesToUser(Long userId, UserRoleAssignDto assignDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<Role> roles = new HashSet<>(roleRepository.findAllById(assignDto.getRoleIds()));
        user.setRoles(roles);

        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public UserDto removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        user.getRoles().remove(role);
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setEnabled(!user.isEnabled());
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    private UserDto mapToDto(User user) {
        Set<RoleDto> roleDtos = user.getRoles().stream()
                .map(r -> {
                    Set<PermissionDto> permissionDtos = r.getPermissions().stream()
                            .map(p -> new PermissionDto(p.getId(), p.getName(), p.getDescription(), p.getCategory(), p.getCreatedAt(), p.getUpdatedAt()))
                            .collect(Collectors.toSet());
                    return new RoleDto(r.getId(), r.getName(), r.getDescription(), permissionDtos, 0, r.getCreatedAt(), r.getUpdatedAt());
                })
                .collect(Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getName())
                .collect(Collectors.toSet());

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isEnabled(),
                roleDtos,
                permissions,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
