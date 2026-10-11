package com.triptastic.booking;

import com.triptastic.destination.Destination;
import com.triptastic.destination.DestinationRepository;
import com.triptastic.shared.ResourceNotFoundException;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final DestinationRepository destinationRepository;

    public BookingService(BookingRepository bookingRepository, DestinationRepository destinationRepository) {
        this.bookingRepository = bookingRepository;
        this.destinationRepository = destinationRepository;
    }

    @Transactional(readOnly = true)
    public BookingResponse findById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("We couldn't find that booking."));
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        Destination destination = destinationRepository.findById(request.destinationId())
                .orElseThrow(() -> new ResourceNotFoundException("That destination could not be found."));

        Booking booking = new Booking(
                destination,
                request.name().trim(),
                request.email().trim().toLowerCase(Locale.ROOT),
                request.startDate(),
                request.travelers(),
                request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());

        return BookingResponse.from(bookingRepository.save(booking));
    }
}
