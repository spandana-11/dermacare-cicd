 package com.AdminService.service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.AdminService.dto.AdminHelper;
import com.AdminService.dto.BookingResponse;
import com.AdminService.dto.CategoryDto;
import com.AdminService.dto.ClinicCredentialsDTO;
import com.AdminService.dto.ClinicDTO;
import com.AdminService.dto.CustomerDTO;
import com.AdminService.dto.DoctorsDTO;
import com.AdminService.dto.DoctortInfo;
import com.AdminService.dto.QuestionAnswerDTO;
import com.AdminService.dto.ServicesDto;
import com.AdminService.dto.SubServicesDto;
import com.AdminService.dto.SubServicesInfoDto;
import com.AdminService.dto.UpdateClinicCredentials;
import com.AdminService.entity.Admin;
import com.AdminService.entity.Clinic;
import com.AdminService.entity.ClinicCredentials;
import com.AdminService.entity.QuestionAnswer;
import com.AdminService.entity.QuetionsAndAnswerForAddClinic;
import com.AdminService.feign.BookingFeign;
import com.AdminService.feign.ClinicAdminFeign;
import com.AdminService.feign.CssFeign;
import com.AdminService.feign.CustomerFeign;
import com.AdminService.repository.AdminRepository;
import com.AdminService.repository.ClinicCredentialsRepository;
import com.AdminService.repository.ClinicRep;
import com.AdminService.repository.QuetionsAndAnswerForAddClinicRepository;
import com.AdminService.util.ExtractFeignMessage;
import com.AdminService.util.Response;
import com.AdminService.util.ResponseStructure;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
@Service
public class AdminServiceImpl implements AdminService {

	@Autowired
	private AdminRepository adminRepository;
	@Autowired

	private ClinicRep clinicRep;
	@Autowired

	private ClinicCredentialsRepository clinicCredentialsRepository;

	@Autowired

	private CssFeign cssFeign;

	@Autowired

	private CustomerFeign customerFeign;

	@Autowired

	private  ClinicAdminFeign clinicAdminFeign;

	@Autowired

	private BookingFeign bookingFeign;
	@Autowired
	private QuetionsAndAnswerForAddClinicRepository quetionsAndAnswerForAddClinicRepository;

	@Override

	public Response adminRegister(AdminHelper helperAdmin) {

		Response response = new Response();

	try {

		Optional<Admin> userName = adminRepository.findByUserName(helperAdmin.getUserName());

		   Admin mobileNumber = adminRepository.findByMobileNumber(helperAdmin.getMobileNumber());

		   if(mobileNumber != null ) {

			   response.setMessage("MobileNumber is Already Exist");

		        response.setStatus(409);

		        response.setSuccess(false);

		        return response;}

		        if(userName.isPresent()) {

		        	response.setMessage("UserName already exist");

			        response.setStatus(409);

			        response.setSuccess(false);

			        return response;

		        	}else {

		        	Admin entityAdmin = new Admin();

		 		    entityAdmin.setUserName(helperAdmin.getUserName());

		 		    entityAdmin.setPassword(helperAdmin.getPassword());

		 		    entityAdmin.setMobileNumber(helperAdmin.getMobileNumber());

		        adminRepository.save(entityAdmin);

		        response.setMessage("Credentials Are saved successfully");

		        response.setStatus(200);

		        response.setSuccess(true);

		        return response;

		}}catch(Exception e) {

		response.setMessage(e.getMessage());

        response.setStatus(500);

        response.setSuccess(false);

        return response;

	}

	}

	

	@Override

	public Response adminLogin(String userName, String password) {

		Response response = new Response();

		try {

			Optional<Admin> ExistUserName = adminRepository.findByUserName(userName);

			if(!ExistUserName.isPresent()) {

				response.setMessage("Incorrect UserName");

		        response.setStatus(401);

		        response.setSuccess(false);

		        return response;

			}


			Optional<Admin> credentials = adminRepository.findByUsernameAndPassword(userName, password);

			if(credentials.isPresent()) {

				response.setMessage("Login Successful");

		        response.setStatus(200);

		        response.setSuccess(true);

		        return response;

			}else {

				response.setMessage("Incorrect Password");

		        response.setStatus(401);

		        response.setSuccess(false);

		        return response;

			}

		}catch(Exception e) {

			response.setMessage(e.getMessage());

	        response.setStatus(500);

	        response.setSuccess(false);

	        return response;

		}

	}

	

	//CLINIC MANAGEMENT

			

	// Create Clinic

	@Override

	

