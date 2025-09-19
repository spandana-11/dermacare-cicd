package com.clinicadmin.service;

import com.clinicadmin.dto.PharmacistDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.PharmacistLoginDTO;
import com.clinicadmin.dto.ResetPharmacistLoginPasswordDTO;

public interface PharmacistService {
    Response pharmacistOnboarding(PharmacistDTO dto);
    Response getPharmacistById(String pharmacistId);
    Response updatePharmacist(String pharmacistId, PharmacistDTO dto);
    Response deletePharmacist(String pharmacistId);
//    Response pharmacistLogin(PharmacistLoginDTO loginDTO);
//    Response resetLoginPassword(ResetPharmacistLoginPasswordDTO dto);
	Response getAllPharmacistsByHospitalId(String hospitalId);
}