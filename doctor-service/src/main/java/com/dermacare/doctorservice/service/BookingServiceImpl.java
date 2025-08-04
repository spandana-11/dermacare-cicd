package com.dermacare.doctorservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.feignclient.BookingFeignClient;
import com.dermacare.doctorservice.service.BookingService;

import feign.FeignException;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingFeignClient bookingFeignClient;

    @Override
    public final ResponseEntity<?> getAppointmentsByPatientId(String patientId) {
        try {
            return bookingFeignClient.getAppointmentByPatientId(patientId);
        } catch (FeignException ex) {
            return ResponseEntity.status(ex.status()).body(ex.contentUTF8());
        }
    }

    @Override
    public final ResponseEntity<?> searchAppointmentsByInput(String input) {
        try {
            return bookingFeignClient.getAppointsByInput(input);
        } catch (FeignException ex) {
            return ResponseEntity.status(ex.status()).body(ex.contentUTF8());
        }
    }

    @Override
    public final ResponseEntity<?> getTodaysAppointments(String clinicId, String doctorId) {
        try {
            return bookingFeignClient.getTodayDoctorAppointmentsByDoctorId(clinicId, doctorId);
        } catch (FeignException ex) {
            return ResponseEntity.status(ex.status()).body(ex.contentUTF8());
        }
    }

    @Override
    public final ResponseEntity<?> getFilteredAppointments(String clinicId, String doctorId, String number) {
        try {
            return bookingFeignClient.filterDoctorAppointmentsByDoctorId(clinicId, doctorId, number);
        } catch (FeignException ex) {
            return ResponseEntity.status(ex.status()).body(ex.contentUTF8());
        }
    }

    @Override
    public final ResponseEntity<?> getCompletedAppointments(String clinicId, String doctorId) {
        try {
            return bookingFeignClient.filterDoctorAppointmentsByDoctorId(clinicId, doctorId);
        } catch (FeignException ex) {
            return ResponseEntity.status(ex.status()).body(ex.contentUTF8());
        }
    }

    @Override
    public final ResponseEntity<?> getConsultationTypeCounts(String clinicId, String doctorId) {
        try {
            return bookingFeignClient.getSizeOfConsultationTypesByDoctorId(clinicId, doctorId);
        } catch (FeignException ex) {
            return ResponseEntity.status(ex.status()).body(ex.contentUTF8());
        }
    }
}

