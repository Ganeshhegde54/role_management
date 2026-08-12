package com.rolemanagement.service.impl;

import com.rolemanagement.dto.JwtAuthResponse;
import com.rolemanagement.dto.LoginRequest;
import com.rolemanagement.dto.RegisterRequest;
import com.rolemanagement.dto.UserCreateDto;
import com.rolemanagement.dto.UserDto;
import com.rolemanagement.security.JwtTokenProvider;
import com.rolemanagement.service.AuthService;
import com.rolemanagement.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserService userService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @Override
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserDto userDto = userService.getUserByUsername(authentication.getName());

        return new JwtAuthResponse(token, userDto);
    }

    @Override
    public UserDto register(RegisterRequest registerRequest) {
        UserCreateDto createDto = new UserCreateDto();
        createDto.setUsername(registerRequest.getUsername());
        createDto.setEmail(registerRequest.getEmail());
        createDto.setPassword(registerRequest.getPassword());
        createDto.setEnabled(true);

        return userService.createUser(createDto);
    }

    @Override
    public UserDto getCurrentUser(String username) {
        return userService.getUserByUsername(username);
    }
}
