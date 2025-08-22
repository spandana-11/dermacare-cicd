package com.clinicadmin.sevice.impl;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.ProbableDiagnosisDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.ProbableDiagnosis;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.ProbableDiagnosisRepository;
import com.clinicadmin.service.ProbableDiagnosisService;

@Service
public class ProbableDiagnosisServiceImpl implements ProbableDiagnosisService {
	@Autowired
	ProbableDiagnosisRepository probableDiagnosisRepository;
	
	@Autowired
	AdminServiceClient adminServiceClient;
//-----------------------------------------------------Adding Diseases-------------------------------------------------
	@Override
	public Response addDisease(ProbableDiagnosisDTO dto) {
	    Response response = new Response();

	    // Check if hospital exists via admin service
	    ResponseEntity<Response> clinicResponseEntity = adminServiceClient.getClinicById(dto.getHospitalId());
	    Response clinicResponse = clinicResponseEntity.getBody();

	    // Validate the clinic response
	    if (clinicResponse == null || !clinicResponse.isSuccess() || clinicResponse.getData() == null) {
	        response.setSuccess(false);
	        response.setMessage("Hospital with ID " + dto.getHospitalId() + " does not exist.");
	        response.setStatus(HttpStatus.NOT_FOUND.value());
	        return response;
	    }

	    // Proceed to save disease
	    ProbableDiagnosis ds = new ProbableDiagnosis();
	    ds.setDiseaseName(dto.getDiseaseName());
	    ds.setHospitalId(dto.getHospitalId());
	    ds.setProbableSymptoms(dto.getProbableSymptoms());
	    ds.setNotes(dto.getNotes());
	    ProbableDiagnosis savedDs = probableDiagnosisRepository.save(ds);

	    ProbableDiagnosisDTO resDto = new ProbableDiagnosisDTO();
	    resDto.setId(savedDs.getId().toString());
	    resDto.setDiseaseName(savedDs.getDiseaseName());
	    resDto.setProbableSymptoms(savedDs.getProbableSymptoms());
	    resDto.setNotes(savedDs.getNotes());
	    resDto.setHospitalId(savedDs.getHospitalId());

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
						.map(a -> new ProbableDiagnosisDTO(a.getId().toString(), a.getDiseaseName(),a.getHospitalId(),a.getProbableSymptoms(),a.getNotes()))
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
				resDto.setDiseaseName(ds.getDiseaseName());
				resDto.setProbableSymptoms(ds.getProbableSymptoms());
				resDto.setNotes(ds.getNotes());
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
	            if (dto.getDiseaseName() == null || dto.getDiseaseName().isEmpty()) {
	                response.setSuccess(false);
	                response.setMessage("Disease name cannot be null or empty");
	                response.setStatus(HttpStatus.BAD_REQUEST.value());
	                return response;
	            }

	            upDs.setDiseaseName(dto.getDiseaseName());
	            upDs.setProbableSymptoms(dto.getProbableSymptoms());
	            upDs.setNotes(dto.getNotes());

	            // Save the updated record
	            ProbableDiagnosis savedUpDs = probableDiagnosisRepository.save(upDs);

	            // Mapping the response DTO
	            ProbableDiagnosisDTO upDTO = new ProbableDiagnosisDTO();
	            upDTO.setId(savedUpDs.getId().toString());
	            upDTO.setDiseaseName(savedUpDs.getDiseaseName());
	            upDTO.setProbableSymptoms(savedUpDs.getProbableSymptoms());
	            upDTO.setNotes(savedUpDs.getNotes());
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

	//----------------------------------------------------Get all Diseases by HospitalId-------------------------------------------------
	@Override
	public Response getAllDiseasesByHospitalId(String hospitalId) {
	    Response response = new Response();
	    try {
	        List<ProbableDiagnosis> diseases = probableDiagnosisRepository.findByHospitalId(hospitalId);
	        if (!diseases.isEmpty()) {
	            List<ProbableDiagnosisDTO> diseasesDTO = diseases.stream()
	                    .map(a -> new ProbableDiagnosisDTO(a.getId().toString(), a.getDiseaseName(), a.getHospitalId(),a.getProbableSymptoms(),a.getNotes()))
	                    .collect(Collectors.toList());

	            response.setSuccess(true);
	            response.setData(diseasesDTO);
	            response.setMessage("Diseases retrieved successfully for hospitalId: " + hospitalId);
	            response.setStatus(HttpStatus.OK.value());
	            return response;
	        } else {
	            response.setSuccess(true);
	            response.setData(Collections.emptyList());
	            response.setMessage("No diseases found for hospitalId: " + hospitalId);
	            response.setStatus(HttpStatus.OK.value());
	            return response;
	        }
	    } catch (Exception e) {
	        response.setSuccess(false);
	        response.setMessage("Exception occurred while getting diseases by hospitalId: " + e.getMessage());
	        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
	        return response;
	    }
	}

}
