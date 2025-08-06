package com.clinicadmin.sevice.impl;

import java.util.Collections;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.VitalsDTO;
import com.clinicadmin.entity.Vitals;
import com.clinicadmin.feignclient.DoctorServiceFeign;
import com.clinicadmin.repository.VitalsRepository;
import com.clinicadmin.service.VitalService;
@Service
public class VitalServiceImpl implements VitalService{
	
	@Autowired
	VitalsRepository vitalsRepository;
	@Autowired
	DoctorServiceFeign doctorServiceFeign;
	@Override
	public Response postVitalsById(String patientId, VitalsDTO dto) {
		Response res= new Response();
		try {
		ResponseEntity<?> bookingResponse=doctorServiceFeign.getAppointmentsByPatientId(patientId);
		Object resbody=bookingResponse.getBody();
		if(resbody==null)
		{
			res.setSuccess(false);
			res.setMessage("Appointment data is not found for this id: "+patientId);
			res.setStatus(HttpStatus.NOT_FOUND.value());
		}
		Vitals vital=new Vitals();
		vital.setBloodPressure(dto.getBloodPressure());
		vital.setBmi(dto.getBmi());
		vital.setHeight(dto.getHeight());
		vital.setPatientId(patientId);
		vital.setTemperature(dto.getTemperature());
		vital.setWeight(dto.getWeight());
		Vitals savedVitals=	vitalsRepository.save(vital);
		
		VitalsDTO dto1=new VitalsDTO();
		dto1.setBloodPressure(savedVitals.getBloodPressure());
		dto1.setBmi(savedVitals.getBmi());
		dto1.setHeight(savedVitals.getHeight());
		dto1.setTemperature(savedVitals.getTemperature());
		dto1.setWeight(savedVitals.getWeight());
		
		res.setSuccess(true);
		res.setData(dto1);
		res.setMessage("Vitals data added successfully");
		res.setStatus(HttpStatus.OK.value());
		
		return res;
		}
		catch(Exception e)
		{
			res.setSuccess(false);
			res.setMessage("Exception occurs during adding vitals: "+e.getMessage());
			res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			
			return res;
		}
	}
	
	@Override
	public Response getVitalsByPatientId(String patientId) {
		Response res=new Response();
		try {
		Optional<Vitals> vitals = vitalsRepository.findByPatientId(patientId);
		if(vitals.isPresent())
		{
			Vitals savedVitals=vitals.get();
			VitalsDTO dto1=new VitalsDTO();
			dto1.setBloodPressure(savedVitals.getBloodPressure());
			dto1.setBmi(savedVitals.getBmi());
			dto1.setHeight(savedVitals.getHeight());
			dto1.setTemperature(savedVitals.getTemperature());
			dto1.setWeight(savedVitals.getWeight());
			
			res.setSuccess(true);
			res.setData(dto1);
			res.setMessage("Vitals data retrieved successfully");
			res.setStatus(HttpStatus.OK.value());
			
			return res;
			
		}
		else
		{
			res.setSuccess(false);
			res.setData(Collections.emptyList());
			res.setMessage("Vitals data not found for id: "+patientId);
			res.setStatus(HttpStatus.OK.value());
			
			return res;
		}
		}
		catch(Exception e)
		{
			res.setSuccess(false);
			res.setMessage("Exception occurs during retrieving vitals: "+e.getMessage());
			res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			
			return res;
		}
		
	}

	@Override
	public Response updateVitals(String patientId, VitalsDTO dto) {
		Response res=new Response();
		try {
		Optional<Vitals> vit=vitalsRepository.findByPatientId(patientId);
		if(vit.isPresent())
		{
			Vitals vital=vit.get();
			vital.setBloodPressure(dto.getBloodPressure());
			vital.setBmi(dto.getBmi());
			vital.setHeight(dto.getHeight());
			vital.setPatientId(patientId);
			vital.setTemperature(dto.getTemperature());
			vital.setWeight(dto.getWeight());
			Vitals saved=vitalsRepository.save(vital);
			
			
			VitalsDTO dto1=new VitalsDTO();
			dto1.setBloodPressure(saved.getBloodPressure());
			dto1.setBmi(saved.getBmi());
			dto1.setHeight(saved.getHeight());
			dto1.setTemperature(saved.getTemperature());
			dto1.setWeight(saved.getWeight());
			
			res.setSuccess(true);
			res.setData(dto1);
			res.setMessage("Vitals updated successfully");
			res.setStatus(HttpStatus.OK.value());
			
			return res;
		}
		else
		{
			res.setSuccess(true);
			res.setData(Collections.emptyList());
			res.setMessage("Data not found with the id: "+patientId);
			res.setStatus(HttpStatus.OK.value());
			
			return res;
		}
		}
		catch(Exception e)
		{
			res.setSuccess(false);
			res.setMessage("Exception occured during updating data "+e.getMessage());
			res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			
			return res;
		}
		
	}

	@Override
	public Response deleteVitals(String patiendId) {
		Response resp=new Response();
		resp.setSuccess(true);
		resp.setMessage("Deleted");
		resp.setStatus(HttpStatus.OK.value());
		return resp;
	}

	

}
