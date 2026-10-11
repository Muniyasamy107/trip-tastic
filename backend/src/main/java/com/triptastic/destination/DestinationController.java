package com.triptastic.destination;

import java.util.List;

import com.triptastic.shared.ResourceNotFoundException;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {
    private final DestinationRepository destinationRepository;

    public DestinationController(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @GetMapping
    public List<DestinationResponse> findDestinations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        String normalizedRegion = StringUtils.hasText(region) ? region.trim() : null;
        return destinationRepository.search(normalizedSearch, normalizedRegion)
                .stream()
                .map(DestinationResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public DestinationResponse findDestination(@PathVariable Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("We couldn't find that destination."));
        return DestinationResponse.from(destination);
    }
}
