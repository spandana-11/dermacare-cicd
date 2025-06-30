package com.clinicadmin.repository;

import com.clinicadmin.entity.DoctorLoginCredentials;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DoctorLoginCredentialsRepository extends MongoRepository<DoctorLoginCredentials, String> {
    Optional<DoctorLoginCredentials> findByUsername(String username);
    boolean existsByUsername(String username);
	Optional<DoctorLoginCredentials> findByDoctorId(String doctorId);
}
