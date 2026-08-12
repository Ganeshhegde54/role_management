package com.rolemanagement.controller;

import com.rolemanagement.dto.*;
import com.rolemanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<PagedResponse<UserDto>> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "username") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir,
            @RequestParam(value = "search", required = false) String search
    ) {
        PagedResponse<UserDto> users = userService.getAllUsers(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<List<UserDto>> getAllUsersList() {
        return ResponseEntity.ok(userService.getAllUsersList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserCreateDto createDto) {
        UserDto createdUser = userService.createUser(createDto);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateDto updateDto) {
        return ResponseEntity.ok(userService.updateUser(id, updateDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserDto> assignRolesToUser(@PathVariable Long id, @Valid @RequestBody UserRoleAssignDto assignDto) {
        return ResponseEntity.ok(userService.assignRolesToUser(id, assignDto));
    }

    @DeleteMapping("/{id}/roles/{roleId}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserDto> removeRoleFromUser(@PathVariable Long id, @PathVariable Long roleId) {
        return ResponseEntity.ok(userService.removeRoleFromUser(id, roleId));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }
}
