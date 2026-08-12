package com.rolemanagement;

import com.rolemanagement.dto.JwtAuthResponse;
import com.rolemanagement.dto.LoginRequest;
import com.rolemanagement.dto.RegisterRequest;
import com.rolemanagement.dto.UserDto;
import com.rolemanagement.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void testAdminLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest("admin", "adminpassword");
        JwtAuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("admin", response.getUser().getUsername());
        assertTrue(response.getUser().getPermissions().contains("USER_READ"));
    }

    @Test
    void testUserRegistration() {
        RegisterRequest request = new RegisterRequest("testuser", "testuser@example.com", "password123");
        UserDto registered = authService.register(request);

        assertNotNull(registered);
        assertEquals("testuser", registered.getUsername());
        assertEquals("testuser@example.com", registered.getEmail());
    }
}
