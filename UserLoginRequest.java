package com.expensify.backend.dto;
public class UserLoginRequest {
    private String email; private String password;
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
}
