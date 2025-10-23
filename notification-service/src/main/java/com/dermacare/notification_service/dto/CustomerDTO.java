package com.dermacare.notification_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerDTO {
 
	private String customerId;
    private String fullName;
    private String mobileNumber;   
    private String gender;    
    private String deviceId;
    private String emailId;
    private String referCode;   
    private String dateOfBirth;
 
    
    public void trimFields() {
        this.fullName = this.fullName != null ? this.fullName.trim() : null;
        this.gender = this.gender != null ? this.gender.trim() : null;
        this.emailId = this.emailId != null ? this.emailId.trim() : null;

}}
