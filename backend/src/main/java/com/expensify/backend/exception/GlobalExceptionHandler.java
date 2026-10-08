package com.expensify.backend.exception;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestControllerAdvice public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<Map<String,String>> handle(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("error",e.getMessage()));}
    @ExceptionHandler(SecurityException.class) public ResponseEntity<Map<String,String>> handleSecurity(SecurityException e){return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error",e.getMessage()));}
}
