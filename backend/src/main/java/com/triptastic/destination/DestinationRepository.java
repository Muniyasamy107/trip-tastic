package com.triptastic.destination;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    @Query("""
            select d from Destination d
            where (:search is null
                or lower(d.name) like lower(concat('%', :search, '%'))
                or lower(d.country) like lower(concat('%', :search, '%'))
                or lower(d.region) like lower(concat('%', :search, '%'))
                or lower(d.tagline) like lower(concat('%', :search, '%')))
              and (:region is null or lower(d.region) = lower(:region))
            order by case when lower(d.region) = 'south india' then 0 else 1 end, d.id
            """)
    List<Destination> search(@Param("search") String search, @Param("region") String region);
}
