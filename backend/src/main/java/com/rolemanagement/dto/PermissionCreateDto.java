package com.rolemanagement.dto;

import jakarta.validation.constraints.NotBlank;

public class PermissionCreateDto {

    @NotBlank(message = "Permission name is required")
    private String name;

    private String description;
    private String category;

    public PermissionCreateDto() {
    }

    public PermissionCreateDto(String name, String description, String category) {
        this.name = name;
        this.description = description;
        this.category = category;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
