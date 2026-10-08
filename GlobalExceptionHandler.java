package com.expensify.backend.exception;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*; import org.springframework.validation.FieldError; import org.springframework.web.bind.MethodArgumentNotValidException;
@RestControllerAdvice public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<Map<String,String>> handle(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("error",e.getMessage()));}
    @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<Map<String,Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) errors.put(error.getField(), error.getDefaultMessage());
        return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", errors));
    }
    @ExceptionHandler(RuntimeException.class) public ResponseEntity<Map<String,String>> handleRuntime(RuntimeException e){return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error",e.getMessage()));}
}
