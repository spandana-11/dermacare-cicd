package com.clinicadmin.sevice.impl;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.ProbableDiagnosisDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.ProbableDiagnosis;
import com.clinicadmin.repository.ProbableDiagnosisRepository;
import com.clinicadmin.service.ProbableDiagnosisService;

@Service
public class ProbableDiagnosisServiceImpl implements ProbableDiagnosisService {
	@Autowired
	ProbableDiagnosisRepository probableDiagnosisRepository;
//-----------------------------------------------------Adding Diseases-------------------------------------------------
	@Override
	public Response addDisease(ProbableDiagnosisDTO dto) {
		ProbableDiagnosis ds = new ProbableDiagnosis();
		ds.setDisease(dto.getDisease());
		ds.setHospitalId(dto.getHospitalId());
		ProbableDiagnosis savedDs = probableDiagnosisRepository.save(ds);
		ProbableDiagnosisDTO resDto = new ProbableDiagnosisDTO();
		resDto.setId(savedDs.getId().toString());
		resDto.setDisease(savedDs.getDisease());
		resDto.setHospitalId(savedDs.getHospitalId());
		Response response = new Response();
		response.setSuccess(true);
		response.setData(resDto);
		response.setMessage("Disease added successfully");
		response.setStatus(HttpStatus.OK.value());
		return response;
	}

//----------------------------------------------------Get all Diseases-------------------------------------------------
	@Override
	public Response getAllDiseases() {
		Response response = new Response();
		try {
			List<ProbableDiagnosis> diseases = probableDiagnosisRepository.findAll();
			if (!diseases.isEmpty()) {
				List<ProbableDiagnosisDTO> diseasesDTO = diseases.stream()
						.map(a -> new ProbableDiagnosisDTO(a.getId().toString(), a.getDisease(),a.getHospitalId()))
						.collect(Collectors.toList());

				response.setSuccess(true);
				response.setData(diseasesDTO);
				response.setMessage("Diseases Retrive Successfully");
				response.setStatus(HttpStatus.OK.value());
				return response;
			} else {
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				response.setMessage("No Data Found ");
				response.setStatus(HttpStatus.OK.value());
				return response;
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Exception Occurs while getting Diseases" + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			return response;
		}
	}

//----------------------------------------------------Get Diseases  By Id-------------------------------------------------
	@Override
	public Response getDiseaseById(String id,String hospitalId) {
		Response response = new Response();
		try {

			ObjectId dsId = new ObjectId(id);
			Optional<ProbableDiagnosis> savedDisease = probableDiagnosisRepository.findByIdAndHospitalId(dsId,hospitalId);
			if (savedDisease.isPresent()) {
				ProbableDiagnosis ds = savedDisease.get();
				ProbableDiagnosisDTO resDto = new ProbableDiagnosisDTO();
				resDto.setId(ds.getId().toString());
				resDto.setDisease(ds.getDisease());
				resDto.setHospitalId(ds.getHospitalId());
				response.setSuccess(true);
				response.setData(resDto);
				response.setMessage("Disease Retrive Successfully");
				response.setStatus(HttpStatus.OK.value());
				return response;
			}
			response.setSuccess(true);
			response.setData(Collections.emptyList());
			response.setMessage("Data Not Found with This Id : " + id);
			response.setStatus(HttpStatus.OK.value());
			return response;

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Exception Occurs while getting Disease Using Disease Id" + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			return response;
		}
	}

//----------------------------------------------------Delete Diseases  By Id-------------------------------------------------
	@Override
	public Response deleteDiseaseById(String id,String hospitalId) {
		Response response = new Response();
		try {

			ObjectId dsId = new ObjectId(id);
			Optional<ProbableDiagnosis> savedDisease = probableDiagnosisRepository.findByIdAndHospitalId(dsId,hospitalId);
			if (savedDisease.isPresent()) {
				probableDiagnosisRepository.deleteById(dsId);
				response.setSuccess(true);
				response.setMessage("Disease Retrive Successfully");
				response.setStatus(HttpStatus.OK.value());
				return response;
			}
			response.setSuccess(true);
			response.setMessage("Data Not Found with This Id : " + id);
			response.setStatus(HttpStatus.OK.value());
			return response;

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Exception Occurs while getting Disease Using Disease Id" + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			return response;
		}

	}
//-----------------------Update Disease by DiseaseId-------------------------------------------------
	@Override
	public Response updateDiseaseById(String id, String hospitalId, ProbableDiagnosisDTO dto) {
	    Response response = new Response();
	    try {
	        // Null check for id and hospitalId
	        if (id == null || hospitalId == null || dto == null) {
	            response.setSuccess(false);
	            response.setMessage("Id, HospitalId, and DTO cannot be null");
	            response.setStatus(HttpStatus.BAD_REQUEST.value());
	            return response;
	        }

	        // Fetching the record
	        Optional<ProbableDiagnosis> savedDs = probableDiagnosisRepository.findByIdAndHospitalId(new ObjectId(id), hospitalId);

	        // Check if the record is present
	        if (savedDs.isPresent()) {
	            ProbableDiagnosis upDs = savedDs.get();
	            
	            // Null check for the Disease in DTO
	            if (dto.getDisease() == null || dto.getDisease().isEmpty()) {
	                response.setSuccess(false);
	                response.setMessage("Disease name cannot be null or empty");
	                response.setStatus(HttpStatus.BAD_REQUEST.value());
	                return response;
	            }

	            upDs.setDisease(dto.getDisease());

	            // Save the updated record
	            ProbableDiagnosis savedUpDs = probableDiagnosisRepository.save(upDs);

	            // Mapping the response DTO
	            ProbableDiagnosisDTO upDTO = new ProbableDiagnosisDTO();
	            upDTO.setId(savedUpDs.getId().toString());
	            upDTO.setDisease(savedUpDs.getDisease());
	            upDTO.setHospitalId(savedUpDs.getHospitalId());

	            // Set success response
	            response.setSuccess(true);
	            response.setData(upDTO);
	            response.setMessage("Disease updated successfully");
	            response.setStatus(HttpStatus.OK.value());
	            return response;
	        }

	        // If record is not found
	        response.setSuccess(false);
	        response.setMessage("Data not found with this Id: " + id);
	        response.setStatus(HttpStatus.NOT_FOUND.value());
	        return response;

	    } catch (Exception e) {
	        // Handle exception
	        response.setSuccess(false);
	        response.setMessage("Exception occurred while updating disease: " + e.getMessage());
	        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
	        return response;
	    }
	}


}
