package com.dermacare.doctorservice.serviceimpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dto.MedicineTypeDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.model.MedicineType;
import com.dermacare.doctorservice.repository.MedicineTypeRepository;
import com.dermacare.doctorservice.service.MedicineTypeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicineTypeServiceImpl implements MedicineTypeService {
@Autowired
    private  MedicineTypeRepository repository;



    @Override
    public Response addMedicineType(MedicineTypeDTO dto) {
        MedicineType entity = repository.findByClinicId(dto.getClinicId())
                .orElseGet(() -> toEntity(dto)); // use inline mapper

        // ✅ Add without duplicates
        for (String type : dto.getMedicineTypes()) {
            if (!entity.getMedicineTypes().contains(type)) {
                entity.getMedicineTypes().add(type);
            }
        }

        MedicineType saved = repository.save(entity);

        return Response.builder()
                .success(true)
                .status(201)
                .message("Medicine types updated successfully")
                .data(toDTO(saved)) // use inline mapper
                .build();
    }

    @Override
    public Response getMedicineTypesByClinicId(String clinicId) {
        MedicineType entity = repository.findByClinicId(clinicId).orElse(null);

        if (entity == null) {
            return Response.builder()
                    .success(false)
                    .status(404)
                    .message("No medicine types found for clinicId: " + clinicId)
                    .data(null)
                    .build();
        }

        return Response.builder()
                .success(true)
                .status(200)
                .message("Fetched medicine types successfully")
                .data(toDTO(entity))
                .build();
    }

    @Override
    public Response searchOrAddMedicineType(MedicineTypeDTO dto) {
 
        MedicineType entity = repository.findByClinicId(dto.getClinicId())
                .orElseGet(() -> {
                    MedicineType newEntity = new MedicineType();
                    newEntity.setClinicId(dto.getClinicId());
                    newEntity.setMedicineTypes(new ArrayList<>());
                    return newEntity;
                });

     
        List<String> added = new ArrayList<>();
        for (String type : dto.getMedicineTypes()) {
            if (!entity.getMedicineTypes().contains(type)) {
                entity.getMedicineTypes().add(type);
                added.add(type);
            }
        }

 
        MedicineType saved = repository.save(entity);


        String msg = added.isEmpty()
                ? "Medicine types already exist for clinic"
                : "New medicine types added: " + added;

        return Response.builder()
                .success(true)
                .status(200)
                .message(msg)
                .data(new MedicineTypeDTO(saved.getClinicId(), saved.getMedicineTypes()))
                .build();
    }

    private MedicineTypeDTO toDTO(MedicineType entity) {
        MedicineTypeDTO dto = new MedicineTypeDTO();
        dto.setClinicId(entity.getClinicId());
        dto.setMedicineTypes(entity.getMedicineTypes());
        return dto;
    }

    // ✅ Convert DTO -> Entity
    private MedicineType toEntity(MedicineTypeDTO dto) {
        MedicineType entity = new MedicineType();
        entity.setClinicId(dto.getClinicId());
        entity.setMedicineTypes(dto.getMedicineTypes() != null ? dto.getMedicineTypes() : new ArrayList<>());
        return entity;
    }
}
