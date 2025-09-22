package com.clinicadmin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clinicadmin.entity.WardBoy;

@Repository
public interface WardBoyRepository extends MongoRepository<WardBoy, String> {

	Optional<WardBoy> findByContactNumber(String contactNumber);

//	Optional<WardBoy> findByUsername(String contactNumber);

	
	List<WardBoy> findAllByClinicId(String clinicId);

	Optional<WardBoy> findByWardBoyIdAndClinicId(String wardBoyId, String clinicId);

}