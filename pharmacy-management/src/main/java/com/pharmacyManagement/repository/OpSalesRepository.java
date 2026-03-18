package com.pharmacyManagement.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.pharmacyManagement.entity.OpSales;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpSalesRepository extends MongoRepository<OpSales, String> {

    // Find by billNo
    Optional<OpSales> findByBillNo(String billNo);

    // Check if billNo exists (for duplicate validation)
    boolean existsByBillNo(String billNo);

    // Get all by clinicId and branchId
    List<OpSales> findByClinicIdAndBranchId(String clinicId, String branchId);
    List<OpSales> findByClinicIdAndBranchIdAndOpNo(String clinicId, String branchId, String opno);

    // Find by opNo, clinicId, branchId — latest record
    Optional<OpSales> findTopByOpNoAndClinicIdAndBranchIdOrderByCreatedAtDesc(
            String opNo, String clinicId, String branchId);

    // Check if opNo exists for clinic+branch
    boolean existsByOpNoAndClinicIdAndBranchId(String opNo, String clinicId, String branchId);

    // Delete by id, clinicId, branchId
    @Query(value = "{ 'id': ?0, 'clinicId': ?1, 'branchId': ?2 }")
    Optional<OpSales> findByIdAndClinicIdAndBranchId(String id, String clinicId, String branchId);


    List<OpSales> findByClinicIdAndBranchIdAndBillNoContainingIgnoreCaseAndPatientNameContainingIgnoreCaseAndMobileAndConsultingDoctorContainingIgnoreCase(
            String clinicId,
            String branchId,
            String billNo,
            String patientName,
            String mobile,
            String consultingDoctor
    );
}
