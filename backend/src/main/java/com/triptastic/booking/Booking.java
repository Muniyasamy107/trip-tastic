package com.triptastic.booking;

import java.time.Instant;
import java.time.LocalDate;

import com.triptastic.destination.Destination;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private int travelers;

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Booking() {
    }

    public Booking(Destination destination, String name, String email, LocalDate startDate, int travelers, String notes) {
        this.destination = destination;
        this.name = name;
        this.email = email;
        this.startDate = startDate;
        this.travelers = travelers;
        this.notes = notes;
        this.status = BookingStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public Destination getDestination() { return destination; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public LocalDate getStartDate() { return startDate; }
    public int getTravelers() { return travelers; }
    public String getNotes() { return notes; }
    public BookingStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
