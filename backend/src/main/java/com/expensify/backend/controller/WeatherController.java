package com.expensify.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @GetMapping
    public Map<String, Object> getWeather(@RequestParam(defaultValue = "Bengaluru") String city) {
        Map<String, Object> res = new HashMap<>();
        res.put("city", city);
        res.put("temperature", 24);
        res.put("condition", "Partly Cloudy");
        res.put("warning", "Scattered afternoon thunderstorms expected in your area");
        return res;
    }
}
