package com.dermacare.bookingService.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RelationInfoDTO {
	
	private String relation;
	private String fullname;
	private String mobileNumber;
	private String age;
	private String address;
	private String gender;

}
