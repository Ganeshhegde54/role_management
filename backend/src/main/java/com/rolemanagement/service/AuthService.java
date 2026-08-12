package com.rolemanagement.service;

import com.rolemanagement.dto.JwtAuthResponse;
import com.rolemanagement.dto.LoginRequest;
import com.rolemanagement.dto.RegisterRequest;
import com.rolemanagement.dto.UserDto;

public interface AuthService {

    JwtAuthResponse login(LoginRequest loginRequest);

    UserDto register(RegisterRequest registerRequest);

    UserDto getCurrentUser(String username);
}