	public Response createClinic(ClinicDTO clinic) {

	    Response response = new Response();

	    try {

	        // Check if contact number already exists

	        Clinic existingClinic = clinicRep.findByContactNumber(clinic.getContactNumber());

	        if (existingClinic != null) {

	            response.setMessage("ContactNumber is already exist");

	            response.setSuccess(false);

	            response.setStatus(409);

	            return response;

	        }
	        Clinic savedClinic = new Clinic();

	        savedClinic.setName(clinic.getName());

	        savedClinic.setHospitalId(generateHospitalId()); // Generate new hospitalId

	        savedClinic.setAddress(clinic.getAddress());

	        savedClinic.setCity(clinic.getCity());

	        savedClinic.setContactNumber(clinic.getContactNumber());

	        savedClinic.setOpeningTime(clinic.getOpeningTime());

	        savedClinic.setClosingTime(clinic.getClosingTime());

	        savedClinic.setEmailAddress(clinic.getEmailAddress());

	        savedClinic.setWebsite(clinic.getWebsite());

	        savedClinic.setLicenseNumber(clinic.getLicenseNumber());

	        savedClinic.setIssuingAuthority(clinic.getIssuingAuthority());

	        savedClinic.setRecommended(clinic.isRecommended());

	        savedClinic.setClinicType(clinic.getClinicType());

	        savedClinic.setHospitalOverallRating(0.0); // default rating on creation

	        savedClinic.setSubscription(clinic.getSubscription());
	        
	        savedClinic.setFreeFollowUps(clinic.getFreeFollowUps());
	        
	        savedClinic.setLatitude(clinic.getLatitude());
	        savedClinic.setLongitude(clinic.getLongitude());
	        savedClinic.setWalkthrough(clinic.getWalkthrough());
	        savedClinic.setNabhScore(clinic.getNabhScore());
	        savedClinic.setBranch(clinic.getBranch());
	        



	        // Decode hospitalLogo

	        try {

	            if (clinic.getHospitalLogo() != null && !clinic.getHospitalLogo().isEmpty()) {

	                savedClinic.setHospitalLogo(Base64.getDecoder().decode(clinic.getHospitalLogo()));

	            }

	        } catch (Exception e) {

	            throw new IllegalArgumentException("Invalid Base64 in hospitalLogo");

	        }



	        // Hospital Documents (single file assumed in List<String>)

	        try {

	            

	        	// If hospitalDocuments is String

	        	if (clinic.getHospitalDocuments() != null && !clinic.getHospitalDocuments().isEmpty()) {

	        	    savedClinic.setHospitalDocuments(Base64.getDecoder().decode(clinic.getHospitalDocuments()));

	        	}



	        } catch (Exception e) {

	            throw new IllegalArgumentException("Invalid Base64 in hospitalDocuments");

	        }



	        // Contractor Documents (single file assumed in List<String>)

	        try {

	            if (clinic.getContractorDocuments() != null && !clinic.getContractorDocuments().isEmpty()) {

	                savedClinic.setContractorDocuments(Base64.getDecoder().decode(clinic.getContractorDocuments()));

	            }

	        } catch (Exception e) {

	            throw new IllegalArgumentException("Invalid Base64 in contractorDocuments");

	        }



	        // Pharmacist Info

	        savedClinic.setHasPharmacist(clinic.getHasPharmacist());

	        if ("Yes".equalsIgnoreCase(clinic.getHasPharmacist())) {

	            if (clinic.getPharmacistCertificate() != null && !clinic.getPharmacistCertificate().isEmpty()) {

	                try {

	                    savedClinic.setPharmacistCertificate(Base64.getDecoder().decode(clinic.getPharmacistCertificate()));

	                } catch (Exception e) {

	                    throw new IllegalArgumentException("Invalid Base64 in pharmacistCertificate");

	                }

	            } else {

	                throw new IllegalArgumentException("Pharmacist Certificate is required when hasPharmacist is Yes");

	            }

	        } else {

	            savedClinic.setPharmacistCertificate(null);

	        }
	        // Medicines Handling

	        savedClinic.setMedicinesSoldOnSite(clinic.getMedicinesSoldOnSite());

	        if ("Yes".equalsIgnoreCase(clinic.getMedicinesSoldOnSite())) {

	            if (clinic.getDrugLicenseCertificate() != null && !clinic.getDrugLicenseCertificate().isEmpty()) {

	                try {

	                    savedClinic.setDrugLicenseCertificate(Base64.getDecoder().decode(clinic.getDrugLicenseCertificate()));

	                } catch (Exception e) {

	                    throw new IllegalArgumentException("Invalid Base64 in drugLicenseCertificate");

	                }

	            } else {

	                throw new IllegalArgumentException("Drug License Certificate is required when medicinesSoldOnSite is Yes");

	            }



	            if (clinic.getDrugLicenseFormType() != null && !clinic.getDrugLicenseFormType().isEmpty()) {

	                try {

	                    savedClinic.setDrugLicenseFormType(Base64.getDecoder().decode(clinic.getDrugLicenseFormType()));

	                } catch (Exception e) {

	                    throw new IllegalArgumentException("Invalid Base64 in drugLicenseFormType");

	                }

	            } else {

	                throw new IllegalArgumentException("Drug License Form Type is required when medicinesSoldOnSite is Yes");

	            }

	        } else {

	            savedClinic.setDrugLicenseCertificate(null);

	            savedClinic.setDrugLicenseFormType(null);

	        }
	        
 // Consultation Expiration (required)

	        if (clinic.getConsultationExpiration() == null || clinic.getConsultationExpiration().isBlank()) {

	            throw new IllegalArgumentException("Consultation expiration is required");

	        }

	        savedClinic.setConsultationExpiration(clinic.getConsultationExpiration());



	        // Other Licenses and certificates (optional)

	        try {

	            if (clinic.getClinicalEstablishmentCertificate() != null && !clinic.getClinicalEstablishmentCertificate().isEmpty())

	                savedClinic.setClinicalEstablishmentCertificate(Base64.getDecoder().decode(clinic.getClinicalEstablishmentCertificate()));



	            if (clinic.getBusinessRegistrationCertificate() != null && !clinic.getBusinessRegistrationCertificate().isEmpty())

	                savedClinic.setBusinessRegistrationCertificate(Base64.getDecoder().decode(clinic.getBusinessRegistrationCertificate()));



	            if (clinic.getBiomedicalWasteManagementAuth() != null && !clinic.getBiomedicalWasteManagementAuth().isEmpty())

	                savedClinic.setBiomedicalWasteManagementAuth(Base64.getDecoder().decode(clinic.getBiomedicalWasteManagementAuth()));



	            if (clinic.getTradeLicense() != null && !clinic.getTradeLicense().isEmpty())

	                savedClinic.setTradeLicense(Base64.getDecoder().decode(clinic.getTradeLicense()));



	            if (clinic.getFireSafetyCertificate() != null && !clinic.getFireSafetyCertificate().isEmpty())

	                savedClinic.setFireSafetyCertificate(Base64.getDecoder().decode(clinic.getFireSafetyCertificate()));



	            if (clinic.getProfessionalIndemnityInsurance() != null && !clinic.getProfessionalIndemnityInsurance().isEmpty())

	                savedClinic.setProfessionalIndemnityInsurance(Base64.getDecoder().decode(clinic.getProfessionalIndemnityInsurance()));



	            if (clinic.getGstRegistrationCertificate() != null && !clinic.getGstRegistrationCertificate().isEmpty())

	                savedClinic.setGstRegistrationCertificate(Base64.getDecoder().decode(clinic.getGstRegistrationCertificate()));



	            // Others - multiple documents

	            if (clinic.getOthers() != null && !clinic.getOthers().isEmpty()) {

	                List<byte[]> othersList = new ArrayList<>();

	                for (String base64File : clinic.getOthers()) {

	                    othersList.add(Base64.getDecoder().decode(base64File));

	                }

	                savedClinic.setOthers(othersList);

	            }

	        } catch (Exception e) {

	            throw new IllegalArgumentException("Invalid Base64 in one of the document fields: " + e.getMessage());

	        }
	        // Social Media Handles

	        savedClinic.setInstagramHandle(clinic.getInstagramHandle());

	        savedClinic.setTwitterHandle(clinic.getTwitterHandle());

	        savedClinic.setFacebookHandle(clinic.getFacebookHandle());
	        
	        if (clinic.getOnboardingQA() != null && !clinic.getOnboardingQA().isEmpty()) {
	            List<QuestionAnswerDTO> qaListDTO = clinic.getOnboardingQA(); // It's already a list

	            // Convert DTO list to entity list, ignoring null questions
	            List<QuestionAnswer> clinicQAList = qaListDTO.stream()
	                .filter(dto -> dto != null && dto.getQuestion() != null && !dto.getQuestion().isBlank())
	                .map(dto -> new QuestionAnswer(dto.getQuestion(), dto.isAnswer()))
	                .collect(Collectors.toList());

	            // Set onboarding QA for clinic
	            QuetionsAndAnswerForAddClinic clinicQA = new QuetionsAndAnswerForAddClinic();
	            clinicQA.setQuestionsAndAnswers(clinicQAList);
	            savedClinic.setOnboardingQA(clinicQA);

	            // Calculate score: count of true answers (rounded just in case)
	            int totalQuestions = clinicQAList.size();
	            double answeredCount = clinicQAList.stream().filter(QuestionAnswer::isAnswer).count();
	            int roundedScore = (int) Math.round(answeredCount / 2.0);
	            savedClinic.setScore(roundedScore);
	            

	            savedClinic.setScore(roundedScore);
	            savedClinic.setQuestionCount(totalQuestions); 

	        }


	        // Save clinic entity

	        Clinic saved = clinicRep.save(savedClinic);



	        if (saved != null) {

	            // Generate clinic credentials and save

	            ClinicCredentials credentials = new ClinicCredentials();

	            credentials.setUserName(saved.getHospitalId());

	            credentials.setPassword(generatePassword(9));

	            credentials.setHospitalName(saved.getName());

	            clinicCredentialsRepository.save(credentials);



	            // Prepare response data

	            Map<String, Object> data = new HashMap<>();

	            data.put("clinicUsername", credentials.getUserName());

	            data.put("clinicTemporaryPassword", credentials.getPassword());



	            response.setData(data);

	            response.setMessage("Clinic created successfully");

	            response.setSuccess(true);

	            response.setStatus(200);

	            return response;

	        }



	    } catch (Exception e) {

	        response.setMessage("Error occurred while creating the clinic: " + e.getMessage());

	        response.setSuccess(false);

	        response.setStatus(500);

	    }

	    

	    return response;

	}

