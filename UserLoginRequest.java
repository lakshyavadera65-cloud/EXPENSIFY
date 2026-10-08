package com.expensify.backend.dto;
import jakarta.validation.constraints.*;
public class UserLoginRequest {
    @NotBlank(message="Email is required") @Email(message="Invalid email") private String email; 
    @NotBlank(message="Password is required") private String password;
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
}
