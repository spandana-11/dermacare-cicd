package com.clinicadmin.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clinicadmin.entity.SecurityStaff;

public interface SecurityStaffRepository extends MongoRepository<SecurityStaff, String> {

   
    List<SecurityStaff> findByClinicId(String clinicId);

 
    List<SecurityStaff> findByContactNumber(String contactNumber);
}