	@Override
	public Response getClinicById(String clinicId) {

	    Response response = new Response();

	    try {

	        Clinic clinic = clinicRep.findByHospitalId(clinicId);

	        if (clinic != null) {

	            ClinicDTO clnc = new ClinicDTO();



	            clnc.setAddress(clinic.getAddress() != null ? clinic.getAddress() : "");

	            clnc.setCity(clinic.getCity() != null ? clinic.getCity() : "");

	            clnc.setHospitalId(clinic.getHospitalId() != null ? clinic.getHospitalId() : "");

	            clnc.setName(clinic.getName() != null ? clinic.getName() : "");

	            clnc.setEmailAddress(clinic.getEmailAddress() != null ? clinic.getEmailAddress() : "");

	            clnc.setWebsite(clinic.getWebsite() != null ? clinic.getWebsite() : "");

	            clnc.setLicenseNumber(clinic.getLicenseNumber() != null ? clinic.getLicenseNumber() : "");

	            clnc.setIssuingAuthority(clinic.getIssuingAuthority() != null ? clinic.getIssuingAuthority() : "");

	            clnc.setClosingTime(clinic.getClosingTime() != null ? clinic.getClosingTime() : "");

	            clnc.setOpeningTime(clinic.getOpeningTime() != null ? clinic.getOpeningTime() : "");

	            clnc.setContactNumber(clinic.getContactNumber() != null ? clinic.getContactNumber() : "");

	            clnc.setRecommended(clinic.isRecommended());
	            clnc.setSubscription(clinic.getSubscription());            
	            clnc.setHospitalOverallRating(clinic.getHospitalOverallRating());
	            clnc.setFreeFollowUps(clinic.getFreeFollowUps());
	            
	            clnc.setLatitude(clinic.getLatitude());
	            clnc.setLongitude(clinic.getLongitude());
	            clnc.setWalkthrough(clinic.getWalkthrough());
	            clnc.setNabhScore(clinic.getNabhScore());
	            clnc.setBranch(clinic.getBranch());

	            // Hospital Logo

	            clnc.setHospitalLogo(

	                clinic.getHospitalLogo() != null ? Base64.getEncoder().encodeToString(clinic.getHospitalLogo()) : ""

	            );



	            // Hospital Documents (single)

	            clnc.setHospitalDocuments(

	                clinic.getHospitalDocuments() != null ? Base64.getEncoder().encodeToString(clinic.getHospitalDocuments()) : ""

	            );



	            // Contractor Documents (single)

	            clnc.setContractorDocuments(

	                clinic.getContractorDocuments() != null ? Base64.getEncoder().encodeToString(clinic.getContractorDocuments()) : ""

	            );



	            // Pharmacist Info

	            clnc.setHasPharmacist(clinic.getHasPharmacist() != null ? clinic.getHasPharmacist() : "");

	            clnc.setPharmacistCertificate(

	                clinic.getPharmacistCertificate() != null ? Base64.getEncoder().encodeToString(clinic.getPharmacistCertificate()) : ""

	            );



	            // Medicines Handling

	            clnc.setMedicinesSoldOnSite(clinic.getMedicinesSoldOnSite() != null ? clinic.getMedicinesSoldOnSite() : "");

	            clnc.setDrugLicenseCertificate(

	                clinic.getDrugLicenseCertificate() != null ? Base64.getEncoder().encodeToString(clinic.getDrugLicenseCertificate()) : ""

	            );

	            clnc.setDrugLicenseFormType(

	                clinic.getDrugLicenseFormType() != null ? Base64.getEncoder().encodeToString(clinic.getDrugLicenseFormType()) : ""

	            );



	            // Extended Certifications (single files)

	            clnc.setClinicType(clinic.getClinicType() != null ? clinic.getClinicType() : "");

	            clnc.setClinicalEstablishmentCertificate(

	                clinic.getClinicalEstablishmentCertificate() != null ? Base64.getEncoder().encodeToString(clinic.getClinicalEstablishmentCertificate()) : ""

	            );

	            clnc.setBusinessRegistrationCertificate(

	                clinic.getBusinessRegistrationCertificate() != null ? Base64.getEncoder().encodeToString(clinic.getBusinessRegistrationCertificate()) : ""

	            );

	            clnc.setBiomedicalWasteManagementAuth(

	                clinic.getBiomedicalWasteManagementAuth() != null ? Base64.getEncoder().encodeToString(clinic.getBiomedicalWasteManagementAuth()) : ""

	            );

	            clnc.setTradeLicense(

	                clinic.getTradeLicense() != null ? Base64.getEncoder().encodeToString(clinic.getTradeLicense()) : ""

	            );

	            

	            clnc.setFireSafetyCertificate(

	                clinic.getFireSafetyCertificate() != null ? Base64.getEncoder().encodeToString(clinic.getFireSafetyCertificate()) : ""

	            );

	            clnc.setProfessionalIndemnityInsurance(

	                clinic.getProfessionalIndemnityInsurance() != null ? Base64.getEncoder().encodeToString(clinic.getProfessionalIndemnityInsurance()) : ""

	            );

	            clnc.setGstRegistrationCertificate(

	                clinic.getGstRegistrationCertificate() != null ? Base64.getEncoder().encodeToString(clinic.getGstRegistrationCertificate()) : ""

	            );



	            // Others – list of base64 strings

	            List<String> othersEncoded = new ArrayList<>();

	            if (clinic.getOthers() != null) {

	                for (byte[] file : clinic.getOthers()) {

	                    if (file != null) {

	                        othersEncoded.add(Base64.getEncoder().encodeToString(file));

	                    }

	                }

	            }

	            clnc.setOthers(othersEncoded);



	            // Consultation Expiration

	            clnc.setConsultationExpiration(clinic.getConsultationExpiration() != null ? clinic.getConsultationExpiration() : "");



	            // Social Media Handles

	            clnc.setInstagramHandle(clinic.getInstagramHandle() != null ? clinic.getInstagramHandle() : "");

	            clnc.setTwitterHandle(clinic.getTwitterHandle() != null ? clinic.getTwitterHandle() : "");

	            clnc.setFacebookHandle(clinic.getFacebookHandle() != null ? clinic.getFacebookHandle() : "");



	            response.setMessage("Clinic fetched successfully");

	            response.setSuccess(true);

	            response.setStatus(200);

	            response.setData(clnc);

	            return response;

	        } else {

	            response.setMessage("Clinic not found");

	            response.setSuccess(false);

	            response.setStatus(404);

	            return response;

	        }

	    } catch (Exception e) {

	        response.setMessage("Error occurred while fetching clinic: " + e.getMessage());

	        response.setSuccess(false);

	        response.setStatus(500);

	        return response;

	    }

	}









	@Override

	

