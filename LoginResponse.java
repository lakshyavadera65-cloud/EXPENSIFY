package com.expensify.backend.dto;
import com.expensify.backend.enums.UserRole;
public class LoginResponse {
    private Long userId; private String name; private String email; private UserRole role; private String token; private String refreshToken;
    public LoginResponse(Long userId,String name,String email,UserRole role,String token,String refreshToken){this.userId=userId;this.name=name;this.email=email;this.role=role;this.token=token;this.refreshToken=refreshToken;}
    public Long getUserId(){return userId;} public String getName(){return name;} public String getEmail(){return email;} public UserRole getRole(){return role;} public String getToken(){return token;} public String getRefreshToken(){return refreshToken;}
}
