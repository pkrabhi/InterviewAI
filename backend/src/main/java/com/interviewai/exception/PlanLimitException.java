package com.interviewai.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a FREE plan user tries to start their 3rd interview.
 * @ResponseStatus maps this to HTTP 402 Payment Required automatically.
 */
@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
public class PlanLimitException extends RuntimeException {

    public PlanLimitException(String message) {
        super(message);
    }
}