	public Response getAllClinics() {

	    Response response = new Response();

	    try {

	        List<Clinic> clinics = clinicRep.findAll();

	        List<ClinicDTO> list = new ArrayList<>();



	        if (!clinics.isEmpty()) {

	            for (Clinic clinic : clinics) {

	                ClinicDTO clnc = new ClinicDTO();



	                // Simple fields

	                clnc.setAddress(clinic.getAddress() != null ? clinic.getAddress() : "");

	                clnc.setCity(clinic.getCity() != null ? clinic.getCity() : "");

	                clnc.setHospitalId(clinic.getHospitalId() != null ? clinic.getHospitalId() : "");

	                clnc.setEmailAddress(clinic.getEmailAddress() != null ? clinic.getEmailAddress() : "");

	                clnc.setWebsite(clinic.getWebsite() != null ? clinic.getWebsite() : "");

	                clnc.setLicenseNumber(clinic.getLicenseNumber() != null ? clinic.getLicenseNumber() : "");

	                clnc.setIssuingAuthority(clinic.getIssuingAuthority() != null ? clinic.getIssuingAuthority() : "");

	                clnc.setClosingTime(clinic.getClosingTime() != null ? clinic.getClosingTime() : "");

	                clnc.setContactNumber(clinic.getContactNumber() != null ? clinic.getContactNumber() : "");

	                clnc.setName(clinic.getName() != null ? clinic.getName() : "");

	                clnc.setOpeningTime(clinic.getOpeningTime() != null ? clinic.getOpeningTime() : "");

	                clnc.setRecommended(clinic.isRecommended());
	                clnc.setSubscription(clinic.getSubscription());

	                clnc.setHospitalOverallRating(clinic.getHospitalOverallRating());
	                clnc.setFreeFollowUps(clinic.getFreeFollowUps());
	                
	                clnc.setLatitude(clinic.getLatitude());
	                clnc.setLongitude(clinic.getLongitude());
	                clnc.setWalkthrough(clinic.getWalkthrough());
	                clnc.setNabhScore(clinic.getNabhScore());
	                clnc.setBranch(clinic.getBranch());



	                // Hospital Logo

	                clnc.setHospitalLogo(

	                    clinic.getHospitalLogo() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getHospitalLogo())

	                        : ""

	                );


	                // Hospital Documents

	                clnc.setHospitalDocuments(

	                    clinic.getHospitalDocuments() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getHospitalDocuments())

	                        : ""

	                );

	                // Contractor Documents

	                clnc.setContractorDocuments(

	                    clinic.getContractorDocuments() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getContractorDocuments())

	                        : ""

	                );



	                // Medicines Sold On Site

	                clnc.setMedicinesSoldOnSite(clinic.getMedicinesSoldOnSite() != null ? clinic.getMedicinesSoldOnSite() : "");

	                if ("Yes".equalsIgnoreCase(clinic.getMedicinesSoldOnSite())) {

	                    clnc.setDrugLicenseCertificate(

	                        clinic.getDrugLicenseCertificate() != null

	                            ? Base64.getEncoder().encodeToString(clinic.getDrugLicenseCertificate())

	                            : ""

	                    );

	                    clnc.setDrugLicenseFormType(

	                        clinic.getDrugLicenseFormType() != null

	                            ? Base64.getEncoder().encodeToString(clinic.getDrugLicenseFormType())

	                            : ""

	                    );

	                } else {

	                    clnc.setDrugLicenseCertificate("");

	                    clnc.setDrugLicenseFormType("");

	                }

	                // Pharmacist Certificate

	                clnc.setHasPharmacist(clinic.getHasPharmacist() != null ? clinic.getHasPharmacist() : "");

	                clnc.setPharmacistCertificate(

	                    "Yes".equalsIgnoreCase(clinic.getHasPharmacist()) && clinic.getPharmacistCertificate() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getPharmacistCertificate())

	                        : ""

	                );
	                // Extended Certifications

	                clnc.setClinicType(clinic.getClinicType() != null ? clinic.getClinicType() : "");



	                clnc.setClinicalEstablishmentCertificate(

	                    clinic.getClinicalEstablishmentCertificate() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getClinicalEstablishmentCertificate())

