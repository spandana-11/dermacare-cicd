package com.clinicadmin.service;

import com.clinicadmin.dto.OnBoardResponse;
import com.clinicadmin.dto.ReceptionistRequestDTO;
import com.clinicadmin.dto.ReceptionistRestPassword;
import com.clinicadmin.dto.ResponseStructure;

import java.util.List;

public interface ReceptionistService {

    ResponseStructure<ReceptionistRequestDTO> createReceptionist(ReceptionistRequestDTO dto);

    ResponseStructure<ReceptionistRequestDTO> getReceptionistById(String id);

    ResponseStructure<List<ReceptionistRequestDTO>> getAllReceptionists();

    ResponseStructure<ReceptionistRequestDTO> updateReceptionist(String id, ReceptionistRequestDTO dto);

    ResponseStructure<String> deleteReceptionist(String id);

//    OnBoardResponse login(String userName, String password);

//  ResponseStructure<String> resetPassword(ReceptionistRestPassword request);

//    ResponseStructure<String> resetPassword(String contactNumber, ReceptionistRestPassword request);

    // ✅ Fetch all receptionists by clinicId
    ResponseStructure<List<ReceptionistRequestDTO>> getReceptionistsByClinic(String clinicId);

    // ✅ Fetch a receptionist by clinicId and receptionistId
    ResponseStructure<ReceptionistRequestDTO> getReceptionistByClinicAndId(String clinicId, String receptionistId);
}