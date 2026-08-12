package com.rolemanagement.service.impl;

import com.rolemanagement.dto.PagedResponse;
import com.rolemanagement.dto.PermissionCreateDto;
import com.rolemanagement.dto.PermissionDto;
import com.rolemanagement.entity.Permission;
import com.rolemanagement.exception.DuplicateResourceException;
import com.rolemanagement.exception.ResourceNotFoundException;
import com.rolemanagement.repository.PermissionRepository;
import com.rolemanagement.service.PermissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionServiceImpl(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PermissionDto> getAllPermissions(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Permission> permissionsPage = permissionRepository.searchPermissions(search, pageable);
        List<PermissionDto> content = permissionsPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                permissionsPage.getNumber(),
                permissionsPage.getSize(),
                permissionsPage.getTotalElements(),
                permissionsPage.getTotalPages(),
                permissionsPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissionsList() {
        return permissionRepository.findAll(Sort.by("category", "name")).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionDto getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        return mapToDto(permission);
    }

    @Override
    @Transactional
    public PermissionDto createPermission(PermissionCreateDto createDto) {
        if (permissionRepository.existsByName(createDto.getName())) {
            throw new DuplicateResourceException("Permission", "name", createDto.getName());
        }

        Permission permission = new Permission();
        permission.setName(createDto.getName().trim().toUpperCase());
        permission.setDescription(createDto.getDescription());
        permission.setCategory(createDto.getCategory() != null ? createDto.getCategory().trim().toUpperCase() : "GENERAL");

        Permission saved = permissionRepository.save(permission);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public PermissionDto updatePermission(Long id, PermissionCreateDto updateDto) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        if (!permission.getName().equalsIgnoreCase(updateDto.getName()) && permissionRepository.existsByName(updateDto.getName())) {
            throw new DuplicateResourceException("Permission", "name", updateDto.getName());
        }

        permission.setName(updateDto.getName().trim().toUpperCase());
        permission.setDescription(updateDto.getDescription());
        if (updateDto.getCategory() != null) {
            permission.setCategory(updateDto.getCategory().trim().toUpperCase());
        }

        Permission updated = permissionRepository.save(permission);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        permissionRepository.delete(permission);
    }

    private PermissionDto mapToDto(Permission permission) {
        return new PermissionDto(
                permission.getId(),
                permission.getName(),
                permission.getDescription(),
                permission.getCategory(),
                permission.getCreatedAt(),
                permission.getUpdatedAt()
        );
    }
}
