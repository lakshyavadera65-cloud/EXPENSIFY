package com.expensify.backend.dto;
import com.expensify.backend.enums.UserRole;
import jakarta.validation.constraints.*;

public class RegisterUserRequest {
    @NotBlank(message="Name is required") private String name; 
    @NotBlank(message="Email is required") @Email(message="Invalid email") private String email; 
    @NotBlank(message="Password is required") @Size(min=4, message="Password must have at least 4 characters") private String password; 
    private UserRole role;
    private String city; private String country; private Double latitude; private Double longitude;
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public UserRole getRole(){return role;} public void setRole(UserRole v){role=v;}
    public String getCity(){return city;} public void setCity(String v){city=v;}
    public String getCountry(){return country;} public void setCountry(String v){country=v;}
    public Double getLatitude(){return latitude;} public void setLatitude(Double v){latitude=v;}
    public Double getLongitude(){return longitude;} public void setLongitude(Double v){longitude=v;}
}
