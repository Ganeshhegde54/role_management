package com.rolemanagement.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class RoleDto {

    private Long id;
    private String name;
    private String description;
    private Set<PermissionDto> permissions;
    private int usersCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoleDto() {
    }

    public RoleDto(Long id, String name, String description, Set<PermissionDto> permissions, int usersCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.permissions = permissions;
        this.usersCount = usersCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<PermissionDto> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<PermissionDto> permissions) {
        this.permissions = permissions;
    }

    public int getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(int usersCount) {
        this.usersCount = usersCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
