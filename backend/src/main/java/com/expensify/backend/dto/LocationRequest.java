package com.expensify.backend.dto;
import jakarta.validation.constraints.*;
public class LocationRequest {
    @NotNull(message="Latitude is required") private Double latitude; 
    @NotNull(message="Longitude is required") private Double longitude;
    public Double getLatitude(){return latitude;} public void setLatitude(Double v){latitude=v;}
    public Double getLongitude(){return longitude;} public void setLongitude(Double v){longitude=v;}
}
