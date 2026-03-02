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

        return new Response(
                true,
                MedicineMapper.toDTO(saved),
                "Medicine created successfully",
                201
        );
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

        return new Response(
                true,
                MedicineMapper.toDTO(saved),
                "Medicine updated successfully",
                200
        );
    }

    // 3️⃣ GET ALL
    @Override
    public Response getAllMedicines() {

        List<MedicineDTO> list = repository.findAll()
                .stream()
                .map(MedicineMapper::toDTO)
                .toList();

        return new Response(
                true,
                list,
                "All medicines fetched",
                200
        );
    }

    // 4️⃣ GET BY ID
    @Override
    public Response getMedicineById(String id) {

        Medicine medicine = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        return new Response(
                true,
                MedicineMapper.toDTO(medicine),
                "Medicine fetched successfully",
                200
        );
    }

    // 5️⃣ DELETE
    @Override
    public Response deleteMedicine(String id) {

        repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        repository.deleteById(id);

        return new Response(
                true,
                null,
                "Medicine deleted successfully",
                200
        );
    }

    @Override
    public Response getMedicineByBarcode(String barcode) {

        try {

            // 1️⃣ Null or Empty Check
            if (barcode == null || barcode.trim().isEmpty()) {
                return new Response(false, null, "Barcode cannot be empty", 400);
            }

            barcode = barcode.trim();

            // 2️⃣ Format Validation
            if (!barcode.matches("^BC\\d{8,}$")) {
                return new Response(false, null, "Invalid barcode format", 400);
            }

            // 3️⃣ Fetch from DB
            Medicine medicine = repository.findByBarcode(barcode).orElse(null);

            if (medicine == null) {
                return new Response(false, null, "Medicine not found for barcode: " + barcode, 404);
            }

            // 4️⃣ Success Response
            return new Response(true, MedicineMapper.toDTO(medicine), "Medicine fetched successfully", 200);

        } catch (Exception e) {

            return new Response(false, null, "Something went wrong while fetching medicine", 500);
        }
    }

    // 🔢 BARCODE LOGIC
    private String generateBarcode(String hsnCode) {

        String timePart = String.valueOf(System.currentTimeMillis());

        return "BC" + hsnCode +
                timePart.substring(timePart.length() - 4);
    }
}