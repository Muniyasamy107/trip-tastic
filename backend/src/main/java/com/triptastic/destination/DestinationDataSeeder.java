package com.triptastic.destination;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DestinationDataSeeder implements ApplicationRunner {
    private final DestinationRepository destinationRepository;

    public DestinationDataSeeder(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<Destination> southIndiaDestinations = List.of(
                new Destination("Madurai", "Tamil Nadu", "South India", "Heritage & food", "Temple bells, jasmine & late-night dosas",
                        "Start before sunrise at the Meenakshi Amman Temple, follow the scent of jasmine through the flower market, and let a local food guide introduce you to Madurai after dark. This is Tamil Nadu with all the volume turned up—in the very best way.",
                        "https://images.unsplash.com/photo-1692173248120-59547c3d4653?auto=format&fit=crop&w=1920&q=90",
                        "2 days", new BigDecimal("9900.00"), "Oct – Mar", new BigDecimal("4.9"), true, "The city-of-stories walk"),
                new Destination("Kodaikanal", "Tamil Nadu", "South India", "Hill escapes", "Pine air & lakeside late starts",
                        "Trade the heat for pine-scented air, quiet lake paths, and mist that rolls in right on cue. We’ll find you a homestay with a view, a local breakfast worth waking up for, and a little extra time to do nothing at all.",
                        "https://images.unsplash.com/photo-1665481193520-86e5eaba1af6?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("18500.00"), "Oct – Mar", new BigDecimal("4.9"), true, "A hill-station exhale"),
                new Destination("Munnar", "Kerala", "South India", "Hill escapes", "Tea trails, cloud-kissed mornings",
                        "Wind through the Western Ghats, walk the tea trails with someone who knows every turn, and watch the first light find the hills. Munnar is for slow sips, fresh air, and putting your phone away for a while.",
                        "https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=1920&h=1143&dpr=1",
                        "4 days", new BigDecimal("23500.00"), "Sep – Mar", new BigDecimal("5.0"), true, "The highland slow-down"),
                new Destination("Ooty & the Nilgiris", "Tamil Nadu", "South India", "Hill escapes", "Take the toy train, lose the timetable",
                        "Take the mountain railway through eucalyptus-scented valleys, stop for homemade chocolate, and wander the quieter edges of the Nilgiris. This is a nostalgic little escape with plenty of room for the unexpected.",
                        "https://images.unsplash.com/photo-1707655315272-33a54a771068?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("16900.00"), "Oct – Jun", new BigDecimal("4.8"), true, "All aboard, slowly"),
                new Destination("Hampi", "Karnataka", "South India", "Heritage & food", "Ancient stones, golden-hour glow",
                        "Cycle between centuries-old temple ruins and sculptural boulder fields, then settle in for sunset beside the Tungabhadra. Hampi rewards early starts, curious questions, and a guide who brings the old city to life.",
                        "https://images.unsplash.com/photo-1596018382916-56d2e341d784?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("21900.00"), "Nov – Feb", new BigDecimal("4.8"), true, "A little history, a lot of wonder"),
                new Destination("Puducherry", "Puducherry", "South India", "Coast & culture", "Pastel lanes & sea-breeze pauses",
                        "Ride a bicycle past bright bougainvillea, Tamil-French doorways, and cafés that invite you to stay another hour. We’ll pair the pretty streets with quieter fishing villages and beaches just beyond them.",
                        "https://images.unsplash.com/photo-1677951221673-09be408d2ddf?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("14900.00"), "Nov – Feb", new BigDecimal("4.8"), true, "The coast at your own pace"),
                new Destination("Alleppey", "Kerala", "South India", "Backwaters", "Backwater mornings, banana-leaf lunches",
                        "Glide past coconut palms and village life on Kerala’s backwaters, with a local lunch cooked fresh along the way. Choose a slow private boat, a small homestay, and a sunset you don’t have to share with a crowd.",
                        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("26900.00"), "Oct – Mar", new BigDecimal("4.9"), true, "Drift a little longer"),
                new Destination("Coorg", "Karnataka", "South India", "Hill escapes", "Coffee country, wake-up-when-you-want mornings",
                        "Stay close to the coffee estates, follow a local trail to a waterfall, and save a slow afternoon for a Kodava kitchen. Coorg is the green, generous reset your calendar forgot to make room for.",
                        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("19800.00"), "Oct – Mar", new BigDecimal("4.8"), false, "Coffee, canopy & quiet"),
                new Destination("Wayanad", "Kerala", "South India", "Wildlife & nature", "Forest paths, waterfall detours",
                        "Wake to birdsong, explore forest-fringed trails with a local naturalist, and find a waterfall that feels a world away. Wayanad is a little wilder, a little slower, and all the better for it.",
                        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("22900.00"), "Oct – May", new BigDecimal("4.8"), false, "Go where the green goes"),
                new Destination("Rameswaram", "Tamil Nadu", "South India", "Coast & culture", "Island roads & the blue edge of India",
                        "Cross the sea bridge, walk the long temple corridors, and leave an afternoon open for the wind and water at Dhanushkodi. Rameswaram is a soulful island escape with a horizon that goes on forever.",
                        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=90",
                        "3 days", new BigDecimal("15900.00"), "Oct – Apr", new BigDecimal("4.8"), false, "Where the road meets the sea")
        );

        Map<String, Destination> existingByName = new HashMap<>();
        destinationRepository.findAll().stream()
                .filter(destination -> "South India".equalsIgnoreCase(destination.getRegion()))
                .forEach(destination -> existingByName.putIfAbsent(destination.getName().toLowerCase(Locale.ROOT), destination));

        List<Destination> missingDestinations = new ArrayList<>();
        List<Destination> metadataUpdates = new ArrayList<>();
        for (Destination destination : southIndiaDestinations) {
            String key = destination.getName().toLowerCase(Locale.ROOT);
            Destination existing = existingByName.get(key);
            if (existing == null) {
                missingDestinations.add(destination);
                existingByName.put(key, destination);
                continue;
            }

            boolean changed = false;
            if (!Objects.equals(existing.getCategory(), destination.getCategory())) {
                existing.setCategory(destination.getCategory());
                changed = true;
            }
            if (!Objects.equals(existing.getCountry(), destination.getCountry())) {
                existing.setCountry(destination.getCountry());
                changed = true;
            }
            if (changed) metadataUpdates.add(existing);
        }

        if (!missingDestinations.isEmpty()) destinationRepository.saveAll(missingDestinations);
        if (!metadataUpdates.isEmpty()) destinationRepository.saveAll(metadataUpdates);
    }
}
