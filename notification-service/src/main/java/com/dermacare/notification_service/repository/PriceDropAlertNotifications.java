package com.dermacare.notification_service.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.dermacare.notification_service.entity.PriceDropAlertEntity;

public interface PriceDropAlertNotifications extends MongoRepository<PriceDropAlertEntity, String> {

	PriceDropAlertEntity findByClinicIdAndBranchId(String cid,String bid);
	
}
