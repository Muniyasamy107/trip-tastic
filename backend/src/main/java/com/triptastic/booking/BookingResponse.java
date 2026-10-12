package com.triptastic.booking;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;

public record BookingResponse(
        Long id,
        String confirmationCode,
        String status,
        String destinationName,
        LocalDate startDate,
        int travelers,
        Instant createdAt) {

    public static BookingResponse from(Booking booking) {
        String code = "TT-" + String.format(Locale.ROOT, "%05d", booking.getId());
        return new BookingResponse(
                booking.getId(),
                code,
                booking.getStatus().name(),
                booking.getDestination().getName(),
                booking.getStartDate(),
                booking.getTravelers(),
                booking.getCreatedAt());
    }
}
