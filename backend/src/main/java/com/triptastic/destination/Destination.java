package com.triptastic.destination;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "destinations")
public class Destination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 40)
    private String region;

    @Column(nullable = false, length = 150)
    private String tagline;

    @Column(nullable = false, length = 1200)
    private String description;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 40)
    private String duration;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceFrom;

    @Column(nullable = false, length = 40)
    private String bestTime;

    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false, length = 100)
    private String badge;

    protected Destination() {
    }

    public Destination(
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
        this.name = name;
        this.country = country;
        this.region = region;
        this.tagline = tagline;
        this.description = description;
        this.imageUrl = imageUrl;
        this.duration = duration;
        this.priceFrom = priceFrom;
        this.bestTime = bestTime;
        this.rating = rating;
        this.featured = featured;
        this.badge = badge;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    public String getRegion() { return region; }
    public String getTagline() { return tagline; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getDuration() { return duration; }
    public BigDecimal getPriceFrom() { return priceFrom; }
    public String getBestTime() { return bestTime; }
    public BigDecimal getRating() { return rating; }
    public boolean isFeatured() { return featured; }
    public String getBadge() { return badge; }
}
