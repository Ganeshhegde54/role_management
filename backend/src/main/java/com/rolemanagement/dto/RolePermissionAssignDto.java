package com.rolemanagement.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

public class RolePermissionAssignDto {

    @NotNull(message = "Permission IDs set cannot be null")
    private Set<Long> permissionIds;

    public RolePermissionAssignDto() {
    }

    public RolePermissionAssignDto(Set<Long> permissionIds) {
        this.permissionIds = permissionIds;
    }

    public Set<Long> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(Set<Long> permissionIds) {
        this.permissionIds = permissionIds;
    }
}
