package com.example.WaterManagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidMeterReadingException extends RuntimeException {
    public InvalidMeterReadingException(String message) {
        super(message);
    }
}
