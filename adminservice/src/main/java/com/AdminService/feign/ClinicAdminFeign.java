package com.AdminService.feign;
import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.AdminService.dto.DoctorsDTO;
import com.AdminService.dto.LabTestDTO;
import com.AdminService.dto.ProbableDiagnosisDTO;
import com.AdminService.dto.SubServicesDto;
import com.AdminService.dto.TreatmentDTO;
import com.AdminService.util.Response;
import com.AdminService.util.ResponseStructure;


@FeignClient(name = "clinicadmin")
//@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "clinicAdminServiceFallBack")
public interface ClinicAdminFeign {
	
	 // ---------------------- Sub-Service APIs ----------------------
	@GetMapping("/clinic-admin/subService/getAllSubServies")
    public ResponseEntity<ResponseStructure<List<SubServicesDto>>> getAllSubServices();
		
	 // ---------------------- Doctor APIs ----------------------
    @PostMapping("/clinic-admin/addDoctor")
    ResponseEntity<Response> addDoctor(@RequestBody DoctorsDTO dto);

    @GetMapping("/clinic-admin/doctors")
    ResponseEntity<Response> getAllDoctors();
		
    @GetMapping("/clinic-admin/doctor/{id}")
    ResponseEntity<Response> getDoctorById(@PathVariable("id") String id);

    @PutMapping("/clinic-admin/updateDoctor/{doctorId}")
    ResponseEntity<Response> updateDoctorById(@PathVariable String doctorId,
                                              @Validated @RequestBody DoctorsDTO dto);
		
    @DeleteMapping("/clinic-admin/delete-doctor/{doctorId}")
    ResponseEntity<Response> deleteDoctorById(@PathVariable String doctorId);
		
    @DeleteMapping("/clinic-admin/delete-doctors-by-clinic/{clinicId}")
    ResponseEntity<Response> deleteDoctorsByClinic(@PathVariable String clinicId); 
    
    
    

	
	///FALLBACK METHODS
	
	default ResponseEntity<?> clinicAdminServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"CLINIC ADMIN SERVICE NOT AVAILABLE",503,null,null, null, null, null));
		
	
	}
	
	// ---------------------- Disease APIs ----------------------
	
	// Add multiple or single diseases
    @PostMapping("/clinic-admin/addDiseases")
    ResponseEntity<Response> addDiseases(@RequestBody Object requestBody);

    // Get all diseases
    @GetMapping("/clinic-admin/get-all-diseases")
    ResponseEntity<Response> getAllDiseases();

    // Get disease by ID and hospital ID
    @GetMapping("/clinic-admin/getDisease/{id}/{hospitalId}")
    ResponseEntity<Response> getDiseaseByDiseaseId(@PathVariable("id") String id,
                                                   @PathVariable("hospitalId") String hospitalId);

    // Delete disease by ID and hospital ID
    @DeleteMapping("/clinic-admin/deleteDisease/{id}/{hospitalId}")
    ResponseEntity<Response> deleteDiseaseByDiseaseId(@PathVariable("id") String id,
                                                      @PathVariable("hospitalId") String hospitalId);

    // Update disease by ID and hospital ID
    @PutMapping("/clinic-admin/updateDisease/{id}/{hospitalId}")
    ResponseEntity<Response> updateDiseaseByDiseaseId(@PathVariable("id") String id,
                                                      @PathVariable("hospitalId") String hospitalId,
                                                      @RequestBody ProbableDiagnosisDTO dto);

    // Get all diseases by hospital ID
    @GetMapping("/clinic-admin/diseases/{hospitalId}")
    ResponseEntity<ResponseStructure<List<ProbableDiagnosisDTO>>> getDiseasesByHospitalId(@PathVariable("hospitalId") String hospitalId);

    
    
    // ---------------------- Lab Test APIs ----------------------
    @PostMapping("/clinic-admin/labtest/addLabTest")
    ResponseEntity<Response> addLabTest(@RequestBody LabTestDTO dto);

    @GetMapping("/clinic-admin/labtest/getAllLabTests")
    ResponseEntity<Response> getAllLabTests();

    @GetMapping("/clinic-admin/labtest/getLabTestById/{id}/{hospitalId}")
    ResponseEntity<Response> getLabTestById(@PathVariable("id") String id,
                                            @PathVariable("hospitalId") String hospitalId);

    @DeleteMapping("/clinic-admin/labtest/deleteLabTest/{id}/{hospitalId}")
    ResponseEntity<Response> deleteLabTest(@PathVariable("id") String id,
                                           @PathVariable("hospitalId") String hospitalId);

    @PutMapping("/clinic-admin/labtest/updateLabTest/{id}/{hospitalId}")
    ResponseEntity<Response> updateLabTest(@PathVariable("id") String id,
                                           @PathVariable("hospitalId") String hospitalId,
                                           @RequestBody LabTestDTO dto);

    @GetMapping("/clinic-admin/labtests/{hospitalId}")
    ResponseEntity<ResponseStructure<List<LabTestDTO>>> getLabTestsByHospitalId(@PathVariable("hospitalId") String hospitalId);

    
    // ---------------------- Treatment APIs ----------------------
    @PostMapping("/clinic-admin/treatment/addTreatment")
    ResponseEntity<Response> addTreatment(@RequestBody TreatmentDTO dto);

    @GetMapping("/clinic-admin/treatment/getAllTreatments")
    ResponseEntity<Response> getAllTreatments();

    @GetMapping("/clinic-admin/treatment/getTreatmentById/{id}/{hospitalId}")
    ResponseEntity<Response> getTreatmentById(@PathVariable("id") String id,
                                              @PathVariable("hospitalId") String hospitalId);

    @DeleteMapping("/clinic-admin/treatment/deleteTreatmentById/{id}/{hospitalId}")
    ResponseEntity<Response> deleteTreatmentById(@PathVariable("id") String id,
                                                 @PathVariable("hospitalId") String hospitalId);

    @PutMapping("/clinic-admin/treatment/updateTreatmentById/{id}/{hospitalId}")
    ResponseEntity<Response> updateTreatmentById(@PathVariable("id") String id,
                                                 @PathVariable("hospitalId") String hospitalId,
                                                 @RequestBody TreatmentDTO dto);

    @GetMapping("/clinic-admin/treatments/{hospitalId}")
    ResponseEntity<ResponseStructure<List<TreatmentDTO>>> getTreatmentsByHospitalId(@PathVariable("hospitalId") String hospitalId);

}