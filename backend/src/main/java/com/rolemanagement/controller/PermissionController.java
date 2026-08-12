package com.rolemanagement.controller;

import com.rolemanagement.dto.PagedResponse;
import com.rolemanagement.dto.PermissionCreateDto;
import com.rolemanagement.dto.PermissionDto;
import com.rolemanagement.service.PermissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<PagedResponse<PermissionDto>> getAllPermissions(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "category") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir,
            @RequestParam(value = "search", required = false) String search
    ) {
        PagedResponse<PermissionDto> permissions = permissionService.getAllPermissions(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<List<PermissionDto>> getAllPermissionsList() {
        return ResponseEntity.ok(permissionService.getAllPermissionsList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public ResponseEntity<PermissionDto> getPermissionById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getPermissionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    public ResponseEntity<PermissionDto> createPermission(@Valid @RequestBody PermissionCreateDto createDto) {
        PermissionDto createdPermission = permissionService.createPermission(createDto);
        return new ResponseEntity<>(createdPermission, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    public ResponseEntity<PermissionDto> updatePermission(@PathVariable Long id, @Valid @RequestBody PermissionCreateDto updateDto) {
        return ResponseEntity.ok(permissionService.updatePermission(id, updateDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}
