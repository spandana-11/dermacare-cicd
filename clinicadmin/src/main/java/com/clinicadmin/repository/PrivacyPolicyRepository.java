package com.clinicadmin.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clinicadmin.entity.PrivacyPolicy;

public interface  PrivacyPolicyRepository extends MongoRepository<PrivacyPolicy,String>{

}