	                        : ""

	                );



	                clnc.setBusinessRegistrationCertificate(

	                    clinic.getBusinessRegistrationCertificate() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getBusinessRegistrationCertificate())

	                        : ""

	                );



	                clnc.setBiomedicalWasteManagementAuth(

	                    clinic.getBiomedicalWasteManagementAuth() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getBiomedicalWasteManagementAuth())

	                        : ""

	                );



	                clnc.setTradeLicense(

	                    clinic.getTradeLicense() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getTradeLicense())

	                        : ""

	                );



	                clnc.setFireSafetyCertificate(

	                    clinic.getFireSafetyCertificate() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getFireSafetyCertificate())

	                        : ""

	                );



	                clnc.setProfessionalIndemnityInsurance(

	                    clinic.getProfessionalIndemnityInsurance() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getProfessionalIndemnityInsurance())

	                        : ""

	                );



	                clnc.setGstRegistrationCertificate(

	                    clinic.getGstRegistrationCertificate() != null

	                        ? Base64.getEncoder().encodeToString(clinic.getGstRegistrationCertificate())

	                        : ""

	                );


	                // Others – list of documents

	                List<String> othersList = new ArrayList<>();

	                if (clinic.getOthers() != null) {

	                    for (byte[] doc : clinic.getOthers()) {

	                        if (doc != null) {

	                            othersList.add(Base64.getEncoder().encodeToString(doc));

	                        }

	                    }

	                }

	                clnc.setOthers(othersList);



	                // Consultation Expiration

	                clnc.setConsultationExpiration(

	                    clinic.getConsultationExpiration() != null ? clinic.getConsultationExpiration() : ""

	                );



	                // Social Media

	                clnc.setInstagramHandle(clinic.getInstagramHandle() != null ? clinic.getInstagramHandle() : "");

	                clnc.setTwitterHandle(clinic.getTwitterHandle() != null ? clinic.getTwitterHandle() : "");

	                clnc.setFacebookHandle(clinic.getFacebookHandle() != null ? clinic.getFacebookHandle() : "");



	                list.add(clnc);

	            }
	            response.setData(list);

	            response.setMessage("Clinics fetched successfully");

	            response.setSuccess(true);

	            response.setStatus(200);

	        } else {

	            response.setData(null);

	            response.setMessage("Clinics Not Found");

	            response.setSuccess(true); // Still success, but no data

	            response.setStatus(200);

	        }

	    } catch (Exception e) {

	        response.setData(null);

	        response.setMessage("Error: " + e.getMessage());

	        response.setSuccess(false);

	        response.setStatus(500);

	    }

	    return response;

	}



	@Override

		

	public Response updateClinic(String clinicId, ClinicDTO clinic) {

	    Response response = new Response();

	    try {

	        Clinic savedClinic = clinicRep.findByHospitalId(clinicId);

	        if (savedClinic != null) {



	            if (clinic.getAddress() != null) savedClinic.setAddress(clinic.getAddress());

	            if (clinic.getCity() != null) savedClinic.setCity(clinic.getCity());



	            if (clinic.getName() != null) {

	                savedClinic.setName(clinic.getName());



	                // Update hospital name in credentials

	                List<ClinicCredentials> credsList = clinicCredentialsRepository.findAllByUserName(savedClinic.getHospitalId());

	                for (ClinicCredentials creds : credsList) {

	                    creds.setHospitalName(clinic.getName());

	                    clinicCredentialsRepository.save(creds);

	                }

	            }



	            // Hospital Logo

	            if (clinic.getHospitalLogo() != null && !clinic.getHospitalLogo().isEmpty()) {

	                savedClinic.setHospitalLogo(Base64.getDecoder().decode(clinic.getHospitalLogo()));

	            }



	            // Hospital Documents

	            if (clinic.getHospitalDocuments() != null && !clinic.getHospitalDocuments().isEmpty()) {

	                savedClinic.setHospitalDocuments(Base64.getDecoder().decode(clinic.getHospitalDocuments()));

	            }



	            // Contractor Documents

	            if (clinic.getContractorDocuments() != null && !clinic.getContractorDocuments().isEmpty()) {

	                savedClinic.setContractorDocuments(Base64.getDecoder().decode(clinic.getContractorDocuments()));

	            }



	            if (clinic.getHospitalOverallRating() != 0.0) {

	                savedClinic.setHospitalOverallRating(clinic.getHospitalOverallRating());

	            }



	            if (clinic.getClosingTime() != null) savedClinic.setClosingTime(clinic.getClosingTime());

	            if (clinic.getOpeningTime() != null) savedClinic.setOpeningTime(clinic.getOpeningTime());

	            if (clinic.getContactNumber() != null) savedClinic.setContactNumber(clinic.getContactNumber());

	            if (clinic.getEmailAddress() != null) savedClinic.setEmailAddress(clinic.getEmailAddress());

	            if (clinic.getWebsite() != null) savedClinic.setWebsite(clinic.getWebsite());

	            if (clinic.getLicenseNumber() != null) savedClinic.setLicenseNumber(clinic.getLicenseNumber());

	            if (clinic.getIssuingAuthority() != null) savedClinic.setIssuingAuthority(clinic.getIssuingAuthority());
	            
	            
	            
	           


	            // Optional hospital ID update (not recommended usually)

	            if (clinic.getHospitalId() != null && !clinic.getHospitalId().equals(clinicId)) {

	                savedClinic.setHospitalId(clinic.getHospitalId());

	            }



	            // Medicines Sold On Site

	            savedClinic.setMedicinesSoldOnSite(clinic.getMedicinesSoldOnSite());

	            if ("Yes".equalsIgnoreCase(clinic.getMedicinesSoldOnSite())) {

	                if (clinic.getDrugLicenseCertificate() != null && !clinic.getDrugLicenseCertificate().isEmpty()) {

	                    savedClinic.setDrugLicenseCertificate(Base64.getDecoder().decode(clinic.getDrugLicenseCertificate()));

	                }

	                if (clinic.getDrugLicenseFormType() != null && !clinic.getDrugLicenseFormType().isEmpty()) {

	                    savedClinic.setDrugLicenseFormType(Base64.getDecoder().decode(clinic.getDrugLicenseFormType()));

	                }

	            } else {

	                savedClinic.setDrugLicenseCertificate(null);

	                savedClinic.setDrugLicenseFormType(null);

	            }



	            // Pharmacist Section

	            savedClinic.setHasPharmacist(clinic.getHasPharmacist());

	            if ("Yes".equalsIgnoreCase(clinic.getHasPharmacist())) {

	                if (clinic.getPharmacistCertificate() != null && !clinic.getPharmacistCertificate().isEmpty()) {

	                    savedClinic.setPharmacistCertificate(Base64.getDecoder().decode(clinic.getPharmacistCertificate()));

	                }

	            } else {

	                savedClinic.setPharmacistCertificate(null);

	            }



	            // Other Certificates

	            if (clinic.getClinicType() != null) savedClinic.setClinicType(clinic.getClinicType());



	            if (clinic.getClinicalEstablishmentCertificate() != null && !clinic.getClinicalEstablishmentCertificate().isEmpty())

	                savedClinic.setClinicalEstablishmentCertificate(Base64.getDecoder().decode(clinic.getClinicalEstablishmentCertificate()));



	            if (clinic.getBusinessRegistrationCertificate() != null && !clinic.getBusinessRegistrationCertificate().isEmpty())

	                savedClinic.setBusinessRegistrationCertificate(Base64.getDecoder().decode(clinic.getBusinessRegistrationCertificate()));



	            if (clinic.getBiomedicalWasteManagementAuth() != null && !clinic.getBiomedicalWasteManagementAuth().isEmpty())

	                savedClinic.setBiomedicalWasteManagementAuth(Base64.getDecoder().decode(clinic.getBiomedicalWasteManagementAuth()));



	            if (clinic.getTradeLicense() != null && !clinic.getTradeLicense().isEmpty())

	                savedClinic.setTradeLicense(Base64.getDecoder().decode(clinic.getTradeLicense()));



	            if (clinic.getFireSafetyCertificate() != null && !clinic.getFireSafetyCertificate().isEmpty())

	                savedClinic.setFireSafetyCertificate(Base64.getDecoder().decode(clinic.getFireSafetyCertificate()));



	            if (clinic.getProfessionalIndemnityInsurance() != null && !clinic.getProfessionalIndemnityInsurance().isEmpty())

	                savedClinic.setProfessionalIndemnityInsurance(Base64.getDecoder().decode(clinic.getProfessionalIndemnityInsurance()));



	            if (clinic.getGstRegistrationCertificate() != null && !clinic.getGstRegistrationCertificate().isEmpty())

	                savedClinic.setGstRegistrationCertificate(Base64.getDecoder().decode(clinic.getGstRegistrationCertificate()));



	            // Others - List<byte[]>

	            if (clinic.getOthers() != null) {

	                List<byte[]> othersList = new ArrayList<>();

	                for (String base64File : clinic.getOthers()) {

	                    if (base64File != null && !base64File.isEmpty()) {

	                        othersList.add(Base64.getDecoder().decode(base64File));

	                    }

	                }

	                savedClinic.setOthers(othersList);

	            }
	            
	            savedClinic.setFreeFollowUps(clinic.getFreeFollowUps());
	            savedClinic.setLatitude(clinic.getLatitude());
	            savedClinic.setLongitude(clinic.getLongitude());
	            if (clinic.getWalkthrough() != null) savedClinic.setWalkthrough(clinic.getWalkthrough());
	            savedClinic.setNabhScore(clinic.getNabhScore());
	            if (clinic.getBranch() != null) savedClinic.setBranch(clinic.getBranch());



	            // Consultation Expiration

	            if (clinic.getConsultationExpiration() != null && !clinic.getConsultationExpiration().isEmpty()) {

	                savedClinic.setConsultationExpiration(clinic.getConsultationExpiration());
	                

	            }

	            // Social Media

	            if (clinic.getInstagramHandle() != null) savedClinic.setInstagramHandle(clinic.getInstagramHandle());

	            if (clinic.getTwitterHandle() != null) savedClinic.setTwitterHandle(clinic.getTwitterHandle());

	            if (clinic.getFacebookHandle() != null) savedClinic.setFacebookHandle(clinic.getFacebookHandle());



	            // Recommended

	            savedClinic.setRecommended(clinic.isRecommended());



	            // Save updates

	            clinicRep.save(savedClinic);



	            response.setMessage("Clinic updated successfully");

	            response.setSuccess(true);

	            response.setStatus(200);

	        } else {

	            response.setMessage("Clinic not found for update");

	            response.setSuccess(false);

	            response.setStatus(404);

	        }

	    } catch (Exception e) {

	        response.setMessage("Error occurred while updating the clinic: " + e.getMessage());

	        response.setSuccess(false);

	        response.setStatus(500);

	    }

	    return response;

	}

	

		@Override

		public Response deleteClinic(String clinicId) {

		    Response response = new Response();

		    try {

		        Clinic clinic = clinicRep.findByHospitalId(clinicId);

		        if (clinic != null) {

		        	

		            // Delete Clinic

		            clinicRep.deleteByHospitalId(clinicId);



		            // Delete associated credentials

		            clinicCredentialsRepository.deleteByUserName(clinicId);



		            response.setMessage("Clinic deleted successfully");

		            response.setSuccess(true);

		            response.setStatus(200); // OK

		        } else {

		            response.setMessage("Clinic not found for deletion");

		            response.setSuccess(false);

		            response.setStatus(404); // Not Found

		        }

		    } catch (Exception e) {

		        response.setMessage("Error occurred while deleting the clinic: " + e.getMessage());

		        response.setSuccess(false);

		        response.setStatus(500); // Internal Server Error

		    }

		    return response;

		}



    

    //GENERATE RANDOM PASSWORD

    

    private static String generatePassword(int length) {

        if (length < 4) {

            throw new IllegalArgumentException("Password length must be at least 4.");

        }

        String upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        String lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

        String digits = "0123456789";

        String specialChars = "!@#$&_";

        Random random = new Random();

        // First character - must be uppercase

        char firstChar = upperCaseLetters.charAt(random.nextInt(upperCaseLetters.length()));



        // Ensure at least one special character and one digit

        char specialChar = specialChars.charAt(random.nextInt(specialChars.length()));

        char digit = digits.charAt(random.nextInt(digits.length()));



        // Remaining characters pool

        String allChars = upperCaseLetters + lowerCaseLetters + digits + specialChars;

        StringBuilder remaining = new StringBuilder();



        for (int i = 0; i < length - 3; i++) {

            remaining.append(allChars.charAt(random.nextInt(allChars.length())));

        }



        // Build the password and shuffle to randomize the positions (except first char)

        List<Character> passwordChars = new ArrayList<>();

        for (char c : remaining.toString().toCharArray()) {

            passwordChars.add(c);

        }



        // Add guaranteed special and digit

        passwordChars.add(specialChar);

        passwordChars.add(digit);



        // Shuffle rest except first character

        Collections.shuffle(passwordChars);

        StringBuilder password = new StringBuilder();

        password.append(firstChar);

        for (char c : passwordChars) {

            password.append(c);

        }

        return password.toString();

    }

    

    // METHOD TO GENERATE SEQUANTIAL HOSPITAL ID

    

    public String generateHospitalId() {

        List<Clinic> allClinics = clinicRep.findAll(); // not optimal for huge DB



        int maxId = 0;

        Pattern pattern = Pattern.compile("H_(\\d+)");

        

        for (Clinic clinic : allClinics) {

            String id = clinic.getHospitalId();

            Matcher matcher = pattern.matcher(id);

            if (matcher.find()) {

                int num = Integer.parseInt(matcher.group(1));

                if (num > maxId) {

                    maxId = num;

                }

            }

        }



        int nextId = maxId + 1;

        return "H_" + nextId;

    }





    

