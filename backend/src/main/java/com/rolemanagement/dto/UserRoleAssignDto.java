package com.rolemanagement.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

public class UserRoleAssignDto {

    @NotNull(message = "Role IDs set cannot be null")
    private Set<Long> roleIds;

    public UserRoleAssignDto() {
    }

    public UserRoleAssignDto(Set<Long> roleIds) {
        this.roleIds = roleIds;
    }

    public Set<Long> getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(Set<Long> roleIds) {
        this.roleIds = roleIds;
    }
}
