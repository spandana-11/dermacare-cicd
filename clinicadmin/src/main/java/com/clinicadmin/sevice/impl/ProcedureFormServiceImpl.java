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

import com.clinicadmin.dto.ProcedureFormDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.dto.SubServicesDto;
import com.clinicadmin.entity.ProcedureForm;
import com.clinicadmin.feignclient.ServiceFeignClient;
import com.clinicadmin.repository.ProcedureFormRepository;
import com.clinicadmin.service.ProcedureFormService;

@Service
public class ProcedureFormServiceImpl implements ProcedureFormService {

    @Autowired
    private ProcedureFormRepository procedureFormRepository;

    @Autowired
    private ServiceFeignClient serviceFeignClient;

    @Override
    public Response addProcedureForm(String hospitalId, String subServiceId, ProcedureFormDTO dto) {
        Response response = new Response();
        try {
            ResponseEntity<ResponseStructure<SubServicesDto>> res = serviceFeignClient.getSubServiceByServiceId(hospitalId, subServiceId);
            ResponseStructure<SubServicesDto> subService = res.getBody();
            SubServicesDto subDTO = subService.getData();

            ProcedureForm form = new ProcedureForm();
            form.setHospitalId(hospitalId);
            form.setCategoryId(subDTO.getCategoryId());
            form.setCategoryName(subDTO.getCategoryName());
            form.setServiceId(subDTO.getServiceId());
            form.setServiceName(subDTO.getServiceName());
            form.setSubServiceId(subServiceId);
            form.setSubServiceName(subDTO.getSubServiceName());
            form.setProcedureName(dto.getProcedureName());
            form.setTotalDuration(dto.getTotalDuration());
            form.setDescription(dto.getDescription());

            ProcedureForm saved = procedureFormRepository.save(form);

            ProcedureFormDTO savedDto = new ProcedureFormDTO();
            savedDto.setId(saved.getId().toString());
            savedDto.setHospitalId(saved.getHospitalId());
            savedDto.setCategoryId(saved.getCategoryId());
            savedDto.setCategoryName(saved.getCategoryName());
            savedDto.setServiceId(saved.getServiceId());
            savedDto.setServiceName(saved.getServiceName());
            savedDto.setSubServiceId(saved.getSubServiceId());
            savedDto.setSubServiceName(saved.getSubServiceName());
            savedDto.setProcedureName(saved.getProcedureName());
            savedDto.setTotalDuration(saved.getTotalDuration());
            savedDto.setDescription(saved.getDescription());

            response.setSuccess(true);
            response.setData(savedDto);
            response.setMessage("Procedure added successfully");
            response.setStatus(HttpStatus.OK.value());

            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Exception occurred while adding procedure: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    @Override
    public Response getProcedureById(String hospitalId, String procedureId) {
        Response response = new Response();
        try {
            Optional<ProcedureForm> formOpt = procedureFormRepository.findByHospitalIdAndId(hospitalId, new ObjectId(procedureId));
            if (formOpt.isPresent()) {
                ProcedureForm form = formOpt.get();
                ProcedureFormDTO dto = new ProcedureFormDTO(
                        form.getId().toString(), form.getHospitalId(), form.getSubServiceId(), form.getSubServiceName(),
                        form.getServiceId(), form.getServiceName(), form.getCategoryId(), form.getCategoryName(),
                        form.getProcedureName(), form.getTotalDuration(), form.getDescription()
                );
                response.setSuccess(true);
                response.setData(dto);
                response.setMessage("Procedure retrieved successfully");
                response.setStatus(HttpStatus.OK.value());
            } else {
                response.setSuccess(true);
                response.setData(Collections.emptyList());
                response.setMessage("No procedure found for ID: " + procedureId);
                response.setStatus(HttpStatus.OK.value());
            }
            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Exception occurred while retrieving procedure: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    @Override
    public Response getAllProcedureForms() {
        Response response = new Response();
        try {
            List<ProcedureForm> list = procedureFormRepository.findAll();
            if (!list.isEmpty()) {
                List<ProcedureFormDTO> dtoList = list.stream().map(form -> new ProcedureFormDTO(
                        form.getId().toString(), form.getHospitalId(), form.getSubServiceId(), form.getSubServiceName(),
                        form.getServiceId(), form.getServiceName(), form.getCategoryId(), form.getCategoryName(),
                        form.getProcedureName(), form.getTotalDuration(), form.getDescription()
                )).collect(Collectors.toList());

                response.setSuccess(true);
                response.setData(dtoList);
                response.setMessage("All procedures retrieved successfully");
                response.setStatus(HttpStatus.OK.value());
            } else {
                response.setSuccess(true);
                response.setData(Collections.emptyList());
                response.setMessage("No procedure data found");
                response.setStatus(HttpStatus.OK.value());
            }
            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Exception occurred while getting procedures: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    @Override
    public Response updateProcedureForm(String hospitalId, String procedureId, ProcedureFormDTO dto) {
        Response response = new Response();
        try {
            Optional<ProcedureForm> optional = procedureFormRepository.findByHospitalIdAndId(hospitalId, new ObjectId(procedureId));
            if (!optional.isPresent()) {
                response.setSuccess(false);
                response.setMessage("Procedure not found for ID: " + procedureId);
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            ProcedureForm form = optional.get();
            if (dto.getProcedureName() != null)
                form.setProcedureName(dto.getProcedureName());
            if (dto.getTotalDuration() != null)
                form.setTotalDuration(dto.getTotalDuration());
            if (dto.getDescription() != null)
                form.setDescription(dto.getDescription());

            ProcedureForm updated = procedureFormRepository.save(form);

            ProcedureFormDTO updatedDto = new ProcedureFormDTO(
                    updated.getId().toString(), updated.getHospitalId(), updated.getSubServiceId(), updated.getSubServiceName(),
                    updated.getServiceId(), updated.getServiceName(), updated.getCategoryId(), updated.getCategoryName(),
                    updated.getProcedureName(), updated.getTotalDuration(), updated.getDescription()
            );

            response.setSuccess(true);
            response.setData(updatedDto);
            response.setMessage("Procedure updated successfully");
            response.setStatus(HttpStatus.OK.value());
            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Exception occurred while updating procedure: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    @Override
    public Response deleteProcedureForm(String hospitalId, String procedureId) {
        Response response = new Response();
        try {
            Optional<ProcedureForm> optional = procedureFormRepository.findByHospitalIdAndId(hospitalId, new ObjectId(procedureId));
            if (!optional.isPresent()) {
                response.setSuccess(false);
                response.setMessage("Procedure not found for ID: " + procedureId);
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            procedureFormRepository.deleteById(optional.get().getId());
            response.setSuccess(true);
            response.setMessage("Procedure deleted successfully");
            response.setStatus(HttpStatus.OK.value());
            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Exception occurred while deleting procedure: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }
}
