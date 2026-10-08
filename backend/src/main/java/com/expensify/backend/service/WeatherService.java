package com.expensify.backend.service;

import com.expensify.backend.dto.LocationAlertResponse;
import com.expensify.backend.enums.AlertType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.ArrayList;
import java.util.List;

@Service
public class WeatherService {
    private final RestClient client;
    private final String apiKey;

    public WeatherService(@Value("${weather.api.base-url}") String baseUrl, @Value("${weather.api.key:}") String apiKey) {
        client = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public List<LocationAlertResponse> getAlerts(double latitude, double longitude) {
        List<LocationAlertResponse> result = new ArrayList<>();
        if (apiKey == null || apiKey.isBlank()) return result;

        try {
            String url = "/publicAlerts:lookup?key=" + apiKey
                    + "&location.latitude=" + latitude
                    + "&location.longitude=" + longitude
                    + "&languageCode=en";

            GoogleResponse response = client.get().uri(url).retrieve().body(GoogleResponse.class);

            if (response != null && response.weatherAlerts != null) {
                for (GoogleAlert alert : response.weatherAlerts) {
                    String title = "Weather Alert";
                    if (alert.alertTitle != null && alert.alertTitle.text != null) {
                        title = alert.alertTitle.text;
                    }
                    result.add(new LocationAlertResponse(
                            AlertType.WEATHER, title, alert.description, alert.severity,
                            "Weather API", alert.startTime, alert.endTime));
                }
            }
        } catch (Exception e) {
            // If the external API is unavailable, the rest of EXPENSIFY still works.
        }
        return result;
    }

    public static class GoogleResponse {
        public List<GoogleAlert> weatherAlerts;
    }

    public static class GoogleAlert {
        public String alertId;
        public Text alertTitle;
        public String eventType;
        public String areaName;
        public String description;
        public String severity;
        public String startTime;
        public String endTime;
    }

    public static class Text {
        public String text;
        public String languageCode;
    }
}
