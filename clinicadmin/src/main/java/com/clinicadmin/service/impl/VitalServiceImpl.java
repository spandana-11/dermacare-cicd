package com.clinicadmin.service.impl;

import java.util.Collections;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.BookingResponse;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.dto.VitalsDTO;
import com.clinicadmin.entity.Vitals;
import com.clinicadmin.feignclient.BookingFeign;
import com.clinicadmin.repository.VitalsRepository;
import com.clinicadmin.service.VitalService;

@Service
public class VitalServiceImpl implements VitalService {

	@Autowired
	VitalsRepository vitalsRepository;
	@Autowired
	BookingFeign bookingFeign;

	@Override
	public Response postVitals(String bookingId, VitalsDTO dto) {
	    Response res = new Response();
	    try {
	        // Check if vitals already exist for this bookingId
	        Optional<Vitals> existingVitals = vitalsRepository.findByBookingId(bookingId);
	        if (existingVitals.isPresent()) {
	            res.setSuccess(false);
//	            res.setData(existingVitals.get());
	            res.setMessage("Vitals already exist for bookingId: " + bookingId);
	            res.setStatus(HttpStatus.CONFLICT.value()); // 409 Conflict
	            return res;
	        }

	        ResponseEntity<ResponseStructure<BookingResponse>> bookingResponse =
	                bookingFeign.getBookedService(bookingId);
	        BookingResponse resbody = bookingResponse.getBody().getData();

	        if (!resbody.getBookingId().equals(bookingId)) {
	            res.setSuccess(false);
	            res.setMessage("Appointment data is not found for this id: " + bookingId);
	            res.setStatus(HttpStatus.OK.value());
	            return res;
	        }

	        // Create new vitals
	        Vitals vital = new Vitals();
	        vital.setPatientId(resbody.getPatientId());
	        vital.setPatientName(resbody.getName());
	        vital.setBloodPressure(dto.getBloodPressure());
	        vital.setHeight(dto.getHeight());
	        vital.setBmi(dto.getBmi());
	        vital.setTemperature(dto.getTemperature());
	        vital.setWeight(dto.getWeight());
	        vital.setBookingId(bookingId);

	        Vitals savedVitals = vitalsRepository.save(vital);

	        // Prepare response DTO
	        VitalsDTO dto1 = new VitalsDTO();
	        dto1.setId(savedVitals.getId().toString());
	        dto1.setPatientId(savedVitals.getPatientId());
	        dto1.setPatientName(savedVitals.getPatientName());
	        dto1.setBloodPressure(savedVitals.getBloodPressure());
	        dto1.setBmi(savedVitals.getBmi());
	        dto1.setHeight(savedVitals.getHeight());
	        dto1.setTemperature(savedVitals.getTemperature());
	        dto1.setWeight(savedVitals.getWeight());
	        dto1.setBookingId(savedVitals.getBookingId());

	        res.setSuccess(true);
	        res.setData(dto1);
	        res.setMessage("Vitals data added successfully");
	        res.setStatus(HttpStatus.OK.value());

	        return res;
	    } catch (Exception e) {
	        res.setSuccess(false);
	        res.setMessage("Exception occurs during adding vitals: " + e.getMessage());
	        res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
	        return res;
	    }
	}

	@Override
	public Response getPatientByBookingIdAndPatientId(String bookingId, String patientId) {
		Response res = new Response();
		try {
			Optional<Vitals> vitals = vitalsRepository.findByBookingIdAndPatientId(bookingId, patientId);
			if (vitals.isPresent()) {
				Vitals savedVitals = vitals.get();
				VitalsDTO dto1 = new VitalsDTO();
				dto1.setId(savedVitals.getId().toString()); // ✅ set id
				dto1.setPatientId(savedVitals.getPatientId()); // ✅ set patientId
				dto1.setPatientName(savedVitals.getPatientName());
				dto1.setBloodPressure(savedVitals.getBloodPressure());
				dto1.setBmi(savedVitals.getBmi());
				dto1.setHeight(savedVitals.getHeight());
				dto1.setTemperature(savedVitals.getTemperature());
				dto1.setWeight(savedVitals.getWeight());
				dto1.setBookingId(savedVitals.getBookingId());

				res.setSuccess(true);
				res.setData(dto1);
				res.setMessage("Vitals data retrieved successfully");
				res.setStatus(HttpStatus.OK.value());

				return res;

			} else {
				res.setSuccess(true);
				res.setData(Collections.emptyList());
				res.setMessage("Vitals data not found ");
				res.setStatus(HttpStatus.OK.value());

				return res;
			}
		} catch (Exception e) {
			res.setSuccess(false);
			res.setMessage("Exception occurs during retrieving vitals: " + e.getMessage());
			res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

			return res;
		}

	}

