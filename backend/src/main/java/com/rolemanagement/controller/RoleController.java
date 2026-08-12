package com.rolemanagement.controller;

import com.rolemanagement.dto.*;
import com.rolemanagement.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<PagedResponse<RoleDto>> getAllRoles(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir,
            @RequestParam(value = "search", required = false) String search
    ) {
        PagedResponse<RoleDto> roles = roleService.getAllRoles(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<List<RoleDto>> getAllRolesList() {
        return ResponseEntity.ok(roleService.getAllRolesList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ResponseEntity<RoleDto> createRole(@Valid @RequestBody RoleCreateDto createDto) {
        RoleDto createdRole = roleService.createRole(createDto);
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Long id, @Valid @RequestBody RoleCreateDto updateDto) {
        return ResponseEntity.ok(roleService.updateRole(id, updateDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public ResponseEntity<RoleDto> assignPermissionsToRole(@PathVariable Long id, @Valid @RequestBody RolePermissionAssignDto assignDto) {
        return ResponseEntity.ok(roleService.assignPermissionsToRole(id, assignDto));
    }

    @DeleteMapping("/{id}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public ResponseEntity<RoleDto> removePermissionFromRole(@PathVariable Long id, @PathVariable Long permissionId) {
        return ResponseEntity.ok(roleService.removePermissionFromRole(id, permissionId));
    }
}
