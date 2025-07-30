package com.AdminService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.AdminService.entity.IdCounter;

public interface IdCounterRepository extends MongoRepository<IdCounter,String>{
}