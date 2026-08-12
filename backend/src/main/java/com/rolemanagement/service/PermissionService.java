package com.rolemanagement.service;

import com.rolemanagement.dto.PagedResponse;
import com.rolemanagement.dto.PermissionCreateDto;
import com.rolemanagement.dto.PermissionDto;

import java.util.List;

public interface PermissionService {

    PagedResponse<PermissionDto> getAllPermissions(int page, int size, String sortBy, String sortDir, String search);

    List<PermissionDto> getAllPermissionsList();

    PermissionDto getPermissionById(Long id);

    PermissionDto createPermission(PermissionCreateDto createDto);

    PermissionDto updatePermission(Long id, PermissionCreateDto updateDto);

    void deletePermission(Long id);
}
