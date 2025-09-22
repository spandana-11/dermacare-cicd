package com.clinicadmin.sevice.impl;


import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.ReferredDoctorDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.ReferredDoctor;
import com.clinicadmin.repository.ReferredDoctorRepository;
import com.clinicadmin.service.ReferredDoctorService;
import com.clinicadmin.utils.ReferredDoctorMapper;

@Service
public class ReferredDoctorServiceImpl implements ReferredDoctorService {

    @Autowired
    private ReferredDoctorRepository repository;
    
    @Override
    public Response addReferralDoctor(ReferredDoctorDTO dto) {
        try {
       
            if (repository.existsByMobileNumber(dto.getMobileNumber())) {
                return Response.builder()
                        .success(false)
                        .message("Doctor with this mobile number already exists")
                        .status(HttpStatus.BAD_REQUEST.value())
                        .build();
            }

     
            ReferredDoctor doctor = ReferredDoctorMapper.dtoToEntity(dto);

          
            String last4Mobile = doctor.getMobileNumber().length() >= 4
                    ? doctor.getMobileNumber().substring(doctor.getMobileNumber().length() - 4)
                    : doctor.getMobileNumber();

         
            String cleanName = doctor.getFullName().replaceAll("\\s+", "").replace(".", "");

         
            if (cleanName.toLowerCase().startsWith("dr")) {
                cleanName = cleanName.substring(2);
            }

            
            String referralId = "DR-" + cleanName + last4Mobile;

            // Ensure uniqueness by appending counter if needed
            String baseReferralId = referralId;
            int counter = 1;
            while (repository.existsByReferralId(referralId)) {
                referralId = baseReferralId + counter;
                counter++;
            }

            doctor.setReferralId(referralId);
            doctor.setFirstReferralDate(new Date());
            doctor.setTotalReferrals(0);

            doctor.setStatus(dto.getStatus() != null ? dto.getStatus() : "Active");

            ReferredDoctor saved = repository.save(doctor);

            return Response.builder()
                    .success(true)
                    .data(saved)
                    .message("Doctor added successfully")
                    .status(HttpStatus.CREATED.value())
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .message("Failed to add doctor: " + e.getMessage())
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .build();
        }
    }

    @Override
    public Response getDoctorByReferralId(String referralId) {
        try {
            ReferredDoctor doctor = repository.findByReferralId(referralId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with referralId: " + referralId));

            return Response.builder()
                    .success(true)
                    .data(doctor)
                    .message("Doctor fetched successfully")
                    .status(HttpStatus.OK.value())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .message("Doctor not found: " + e.getMessage())
                    .status(HttpStatus.NOT_FOUND.value())
                    .build();
        }
    }

    @Override
    public Response getReferralDoctorrById(String id) {
        try {
            ReferredDoctor doctor = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

            return Response.builder()
                    .success(true)
                    .data(doctor)
                    .message("Doctor fetched successfully")
                    .status(HttpStatus.OK.value())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .message("Doctor not found: " + e.getMessage())
                    .status(HttpStatus.NOT_FOUND.value())
                    .build();
        }
    }

    @Override
    public Response updateReferralDoctorById(String id, ReferredDoctorDTO dto) {
        try {
            ReferredDoctor doctor = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

          
            if (dto.getFullName() != null) doctor.setFullName(dto.getFullName());
            if (dto.getGender() != null) doctor.setGender(dto.getGender());
            if (dto.getDateOfBirth() != null) doctor.setDateOfBirth(dto.getDateOfBirth());
            if (dto.getGovernmentId() != null) doctor.setGovernmentId(dto.getGovernmentId());
            if (dto.getMedicalRegistrationNumber() != null)
                doctor.setMedicalRegistrationNumber(dto.getMedicalRegistrationNumber());
            if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
            if (dto.getYearsOfExperience() != 0) doctor.setYearsOfExperience(dto.getYearsOfExperience());
            if (dto.getCurrentHospitalName() != null) doctor.setCurrentHospitalName(dto.getCurrentHospitalName());
            if (dto.getDepartment() != null) doctor.setDepartment(dto.getDepartment());
            if (dto.getMobileNumber() != null) doctor.setMobileNumber(dto.getMobileNumber());
            if (dto.getEmail() != null) doctor.setEmail(dto.getEmail());
            if (dto.getAddress() != null) doctor.setAddress(dto.getAddress());
            if (dto.getPreferredCommunicationMethod() != null)
                doctor.setPreferredCommunicationMethod(dto.getPreferredCommunicationMethod());
            if (dto.getBankAccountNumber() != null) doctor.setBankAccountNumber(dto.getBankAccountNumber());

     
            doctor.setStatus(dto.getStatus() != null ? dto.getStatus() : doctor.getStatus() != null ? doctor.getStatus() : "Active");

          
            ReferredDoctor saved = repository.save(doctor);

            return Response.builder()
                    .success(true)
                    .data(saved)
                    .message("Doctor updated successfully")
                    .status(HttpStatus.OK.value())
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .message("Failed to update doctor: " + e.getMessage())
                    .status(HttpStatus.NOT_FOUND.value())
                    .build();
        }
    }


    @Override
    public Response deleteReferralDoctoById(String id) {
        try {
            ReferredDoctor doctor = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

            repository.delete(doctor);

            return Response.builder()
                    .success(true)
                    .message("Doctor deleted successfully")
                    .status(HttpStatus.OK.value())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .message("Failed to delete doctor: " + e.getMessage())
                    .status(HttpStatus.NOT_FOUND.value())
                    .build();
        }
    }

@Override
    public Response getAllReferralDoctor() {
        try {
            List<ReferredDoctor> doctors = repository.findAll();
            return Response.builder()
                    .success(true)
                    .data(doctors)
                    .message("Doctors fetched successfully")
                    .status(HttpStatus.OK.value())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .message("Failed to fetch doctors: " + e.getMessage())
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .build();
        }
    }
}