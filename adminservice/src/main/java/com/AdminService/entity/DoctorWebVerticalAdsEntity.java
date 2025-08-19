package com.AdminService.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "DoctorWebVerticalAdsEntity")
public class DoctorWebVerticalAdsEntity {
	@Id
	private String adId;
    private String mediaUrlOrImage;
	
}