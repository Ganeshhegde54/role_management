package com.rolemanagement.dto;

import jakarta.validation.constraints.Email;

import java.util.Set;

public class UserUpdateDto {

    @Email(message = "Email must be valid")
    private String email;

    private String password;

    private Boolean enabled;

    private Set<Long> roleIds;

    public UserUpdateDto() {
    }

    public UserUpdateDto(String email, String password, Boolean enabled, Set<Long> roleIds) {
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.roleIds = roleIds;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Set<Long> getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(Set<Long> roleIds) {
        this.roleIds = roleIds;
    }
}
