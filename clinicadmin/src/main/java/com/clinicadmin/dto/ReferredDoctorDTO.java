package com.clinicadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReferredDoctorDTO {
	
    private String clinicId;
    private String fullName;
    private String gender;
    private Date dateOfBirth;
    private String governmentId;

    private String medicalRegistrationNumber;
    private String specialization;
    private int yearsOfExperience;
    private String currentHospitalName;
    private String department;

    private String mobileNumber;
    private String email;
    private Address address;

//    private Date firstReferralDate;
//    private int totalReferrals;
//    private List<String> referredPatients;
//    private String preferredCommunicationMethod;

    private BankAccountDetails bankAccountNumber;
    private String status;
}