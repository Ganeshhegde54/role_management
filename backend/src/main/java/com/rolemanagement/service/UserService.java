package com.rolemanagement.service;

import com.rolemanagement.dto.PagedResponse;
import com.rolemanagement.dto.UserCreateDto;
import com.rolemanagement.dto.UserDto;
import com.rolemanagement.dto.UserRoleAssignDto;
import com.rolemanagement.dto.UserUpdateDto;

import java.util.List;

public interface UserService {

    PagedResponse<UserDto> getAllUsers(int page, int size, String sortBy, String sortDir, String search);

    List<UserDto> getAllUsersList();

    UserDto getUserById(Long id);

    UserDto getUserByUsername(String username);

    UserDto createUser(UserCreateDto createDto);

    UserDto updateUser(Long id, UserUpdateDto updateDto);

    void deleteUser(Long id);

    UserDto assignRolesToUser(Long userId, UserRoleAssignDto assignDto);

    UserDto removeRoleFromUser(Long userId, Long roleId);

    UserDto toggleUserStatus(Long id);
}
