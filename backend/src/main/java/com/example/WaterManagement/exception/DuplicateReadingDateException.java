package com.example.WaterManagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateReadingDateException extends RuntimeException {
    public DuplicateReadingDateException(String message) {
        super(message);
    }
}
