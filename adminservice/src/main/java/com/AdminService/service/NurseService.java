package com.AdminService.service;

import com.AdminService.dto.NurseDTO;
import com.AdminService.util.ResponseStructure;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface NurseService {

    ResponseEntity<ResponseStructure<NurseDTO>> nurseOnBoarding(NurseDTO dto);

    ResponseEntity<ResponseStructure<List<NurseDTO>>> getAllByHospital(String hospitalId);

    ResponseEntity<ResponseStructure<NurseDTO>> getNurse(String hospitalId, String nurseId);

    ResponseEntity<ResponseStructure<NurseDTO>> updateNurse(String nurseId, NurseDTO dto);

    ResponseEntity<ResponseStructure<String>> deleteNurse(String hospitalId, String nurseId);

    ResponseEntity<ResponseStructure<List<NurseDTO>>> getAllNursesByBranch(String hospitalId, String branchId);
}