	@Override
	public Response updateVitals(String bookingId, String patientId, VitalsDTO dto) {
	    Response res = new Response();

	    try {
	        // 🔹 Check for required input values
	        if (bookingId == null || bookingId.trim().isEmpty()) {
	            res.setSuccess(false);
	            res.setMessage("Booking ID cannot be null or empty");
	            res.setStatus(HttpStatus.BAD_REQUEST.value());
	            return res;
	        }

	        if (patientId == null || patientId.trim().isEmpty()) {
	            res.setSuccess(false);
	            res.setMessage("Patient ID cannot be null or empty");
	            res.setStatus(HttpStatus.BAD_REQUEST.value());
	            return res;
	        }

	        if (dto == null) {
	            res.setSuccess(false);
	            res.setMessage("Vitals data cannot be null");
	            res.setStatus(HttpStatus.BAD_REQUEST.value());
	            return res;
	        }

	        // 🔹 Find the existing vitals record
	        Optional<Vitals> vitOpt = vitalsRepository.findByBookingIdAndPatientId(bookingId, patientId);

	        if (vitOpt.isPresent()) {
	            Vitals vital = vitOpt.get();

	       
	            if (dto.getBloodPressure() != null) vital.setBloodPressure(dto.getBloodPressure());
	            if (dto.getBmi() != null)           vital.setBmi(dto.getBmi());
	            if (dto.getHeight() != null)        vital.setHeight(dto.getHeight());
	            if (dto.getPatientName() != null)   vital.setPatientName(dto.getPatientName());
	            if (dto.getTemperature() != null)   vital.setTemperature(dto.getTemperature());
	            if (dto.getWeight() != 0)        vital.setWeight(dto.getWeight());

	            Vitals savedVitals = vitalsRepository.save(vital);

	            // 🔹 Prepare response DTO safely
	            VitalsDTO dtoResp = new VitalsDTO();
	            dtoResp.setId(savedVitals.getId() != null ? savedVitals.getId().toString() : null);
	            dtoResp.setPatientId(savedVitals.getPatientId());
	            dtoResp.setPatientName(savedVitals.getPatientName());
	            dtoResp.setBloodPressure(savedVitals.getBloodPressure());
	            dtoResp.setBmi(savedVitals.getBmi());
	            dtoResp.setHeight(savedVitals.getHeight());
	            dtoResp.setTemperature(savedVitals.getTemperature());
	            dtoResp.setWeight(savedVitals.getWeight());
	            dtoResp.setBookingId(savedVitals.getBookingId());

	            res.setSuccess(true);
	            res.setData(dtoResp);
	            res.setMessage("Vitals updated successfully");
	            res.setStatus(HttpStatus.OK.value());
	        } else {
	            res.setSuccess(true);
	            res.setData(Collections.emptyList());
	            res.setMessage("Vitals data not found");
	            res.setStatus(HttpStatus.OK.value());
	        }

	    } catch (Exception e) {
	        res.setSuccess(false);
	        res.setMessage("Exception occurred while updating data: " + e.getMessage());
	        res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
	    }

	    return res;
	}


	@Override
	public Response deleteVitals(String bookingId, String patientId) {
		Response resp = new Response();
		try {
			Optional<Vitals> vit = vitalsRepository.findByBookingIdAndPatientId(bookingId, patientId);
			if (vit.isPresent()) {
				vitalsRepository.deleteByBookingIdAndPatientId(bookingId, patientId);
				resp.setSuccess(true);
				resp.setMessage("Vitals Deleted");
				resp.setStatus(HttpStatus.OK.value());
				return resp;
			} else {
				resp.setSuccess(true);
				resp.setData(Collections.emptyList());
				resp.setMessage("Vitals Data not found ");
				resp.setStatus(HttpStatus.OK.value());
				return resp;
			}

		} catch (Exception e) {
			resp.setSuccess(false);
			resp.setMessage("Exception occured during updating data " + e.getMessage());
			resp.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

			return resp;
		}

	}

}