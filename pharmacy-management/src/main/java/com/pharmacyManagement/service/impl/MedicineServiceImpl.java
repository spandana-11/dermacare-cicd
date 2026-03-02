package com.pharmacyManagement.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.MedicineDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Medicine;
import com.pharmacyManagement.repository.MedicineRepository;
import com.pharmacyManagement.service.MedicineService;
import com.pharmacyManagement.util.MedicineMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository repository;

    // 1️⃣ ADD MEDICINE
    @Override
    public Response addMedicine(MedicineDTO dto) {

        Medicine medicine = MedicineMapper.toEntity(dto);

        medicine.setBarcode(generateBarcode(dto.getHsnCode()));
        medicine.setCreatedAt(LocalDateTime.now());

        Medicine saved = repository.save(medicine);

        return Response.builder()
                .success(true)
                .message("Medicine created successfully")
                .status(201)
                .data(MedicineMapper.toDTO(saved))
                .build();
    }

    @Override
    public Response updateMedicine(String id, MedicineDTO dto) {

        Medicine existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        // Update only editable fields
        existing.setProductName(dto.getProductName());
        existing.setBrandName(dto.getBrandName());
        existing.setCategory(dto.getCategory());
        existing.setComposition(dto.getComposition());
        existing.setManufacturer(dto.getManufacturer());
        existing.setPackSize(dto.getPackSize());
        existing.setHsnCode(dto.getHsnCode());
        existing.setGstPercent(dto.getGstPercent());
        existing.setMrp(dto.getMrp());
        existing.setMinStock(dto.getMinStock());
        existing.setStatus(dto.getStatus());
        existing.setClinicId(dto.getClinicId());
        existing.setBranchId(dto.getBranchId());


        Medicine saved = repository.save(existing);

        return Response.builder()
                .success(true)
                .message("Medicine updated successfully")
                .status(200)
                .data(MedicineMapper.toDTO(saved)) // DTO mapping only for response
                .build();
    }

    // 3️⃣ GET ALL
    @Override
    public Response getAllMedicines() {

        List<MedicineDTO> list = repository.findAll()
                .stream()
                .map(MedicineMapper::toDTO)
                .toList();

        return Response.builder()
                .success(true)
                .message("All medicines fetched")
                .status(200)
                .data(list)
                .build();
    }

    // 4️⃣ GET BY ID
    @Override
    public Response getMedicineById(String id) {

        Medicine medicine = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        return Response.builder()
                .success(true)
                .message("Medicine fetched successfully")
                .status(200)
                .data(MedicineMapper.toDTO(medicine))
                .build();
    }

    // 5️⃣ DELETE
    @Override
    public Response deleteMedicine(String id) {

        repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        repository.deleteById(id);

        return Response.builder()
                .success(true)
                .message("Medicine deleted successfully")
                .status(200)
                .build();
    }
    
    @Override
    public Response getMedicineByBarcode(String barcode) {

        try {

            // 1️⃣ Null or Empty Check
            if (barcode == null || barcode.trim().isEmpty()) {
                return Response.builder()
                        .success(false)
                        .message("Barcode cannot be empty")
                        .status(400)
                        .build();
            }

            barcode = barcode.trim();

            // 2️⃣ Format Validation
            if (!barcode.matches("^BC\\d{8,}$")) {
                return Response.builder()
                        .success(false)
                        .message("Invalid barcode format")
                        .status(400)
                        .build();
            }

            // 3️⃣ Fetch from DB
            Medicine medicine = repository.findByBarcode(barcode).orElse(null);

            if (medicine == null) {
                return Response.builder()
                        .success(false)
                        .message("Medicine not found for barcode: " + barcode)
                        .status(404)
                        .build();
            }

            // 4️⃣ Success Response
            return Response.builder()
                    .success(true)
                    .message("Medicine fetched successfully")
                    .status(200)
                    .data(MedicineMapper.toDTO(medicine))
                    .build();

        } catch (Exception e) {

            return Response.builder()
                    .success(false)
                    .message("Something went wrong while fetching medicine")
                    .status(500)
                    .build();
        }
    }

    // 🔢 BARCODE LOGIC
    private String generateBarcode(String hsnCode) {

        String timePart = String.valueOf(System.currentTimeMillis());

        return "BC" + hsnCode +
                timePart.substring(timePart.length() - 4);
    }
}