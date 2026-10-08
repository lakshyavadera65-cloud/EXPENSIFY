package com.expensify.backend.service;
import com.expensify.backend.dto.LocationAlertResponse; import com.expensify.backend.model.AppUser; import org.springframework.stereotype.Service; import java.util.*;
@Service
public class LocationAlertService {
    private final WeatherService weather; private final PaymentAlertService payment; private final EmailService email;
    public LocationAlertService(WeatherService weather,PaymentAlertService payment,EmailService email){this.weather=weather;this.payment=payment;this.email=email;}
    public List<LocationAlertResponse> getAlerts(AppUser user){
        List<LocationAlertResponse> result=new ArrayList<>();
        if(user.getLatitude()!=null && user.getLongitude()!=null) result.addAll(weather.getAlerts(user.getLatitude(),user.getLongitude()));
        result.addAll(payment.getAlerts()); return result;
    }
    public void emailAlerts(AppUser user){
        if(!user.isEmailAlertsEnabled()) return; List<LocationAlertResponse> list=getAlerts(user); if(list.isEmpty()) return;
        StringBuilder text=new StringBuilder("EXPENSIFY Alerts\n\n"); for(LocationAlertResponse a:list) text.append(a.getTitle()).append(": ").append(a.getMessage()).append("\n");
        email.send(user.getEmail(),"EXPENSIFY Alert",text.toString());
    }
}