// CLINIC CREDENTIALS CRUD

    

    @Override

    public Response getClinicCredentials(String userName) {

        Response response = new Response();

        try {

            ClinicCredentials clinicCredentials = clinicCredentialsRepository.findByUserName(userName);

            if (clinicCredentials != null) {

            	ClinicCredentialsDTO clinicCredentialsDTO = new ClinicCredentialsDTO();

            	clinicCredentialsDTO.setUserName(clinicCredentials.getUserName());

            	clinicCredentialsDTO.setPassword(clinicCredentials.getPassword());

            	clinicCredentialsDTO.setHospitalName(clinicCredentials.getHospitalName());

                response.setSuccess(true);

                response.setData(clinicCredentialsDTO );

                response.setMessage("Clinic Credentials Found.");

                response.setStatus(200); // HTTP status for OK

                return response;

            } else {

                response.setSuccess(true);

                response.setMessage("Clinic Credentials Are Not Found.");

                response.setStatus(200); // HTTP status for Not Found

                return response;

            }

        } catch (Exception e) {

            response.setSuccess(false);

            response.setMessage("Error Retrieving Clinic Credentials: " + e.getMessage());

            response.setStatus(500); // Internal server error

        }

        return response;

    }

    @Override

    public Response updateClinicCredentials(UpdateClinicCredentials credentials,String userName) {

        Response response = new Response();

        try {	

           ClinicCredentials existingCredentials = clinicCredentialsRepository.

           findByUserNameAndPassword(userName,credentials.getPassword());

           ClinicCredentials existUserName = clinicCredentialsRepository.findByUserName(userName);

           if(existUserName == null) {

        	   response.setSuccess(false);

               response.setMessage("Incorrect UserName");

               response.setStatus(401);

               return response;

           }

            if (existingCredentials != null) {

            if( credentials.getNewPassword().equalsIgnoreCase(credentials.getConfirmPassword())) {

               existingCredentials.setPassword(credentials.getNewPassword());

            	ClinicCredentials c = clinicCredentialsRepository.save(existingCredentials);

            	if(c != null) {

            	response.setSuccess(true);

                response.setData(null);

                response.setMessage("Clinic Credentials Updated Successfully.");

                response.setStatus(200);

                return response;

            } else {

                response.setSuccess(false);

                response.setMessage("Failed To Upddate Clinic Credentials.");

                response.setStatus(404); 

                return response;// HTTP status for Not Found

            }}else {

            	 response.setSuccess(false);

                 response.setMessage("New password and confirm password do not match.");

                 response.setStatus(401);

            	return response;

            }}else {

            	response.setSuccess(false);

                response.setMessage("Incorrect Password.");

                response.setStatus(401);

           	return response;

            }}

           catch (Exception e) {

            response.setSuccess(false);

            response.setMessage("Error updating clinic credentials: " + e.getMessage());

            response.setStatus(500); // Internal server error

        return response;}

    }
    @Override
    public Response deleteClinicCredentials(String userName ) {
        Response response = new Response();

        try {

            ClinicCredentials clinicCredentials = clinicCredentialsRepository.findByUserName(userName);

            if (clinicCredentials != null) {

                clinicCredentialsRepository.delete(clinicCredentials);

                clinicRep.deleteByHospitalId(userName);

                response.setSuccess(true);

                response.setMessage("Clinic Credentials Deleted Successfully.");

                response.setStatus(200); // HTTP status for OK

                return response;

            } else {

                response.setSuccess(false);

                response.setMessage("Clinic Credentials Are Not Found.");

                response.setStatus(404); // HTTP status for Not Found

                return response;

            }

        } catch (Exception e) {

            response.setSuccess(false);

            response.setMessage("Error Deleting Clinic Credentials: " + e.getMessage());

            response.setStatus(500); // Internal server error

        }

        return response;

    }

    @Override

    public Response login(ClinicCredentialsDTO credentials) {

    	Response response = new Response();

    	try {

    	String userName = credentials.getUserName();

    	String password = credentials.getPassword();

    	ClinicCredentials existUserName = clinicCredentialsRepository.findByUserName(userName);

    	if(userName == null || userName.isBlank()) {

    		response.setSuccess(false);

    		response.setMessage("Username is Required");

    		response.setStatus(400);	

    		return response;

    		}

    		if(existUserName == null) {

    			response.setSuccess(false);

        		response.setMessage("Incorrect UserName");

        		response.setStatus(401);	

        		return response;

        		}

    	if(password == null || password.isBlank()) {

    		response.setSuccess(false);

    		response.setMessage("Password is Required");

    		response.setStatus(400);	

    		return response;

    		}

    ClinicCredentials clinicCredentials =  clinicCredentialsRepository.

    	findByUserNameAndPassword(userName, password);

    	if(clinicCredentials != null) {

    		response.setSuccess(true);

    		response.setMessage("Login Successful");

    		response.setStatus(200);

    		response.setHospitalName(clinicCredentials.getHospitalName());

    		response.setHospitalId(clinicCredentials.getUserName());

    		return response;

    		}

    	else {

    		response.setSuccess(false);

    		response.setMessage("Incorrect Password");

    		response.setStatus(401);	//unauthorized

    		return response;

    	}}

    	catch(Exception e){

    		response.setSuccess(false);

    		response.setMessage(e.getMessage());

    		response.setStatus(500);

    		return response;

    	}

    }



	

   // Category Management

    

    @Override

    public Response addNewCategory(CategoryDto dto){

    	 Response response = new  Response();

    	 try {

	    		ResponseEntity<ResponseStructure<CategoryDto>> res = cssFeign.addNewCategory(dto);

	    		  if(res.hasBody()) {

		    		    ResponseStructure<CategoryDto> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }}catch(FeignException e) {

	                    	            response.setStatus(e.status());

	                	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	                	    			response.setSuccess(false);}

    	                              return response;} 

    

    @Override                                

	   public Response getAllCategory() {

	             Response response = new  Response();

	    	     try {

	    		 ResponseEntity<ResponseStructure<List<CategoryDto>>> res =  cssFeign.getAllCategory();

	    		  if(res.hasBody()) {

	    			  ResponseStructure<List<CategoryDto>> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

        	            response.setStatus(e.status());

    	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

    	    			response.setSuccess(false);

        	        }

                        return response;

        	    } 

	

    @Override                

	public Response getCategoryById(String CategoryId){

		 Response response = new  Response();

		try {

			ResponseEntity<ResponseStructure<CategoryDto>> res =  cssFeign.getCategoryById(CategoryId);

			 if(res.hasBody()) {

	    		    ResponseStructure<CategoryDto> rs = res.getBody();

	    			response.setData(rs);

	    			response.setStatus(rs.getHttpStatus().value());

                 }

	    		}catch(FeignException e) {

    	            response.setStatus(e.status());

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

    	        }

                    return response;

    	    } 

    

    @Override

	public Response deleteCategoryById(

			 String categoryId) {

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<ResponseStructure<String>> res =  cssFeign.deleteCategory(new ObjectId(categoryId));

	    			if(res.hasBody()) {

	    		    ResponseStructure<String> rs = res.getBody();

	    			response.setData(rs);

	    			response.setStatus(rs.getHttpStatus().value());

                    }

	    		}catch(FeignException e) {

    	            response.setStatus(e.status());

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

    	        }

                    return response;

    	    } 

    

    @Override

	public Response updateCategory(String categoryId,CategoryDto updatedCategory){

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<ResponseStructure<CategoryDto>> res =  cssFeign.updateCategory(new ObjectId(categoryId), updatedCategory);

	    		  if(res.hasBody()) {

		    		    ResponseStructure<CategoryDto> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	 

	

	

	// SERVICES MANAGEMENT

	

    @Override

	public Response addService( ServicesDto dto){

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<ResponseStructure<ServicesDto>>  res =  cssFeign.addService(dto);

	    		  if(res.hasBody()) {

	    			  ResponseStructure<ServicesDto> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	 

	

    @Override

	public Response getServiceById( String categoryId){

		 Response response = new  Response();

	    	try {

	    		 ResponseEntity<ResponseStructure<List<ServicesDto>>>  res =  cssFeign.getServiceById(categoryId);

	    		  if(res.getBody()!=null) {

	    			  ResponseStructure<List<ServicesDto>> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	 

	

    @Override

	public Response getServiceByServiceId( String serviceId){

		 Response response = new  Response();

	    	try {

	    	ResponseEntity<ResponseStructure<ServicesDto>>  res =  cssFeign.getServiceByServiceId(serviceId);

	    		  if(res.hasBody()) {

	    			  ResponseStructure<ServicesDto> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	

    @Override

	public Response deleteService( String serviceId) {

		 Response response = new  Response();

	    	try {

	    	ResponseEntity<ResponseStructure<String>>  res =  cssFeign.deleteService(serviceId);

	    		  if(res.hasBody()) {

	    			  ResponseStructure<String> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	

	

    @Override

	public Response updateByServiceId( String serviceId,

			@RequestBody ServicesDto domainServices) {

		 Response response = new  Response();

	    	try {

	    	ResponseEntity<ResponseStructure<ServicesDto>>  res =  cssFeign.

	    			updateByServiceId(serviceId, domainServices);

	    		  if(res.hasBody()) {

	    			  ResponseStructure<ServicesDto> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	

    @Override

	public Response getAllServices() {

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<ResponseStructure<List<ServicesDto>>> res =  cssFeign.getAllServices();

	    	

	    		  if(res.hasBody()) {

	    			  ResponseStructure<List<ServicesDto>> rs = res.getBody();

		    			response.setData(rs);

		    			response.setStatus(rs.getHttpStatus().value());

	                    }

		    		}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;

	    	    } 	

	

	

	//SUBSERVICE MANAGEMENT

	

    @Override

	public  Response addSubService( SubServicesInfoDto dto){

		Response response = new Response();

	    	try {

	    		ResponseEntity<Response> res = cssFeign.addSubService(dto);

	    		return res.getBody();

	    	 

		    		}catch(FeignException e) {

	    	            response.setStatus(500);

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

		    			return response;

	    	        }

	                    

	    	    } 	 

	

    @Override

	public Response getSubServiceByIdCategory(String categoryId){

		Response response = new Response();

    	try {

    		ResponseEntity<Response> res = cssFeign.getSubServiceByIdCategory(categoryId);

    		return res.getBody();

	    		}catch(FeignException e) {

    	            response.setStatus(500);

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

	    			return response;

    	        }

                    

	    	    } 	 

	

    @Override

	public Response getSubServicesByServiceId(String serviceId){

		Response response = new Response();

    	try {

    		ResponseEntity<Response> res = cssFeign.getSubServicesByServiceId(serviceId);

    		return res.getBody();

    	 

	    		}catch(FeignException e) {

    	            response.setStatus(500);

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

	    			return response;

    	        }

                    

	    	    } 	

		

    @Override

	public Response getSubServiceBySubServiceId(String subServiceId){

		Response response = new Response();

    	try {

    		ResponseEntity<Response> res = cssFeign.getSubServiceBySubServiceId(subServiceId);

    		return res.getBody();

    	 

	    		}catch(FeignException e) {

    	            response.setStatus(500);

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

	    			return response;

    	        }

                    

	    	    } 	

	

    @Override

	public Response deleteSubService(String subServiceId){

		Response response = new Response();

    	try {

    		ResponseEntity<Response> res = cssFeign.deleteSubService(subServiceId);

    		return res.getBody();

    	 

	    		}catch(FeignException e) {

    	            response.setStatus(500);

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

	    			return response;

    	        }

                    

	}

    @Override

	public Response updateBySubServiceId(String subServiceId, SubServicesInfoDto domainServices) {

		Response response = new Response();

    	try {

    		ResponseEntity<Response> res = cssFeign.updateBySubServiceId(subServiceId, domainServices);

    		return res.getBody();

    	 

	    		}catch(FeignException e) {

    	            response.setStatus(500);

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

	    			return response;

    	        }

                    

	}

    @Override

	public Response getAllSubServices(){

		Response response = new Response();

    	try {

    		ResponseEntity<Response> res = cssFeign.getAllSubServices();

    		return res.getBody();

    	 

	    		}catch(FeignException e) {

    	            response.setStatus(500);

	    			response.setMessage(ExtractFeignMessage.clearMessage(e));

	    			response.setSuccess(false);

	    			return response;

    	        }

                     } 

	

	

	

	// CUSTOMER MANAGEMENT

    

    @Override

	public Response saveCustomerBasicDetails(CustomerDTO customerDTO ) {

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<Response> res = customerFeign.saveCustomerBasicDetails(customerDTO);

	    		  if(res != null) {

	    			  Response rs = res.getBody();

	    			  return rs;

	    		  }}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;}

    

    @Override	

	public ResponseEntity<?> getCustomerByUsernameMobileEmail(String input) {

    	Response response = new Response();

	    	try {

	    		ResponseEntity<?> res = customerFeign.getCustomerByUsernameMobileEmail(input);

	    		  if(res.getBody()!= null) {

	    			  response.setData(res.getBody());

	    			  response.setStatus(res.getStatusCode().value());

	    			  return ResponseEntity.status(res.getStatusCode().value()).body(res.getBody());}

	    		  else {

	    			  response.setMessage("Customer Details Not Found");

	    			  response.setStatus(200);

	    			  response.setSuccess(true);

	    			  return ResponseEntity.status(200).body(response);}

	    		  }catch(FeignException e) {

	    			  response.setMessage(e.getMessage());

	    			  response.setStatus(e.status());

	    			  response.setSuccess(false);

	    			  return ResponseEntity.status(e.status()).body(response);

	    	        }}

   

    

    @Override

	public Response getCustomerBasicDetails(String mobileNumber ) {

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<Response> res = customerFeign.getCustomerBasicDetails(mobileNumber);

	    		  if(res != null) {

	    			  Response rs = res.getBody();

	    			  return rs;

	    		  }}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;	

}



    @Override

	public Response getAllCustomers(){

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<Response> res = customerFeign.getAllCustomers();

	    		  if(res != null) {

	    			  Response rs = res.getBody();

	    			  return rs;

	    		  }}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;	

}

	

    @Override

	public Response updateCustomerBasicDetails(CustomerDTO customerDTO,String mobileNumber ){

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<Response> res = customerFeign.updateCustomerBasicDetails(customerDTO, mobileNumber);

	    		  if(res != null) {

	    			  Response rs = res.getBody();

	    			  return rs;

	    		  }}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;	

}

	

    @Override

	public Response deleteCustomerBasicDetails(String mobileNumber){

		 Response response = new  Response();

	    	try {

	    		ResponseEntity<Response> res = customerFeign.deleteCustomerBasicDetails(mobileNumber);

	    		  if(res != null) {

	    			  Response rs = res.getBody();

	    			  return rs;

	    		  }}catch(FeignException e) {

	    	            response.setStatus(e.status());

		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

		    			response.setSuccess(false);

	    	        }

	                    return response;	

}

    

    

//GETALLSUBSERVICES

    

    @Override

   	public Response getAllSubServicesFromClincAdmin(){

   		 Response response = new  Response();

   	    	try {

   	    		ResponseEntity<ResponseStructure<List<SubServicesDto>>> res = clinicAdminFeign.getAllSubServices();

   	    		  if(res.getBody().getData() != null ) {

   	    			 response.setStatus(res.getBody().getHttpStatus().value());

   	    			response.setData(res.getBody());

   	    			  return response;

   	    		  }}catch(FeignException e) {

   	    	            response.setStatus(e.status());

   		    			response.setMessage(ExtractFeignMessage.clearMessage(e));

   		    			response.setSuccess(false);

   	    	        }

   	                    return response;	

   }

    

    

    ///GETALLBOOKINGS

    

    public ResponseStructure<List<BookingResponse>> getAllBookedServices() {

        try {

            ResponseEntity<ResponseStructure<List<BookingResponse>>> responseEntity = bookingFeign.getAllBookedService();

            ResponseStructure<List<BookingResponse>> res = responseEntity.getBody();



            if (res.getData() != null && !res.getData().isEmpty()) {

                return new ResponseStructure<>(

                    res.getData(),

                    res.getMessage(),

                    res.getHttpStatus(),

                    res.getStatusCode()

                );

            } else {

                return new ResponseStructure<>(

                    new ArrayList<>(), // ✅ Return empty list instead of null

                    "Bookings Not Found",

                    res.getHttpStatus() != null ? res.getHttpStatus() : HttpStatus.NO_CONTENT,

                    res.getStatusCode() != null ? res.getStatusCode() : HttpStatus.NO_CONTENT.value()

                );

            }

        } catch (FeignException e) {

            HttpStatus fallbackStatus = HttpStatus.resolve(e.status());

            if (fallbackStatus == null) {

                fallbackStatus = HttpStatus.INTERNAL_SERVER_ERROR;

            }



            return new ResponseStructure<>(

                new ArrayList<>(), // ✅ Even in error case, return empty list

                ExtractFeignMessage.clearMessage(e),

                fallbackStatus,

                fallbackStatus.value()

            );

        }

    }



    

    //DELETEBOOKINGBYID

    

    public Response deleteBookedService(String id){

   	 Response response = new  Response();

   	try {

   		 ResponseEntity<ResponseStructure<BookingResponse>> res = bookingFeign.deleteBookedService(id);

   		  Object bookingResponse = res.getBody();

   		if( bookingResponse != null ) {

   			response.setData(res.getBody());

   			response.setStatus(res.getBody().getStatusCode());

   			return response;

   		}

   		else {

   			response.setStatus(404);

   			response.setMessage("Unable To Delete Bookedservice");

   			response.setSuccess(false);

   			return response;

   		}

   	}catch(FeignException e) {

   		response.setStatus(e.status());

   		response.setMessage(ExtractFeignMessage.clearMessage(e));

   		response.setSuccess(false);

   		return response;

   	}

   	

   }

    

    //GETBOOKSERVICEBYDOCTORID

    

    public Response getBookingByDoctorId(String doctorId) {

        Response response = new Response();

        try {

         ResponseEntity<ResponseStructure<List<BookingResponse>>> res = bookingFeign.getBookingByDoctorId(doctorId);

         

                    if (res.getBody() != null ) {

                    response.setData(res.getBody());

                    response.setStatus(res.getBody().getStatusCode());	                    

                } else {                  

                    response.setStatus(200);

                    response.setMessage("No Bookedservices Found For This DoctorId");

                    response.setSuccess(true);

                }

        } catch(FeignException e) {

    		response.setStatus(e.status());

    		response.setMessage(ExtractFeignMessage.clearMessage(e));

    		response.setSuccess(false);

    		return response;

        }



        return response;

    }



    

    ///GETDOCTORINFO

    

    public Response getDoctorInfoByDoctorId(String doctorId) {

        Response response = new Response();

        try {

        	ResponseEntity<Response>  res = clinicAdminFeign.getDoctorById(doctorId);  

                    if (res.getBody() != null ) {

                    if(res.getBody().getData() != null) {

                    DoctorsDTO dto = new ObjectMapper().convertValue(res.getBody().getData(), DoctorsDTO.class);

                    DoctortInfo doctortInfo  = new DoctortInfo();

                    doctortInfo.setDoctorPicture(dto.getDoctorPicture());

                    doctortInfo.setDoctorName(dto.getDoctorName());

                    doctortInfo.setExperience(dto.getExperience());

                    doctortInfo.setProfileDescription(dto.getProfileDescription());

                    doctortInfo.setSpecialization(dto.getSpecialization());

                    response.setData(doctortInfo);

                    response.setStatus(200);

                    response.setMessage("Doctor Details Fetched Successfully");

                    response.setSuccess(true);}

                    }else {   	

                    response.setData(res.getBody());

                    response.setStatus(res.getBody().getStatus());}	                    

            } catch(FeignException e) {

    		response.setStatus(e.status());

    		response.setMessage(ExtractFeignMessage.clearMessage(e));

    		response.setSuccess(false);}

        return response;

    }



    //-----------------------------GET CLINICS BUY RECOMMONDATION == TRUE---------------------------------

  	@Override

  	public Response getClinicsByRecommondation() {



  		List<Clinic> clinics = clinicRep.findByRecommendedTrue();

  		List<ClinicDTO> clinicsDTO = new ArrayList<>();

  		for (Clinic clinic : clinics) {

  			ClinicDTO toDto = new ClinicDTO();

  			toDto.setHospitalId(clinic.getHospitalId());

  			toDto.setName(clinic.getName());

  			toDto.setAddress(clinic.getAddress());

  			toDto.setCity(clinic.getCity());

  			toDto.setContactNumber(clinic.getContactNumber());

  			toDto.setHospitalOverallRating(clinic.getHospitalOverallRating());

  			toDto.setOpeningTime(clinic.getOpeningTime());

  			toDto.setClosingTime(clinic.getClosingTime());

  			toDto.setEmailAddress(clinic.getEmailAddress());

  			toDto.setWebsite(clinic.getWebsite());

  			toDto.setLicenseNumber(clinic.getLicenseNumber());

  			toDto.setIssuingAuthority(clinic.getIssuingAuthority());

  			// Hospital Logo

  			toDto.setHospitalLogo(

  					clinic.getHospitalLogo() != null ? Base64.getEncoder().encodeToString(clinic.getHospitalLogo())

  							: "");



  			 // Hospital Documents — single binary

  	        toDto.setHospitalDocuments(

  	            clinic.getHospitalDocuments() != null 

  	                ? Base64.getEncoder().encodeToString(clinic.getHospitalDocuments()) 

  	                : ""

  	        );



  	        toDto.setRecommended(clinic.isRecommended());



  	        clinicsDTO.add(toDto);

  		}

  		Response response = new Response();

  		response.setSuccess(true);

  		response.setData(clinicsDTO);

  		response.setStatus(200);

  		response.setMessage("Clinics Retrive successfully");

  		return response;

  	}

		

}




