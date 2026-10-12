package com.triptastic.booking;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingRequest(
        @NotNull(message = "Choose a destination to get started.")
        Long destinationId,

        @NotBlank(message = "Please add your name.")
        @Size(max = 100, message = "Name must be 100 characters or fewer.")
        String name,

        @NotBlank(message = "Please add your email address.")
        @Email(message = "Please use a valid email address.")
        @Size(max = 160, message = "Email must be 160 characters or fewer.")
        String email,

        @NotNull(message = "Choose a departure date.")
        @FutureOrPresent(message = "Departure date cannot be in the past.")
        LocalDate startDate,

        @Min(value = 1, message = "At least one traveller is required.")
        @Max(value = 12, message = "A request can include up to 12 travellers.")
        int travelers,

        @Size(max = 500, message = "Notes must be 500 characters or fewer.")
        String notes) {
}
