package com.expensify.backend.service;
import com.expensify.backend.dto.LocationAlertResponse; import com.expensify.backend.enums.AlertType; import org.springframework.stereotype.Service; import java.util.*;
@Service
public class PaymentAlertService {
    private final List<LocationAlertResponse> alerts=new ArrayList<>();
    public void add(String title,String message,String severity,String source){alerts.add(new LocationAlertResponse(AlertType.PAYMENT_DISRUPTION,title,message,severity,source,"",""));}
    public List<LocationAlertResponse> getAlerts(){return alerts;}
}
