package com.healthcare.repository;

import com.healthcare.entity.AmbulanceLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AmbulanceLocationRepository extends JpaRepository<AmbulanceLocation, UUID> {

    @Query("SELECT al FROM AmbulanceLocation al WHERE al.ambulanceId = :ambulanceId " +
           "ORDER BY al.timestamp DESC")
    List<AmbulanceLocation> findByAmbulanceIdOrderByTimestampDesc(@Param("ambulanceId") UUID ambulanceId);

    @Query("SELECT al FROM AmbulanceLocation al WHERE al.ambulanceId = :ambulanceId " +
           "ORDER BY al.timestamp DESC LIMIT 1")
    Optional<AmbulanceLocation> findLatestByAmbulanceId(@Param("ambulanceId") UUID ambulanceId);

    @Query("SELECT al FROM AmbulanceLocation al WHERE al.ambulanceId = :ambulanceId " +
           "AND al.timestamp >= :since ORDER BY al.timestamp DESC")
    List<AmbulanceLocation> findByAmbulanceIdAndTimestampAfter(@Param("ambulanceId") UUID ambulanceId, 
                                                              @Param("since") LocalDateTime since);

    @Query("SELECT al FROM AmbulanceLocation al WHERE al.ambulanceId IN :ambulanceIds " +
           "AND al.timestamp >= :since ORDER BY al.ambulanceId, al.timestamp DESC")
    List<AmbulanceLocation> findLatestLocationsByAmbulanceIds(@Param("ambulanceIds") List<UUID> ambulanceIds, 
                                                             @Param("since") LocalDateTime since);

    void deleteByAmbulanceIdAndTimestampBefore(UUID ambulanceId, LocalDateTime before);

    @Query("SELECT COUNT(al) FROM AmbulanceLocation al WHERE al.ambulanceId = :ambulanceId")
    long countByAmbulanceId(@Param("ambulanceId") UUID ambulanceId);
}