package com.clinicadmin.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clinicadmin.entity.Doctors;

public interface DoctorsRepository extends MongoRepository<Doctors, ObjectId> {
	boolean existsByDoctorMobileNumber(String mobileNumber);

	public Optional<Doctors> findByDoctorId(String doctorId);

	public List<Doctors> findByHospitalId(String hospitalId);

	@Query("{ 'subServices.subServiceId': ?0 }")
	List<Doctors> findBySubServiceById(String subServiceId);

	List<Doctors> findByHospitalIdAndSubServicesSubServiceId(String hospitalId, String subServiceId);

	Optional<Doctors> findByHospitalIdAndDoctorId(String clinicId, String doctorId);
}