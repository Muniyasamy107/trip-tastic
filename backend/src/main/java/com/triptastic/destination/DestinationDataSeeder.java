package com.triptastic.destination;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

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
        List<Destination> starterDestinations = List.of(
                new Destination(
                        "Madurai", "Tamil Nadu, India", "South India", "Temple bells, jasmine & late-night dosas",
                        "Start before sunrise at the Meenakshi Amman Temple, follow the scent of fresh jasmine through the flower market, and let a local food guide introduce you to Madurai after dark. This is Tamil Nadu with all the volume turned up—in the very best way.",
                        "https://images.unsplash.com/photo-1692173248120-59547c3d4653?auto=format&fit=crop&w=1200&q=85",
                        "2 days", new BigDecimal("9900.00"), "Oct – Mar", new BigDecimal("4.9"), true, "The city-of-stories walk"),
                new Destination(
                        "Kodaikanal", "Tamil Nadu, India", "South India", "Pine air & lakeside late starts",
                        "Trade the heat for pine-scented air, quiet lake paths, and mist that rolls in right on cue. We’ll find you a homestay with a view, a local breakfast worth waking up for, and a little extra time to do nothing at all.",
                        "https://images.unsplash.com/photo-1665481193520-86e5eaba1af6?auto=format&fit=crop&w=1200&q=85",
                        "3 days", new BigDecimal("18500.00"), "Oct – Mar", new BigDecimal("4.9"), true, "A hill-station exhale"),
                new Destination(
                        "Munnar", "Kerala, India", "South India", "Tea trails, cloud-kissed mornings",
                        "Wind through the Western Ghats, walk the tea trails with someone who knows every turn, and watch the first light find the hills. Munnar is for slow sips, fresh air, and putting your phone away for a while.",
                        "https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=1260&h=750&dpr=1",
                        "4 days", new BigDecimal("23500.00"), "Sep – Mar", new BigDecimal("5.0"), true, "The highland slow-down"),
                new Destination(
                        "Ooty & the Nilgiris", "Tamil Nadu, India", "South India", "Take the toy train, lose the timetable",
                        "Take the mountain railway through eucalyptus-scented valleys, stop for homemade chocolate, and wander the quieter edges of the Nilgiris. This is a nostalgic little escape with plenty of room for the unexpected.",
                        "https://images.unsplash.com/photo-1707655315272-33a54a771068?auto=format&fit=crop&w=1200&q=85",
                        "3 days", new BigDecimal("16900.00"), "Oct – Jun", new BigDecimal("4.8"), true, "All aboard, slowly"),
                new Destination(
                        "Hampi", "Karnataka, India", "South India", "Ancient stones, golden-hour glow",
                        "Cycle between centuries-old temple ruins and sculptural boulder fields, then settle in for sunset beside the Tungabhadra. Hampi rewards early starts, curious questions, and a guide who brings the old city to life.",
                        "https://images.unsplash.com/photo-1596018382916-56d2e341d784?auto=format&fit=crop&w=1200&q=85",
                        "3 days", new BigDecimal("21900.00"), "Nov – Feb", new BigDecimal("4.8"), false, "A little history, a lot of wonder"),
                new Destination(
                        "Puducherry", "Tamil Nadu, India", "South India", "Pastel lanes & sea-breeze pauses",
                        "Ride a bicycle past bright bougainvillea, French-Tamil doorways, and cafés that invite you to stay another hour. We’ll pair the pretty streets with the quieter fishing villages and beaches just beyond them.",
                        "https://images.unsplash.com/photo-1677951221673-09be408d2ddf?auto=format&fit=crop&w=1200&q=85",
                        "3 days", new BigDecimal("14900.00"), "Nov – Feb", new BigDecimal("4.8"), false, "The coast at your own pace"),
                new Destination(
                        "Alleppey", "Kerala, India", "South India", "Backwater mornings, banana-leaf lunches",
                        "Glide past coconut palms and village life on Kerala’s backwaters, with a local lunch cooked fresh along the way. Choose a slow private boat, a small homestay, and a sunset you don’t have to share with a crowd.",
                        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",
                        "3 days", new BigDecimal("26900.00"), "Oct – Mar", new BigDecimal("4.9"), false, "Drift a little longer"),
                new Destination(
                        "Ubud, Bali", "Indonesia", "Asia", "Slow mornings, wild coastlines",
                        "Wake up to the sound of the jungle, wander through rice terraces, and end the day somewhere barefoot by the sea. Bali is an invitation to take things at your own pace.",
                        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
                        "7 days", new BigDecimal("74000.00"), "Apr – Oct", new BigDecimal("4.9"), true, "The slow-down special"),
                new Destination(
                        "Dolomites", "Italy", "Europe", "A little altitude, a lot of awe",
                        "Trade the usual itinerary for mountain air, quiet alpine lakes, and trails that lead to long lunches. The Dolomites are best taken one beautiful view at a time.",
                        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
                        "6 days", new BigDecimal("103000.00"), "Jun – Sep", new BigDecimal("4.8"), true, "For the big-view people"),
                new Destination(
                        "Kyoto", "Japan", "Asia", "Old streets, new favourite rituals",
                        "Find your way through lantern-lit lanes, early-morning temple gardens, and tiny tea houses. Kyoto rewards curiosity—and a willingness to get happily lost.",
                        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
                        "5 days", new BigDecimal("90500.00"), "Mar – May", new BigDecimal("4.9"), true, "A softer side of Japan"),
                new Destination(
                        "Lisbon", "Portugal", "Europe", "Golden hour, on repeat",
                        "A city made for wandering: tiled alleyways, little neighbourhood bakeries, ocean air, and one more pastel de nata than you planned. Come for a weekend; stay for the feeling.",
                        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=85",
                        "4 days", new BigDecimal("63000.00"), "Apr – Jun", new BigDecimal("4.7"), false, "The long-weekend classic"),
                new Destination(
                        "Marrakech", "Morocco", "Africa", "Follow the colour and the spice",
                        "Step into the rhythm of the medina, find shade in a tiled courtyard, then watch the desert sky turn pink. Marrakech is a sensory story you will keep telling.",
                        "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=85",
                        "5 days", new BigDecimal("68000.00"), "Mar – May", new BigDecimal("4.8"), false, "Colour outside the lines"),
                new Destination(
                        "Patagonia", "Argentina & Chile", "Americas", "Big skies, tiny humans",
                        "For when you need a reminder that the world is wonderfully wide. Hike beneath jagged peaks, share a thermos on the trail, and let the horizon do its thing.",
                        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
                        "9 days", new BigDecimal("149000.00"), "Nov – Mar", new BigDecimal("5.0"), false, "Worth the long way round")
        );

        Set<String> savedNames = new HashSet<>();
        destinationRepository.findAll().forEach(destination -> savedNames.add(destination.getName().toLowerCase(Locale.ROOT)));
        List<Destination> missingDestinations = starterDestinations.stream()
                .filter(destination -> savedNames.add(destination.getName().toLowerCase(Locale.ROOT)))
                .toList();
        if (!missingDestinations.isEmpty()) destinationRepository.saveAll(missingDestinations);
    }
}
