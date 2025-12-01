package com.pharmacyManagement.service.impl;

import com.pharmacyManagement.dto.MedicineDto;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Medicine;
import com.pharmacyManagement.repository.MedicineRepository;
import com.pharmacyManagement.service.MedicineService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class MedicineServiceImpl implements MedicineService {
 
	@Autowired
    private  MedicineRepository repository;

    @Override
    public Response saveMedicine(MedicineDto dto) {

        Response response = new Response();

        try {
            if (dto == null) {
                return buildError(response, "Medicine details cannot be null", HttpStatus.BAD_REQUEST);
            }

            if (dto.getMedicineName() == null || dto.getMedicineName().trim().isEmpty()) {
                return buildError(response, "Medicine name is required", HttpStatus.BAD_REQUEST);
            }

            // Duplicate Check
            if (repository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
                return buildError(response, "Medicine already exists: " + dto.getMedicineName(), HttpStatus.CONFLICT);
            }

            Medicine saved = repository.save(mapToEntity(dto));

            response.setSuccess(true);
            response.setMessage("Medicine added successfully");
            response.setData(mapToDto(saved));
            response.setStatus(HttpStatus.CREATED.value());

        } catch (Exception ex) {
            return buildError(response, "Error occurred while saving medicine", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return response;
    }

    @Override
    public Response updateMedicine(String id, MedicineDto dto) {

        Response response = new Response();

        try {
            if (id == null || id.trim().isEmpty()) {
                return buildError(response, "Medicine ID cannot be empty", HttpStatus.BAD_REQUEST);
            }

            Medicine existing = repository.findById(id).orElse(null);

            if (existing == null) {
                return buildError(response, "Medicine not found: " + id, HttpStatus.NOT_FOUND);
            }

            // If user tries to change name, check duplicate
            if (dto.getMedicineName() != null &&
                !dto.getMedicineName().equalsIgnoreCase(existing.getMedicineName())) {
                
                if (repository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
                    return buildError(response, "Medicine already exists: " + dto.getMedicineName(), HttpStatus.CONFLICT);
                }
                existing.setMedicineName(dto.getMedicineName());
            }

            if (dto.getGeneric() != null)
                existing.setGeneric(dto.getGeneric());

            Medicine updated = repository.save(existing);

            response.setSuccess(true);
            response.setMessage("Medicine updated successfully");
            response.setData(mapToDto(updated));
            response.setStatus(HttpStatus.OK.value());

        } catch (Exception ex) {
            return buildError(response, "Error occurred while updating medicine", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return response;
    }

    @Override
    public Response getMedicineById(String id) {

        Response response = new Response();

        try {
            if (id == null || id.trim().isEmpty()) {
                return buildError(response, "Medicine ID cannot be empty", HttpStatus.BAD_REQUEST);
            }

            Medicine medicine = repository.findById(id).orElse(null);

            if (medicine == null) {
                return buildError(response, "Medicine not found: " + id, HttpStatus.NOT_FOUND);
            }

            response.setSuccess(true);
            response.setMessage("Medicine retrieved successfully");
            response.setData(mapToDto(medicine));
            response.setStatus(HttpStatus.OK.value());

        } catch (Exception ex) {
            return buildError(response, "Error occurred while fetching medicine", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return response;
    }

    @Override
    public Response getAllMedicines() {

        Response response = new Response();

        try {
            List<MedicineDto> list = repository.findAll()
                    .stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            response.setSuccess(true);
            response.setMessage("Medicines fetched successfully");
            response.setData(list);
            response.setStatus(HttpStatus.OK.value());

        } catch (Exception ex) {
            return buildError(response, "Error occurred while fetching medicines", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return response;
    }

    @Override
    public Response deleteMedicine(String id) {

        Response response = new Response();

        try {
            if (id == null || id.trim().isEmpty()) {
                return buildError(response, "Medicine ID cannot be empty", HttpStatus.BAD_REQUEST);
            }

            if (!repository.existsById(id)) {
                return buildError(response, "Medicine not found: " + id, HttpStatus.NOT_FOUND);
            }

            repository.deleteById(id);

            response.setSuccess(true);
            response.setMessage("Medicine deleted successfully");
            response.setStatus(HttpStatus.OK.value());

        } catch (Exception ex) {
            return buildError(response, "Error occurred while deleting medicine", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return response;
    }

    // ---------------------- Mapping Methods ------------------------

    private MedicineDto mapToDto(Medicine m) {
        MedicineDto dto = new MedicineDto();
        dto.setId(m.getId());
        dto.setMedicineName(m.getMedicineName());
        dto.setGeneric(m.getGeneric());
        return dto;
    }

    private Medicine mapToEntity(MedicineDto dto) {
        Medicine m = new Medicine();
        m.setId(dto.getId());
        m.setMedicineName(dto.getMedicineName());
        m.setGeneric(dto.getGeneric());
        return m;
    }

    // ---------------------- Error Response Helper ------------------------
    private Response buildError(Response response, String message, HttpStatus status) {
        response.setSuccess(false);
        response.setMessage(message);
        response.setStatus(status.value());
        return response;
    }
}
