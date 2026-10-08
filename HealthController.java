package com.expensify.backend.controller;
import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestController @RequestMapping("/api/health") public class HealthController { @GetMapping public Map<String,String> health(){return Map.of("status","EXPENSIFY backend is running");} }
