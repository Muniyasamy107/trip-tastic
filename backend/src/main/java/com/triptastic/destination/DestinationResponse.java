package com.triptastic.destination;

import java.math.BigDecimal;

public record DestinationResponse(
        Long id,
        String name,
        String country,
        String region,
        String tagline,
        String description,
        String imageUrl,
        String duration,
        BigDecimal priceFrom,
        String bestTime,
        BigDecimal rating,
        boolean featured,
        String badge) {

    public static DestinationResponse from(Destination destination) {
        return new DestinationResponse(
                destination.getId(),
                destination.getName(),
                destination.getCountry(),
                destination.getRegion(),
                destination.getTagline(),
                destination.getDescription(),
                destination.getImageUrl(),
                destination.getDuration(),
                destination.getPriceFrom(),
                destination.getBestTime(),
                destination.getRating(),
                destination.isFeatured(),
                destination.getBadge());
    }
}
