package com.triptastic.destination;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    @Query("""
            select d from Destination d
            where lower(d.region) = 'south india'
              and (:search is null
                or lower(d.name) like lower(concat('%', :search, '%'))
                or lower(d.country) like lower(concat('%', :search, '%'))
                or lower(d.region) like lower(concat('%', :search, '%'))
                or lower(coalesce(d.category, '')) like lower(concat('%', :search, '%'))
                or lower(d.tagline) like lower(concat('%', :search, '%')))
              and (:region is null or lower(d.region) = lower(:region))
            order by d.id
            """)
    List<Destination> search(@Param("search") String search, @Param("region") String region);
}
