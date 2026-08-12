package com.rolemanagement.service;

import com.rolemanagement.dto.PagedResponse;
import com.rolemanagement.dto.RoleCreateDto;
import com.rolemanagement.dto.RoleDto;
import com.rolemanagement.dto.RolePermissionAssignDto;

import java.util.List;

public interface RoleService {

    PagedResponse<RoleDto> getAllRoles(int page, int size, String sortBy, String sortDir, String search);

    List<RoleDto> getAllRolesList();

    RoleDto getRoleById(Long id);

    RoleDto createRole(RoleCreateDto createDto);

    RoleDto updateRole(Long id, RoleCreateDto updateDto);

    void deleteRole(Long id);

    RoleDto assignPermissionsToRole(Long roleId, RolePermissionAssignDto assignDto);

    RoleDto removePermissionFromRole(Long roleId, Long permissionId);
}
