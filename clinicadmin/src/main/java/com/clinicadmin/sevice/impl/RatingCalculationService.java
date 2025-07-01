package com.clinicadmin.sevice.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.clinicadmin.dto.ClinicDTO;
import com.clinicadmin.dto.CustomerRatingDomain;
import com.clinicadmin.dto.RatingsDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.Doctors;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.feignclient.CustomerServiceFeignClient;
import com.clinicadmin.repository.DoctorsRepository;
import com.clinicadmin.utils.ExtractFeignMessage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;

@Service
public class RatingCalculationService {

    @Autowired
    private CustomerServiceFeignClient customerServiceFeignClient;
    
    @Autowired
    private AdminServiceClient adminServiceClient;
    
    @Autowired
    private DoctorsRepository doctorsRepository;

    public Response calculateAverageRating(String hospitalId, String doctorId) {
        Response response = new Response();

        try {
            ResponseEntity<Response> responseEntity =
                    customerServiceFeignClient.getRatingInfo(hospitalId, doctorId);

            Object ratings = responseEntity.getBody().getData();
            List<CustomerRatingDomain> allRatings = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            // Convert to List
            if (ratings instanceof List) {
                allRatings = mapper.convertValue(ratings, new TypeReference<List<CustomerRatingDomain>>() {});
            } else if (ratings != null) {
                CustomerRatingDomain single = mapper.convertValue(ratings, CustomerRatingDomain.class);
                allRatings.add(single);
            }

            // Check if data exists at all
            if (allRatings.isEmpty()) {
                response.setSuccess(false);
                response.setStatus(404);
                response.setMessage("No ratings found for the given hospitalId and doctorId.");
                return response;
            }

            // Validate hospitalId and doctorId separately
            boolean hospitalExists = allRatings.stream()
                    .anyMatch(r -> r.getHospitalId().equals(hospitalId));
            boolean doctorExists = allRatings.stream()
                    .anyMatch(r -> r.getDoctorId().equals(doctorId));

            if (!hospitalExists && !doctorExists) {
                response.setSuccess(false);
                response.setStatus(404);
                response.setMessage("Invalid hospitalId and doctorId.");
                return response;
            } else if (!hospitalExists) {
                response.setSuccess(false);
                response.setStatus(404);
                response.setMessage("Invalid hospitalId.");
                return response;
            } else if (!doctorExists) {
                response.setSuccess(false);
                response.setStatus(404);
                response.setMessage("Invalid doctorId.");
                return response;
            }

            List<CustomerRatingDomain> matchedRatings = allRatings.stream()
                    .filter(r -> r.getHospitalId().equals(hospitalId) && r.getDoctorId().equals(doctorId))
                    .toList();

            if (matchedRatings.isEmpty()) {
                response.setSuccess(false);
                response.setStatus(404);
                response.setMessage("No matching ratings found for the given hospitalId and doctorId.");
                return response;
            }

            double totalDoctorRating = matchedRatings.stream()
                    .mapToDouble(CustomerRatingDomain::getDoctorRating).sum();
            double totalHospitalRating = matchedRatings.stream()
                    .mapToDouble(CustomerRatingDomain::getHospitalRating).sum();

            double avgDoctorRating = totalDoctorRating / matchedRatings.size();
            double avgHospitalRating = totalHospitalRating / matchedRatings.size();
            
            ResponseEntity<Response> res = adminServiceClient.getClinicById(hospitalId);
            if(res.getBody()!=null) {
            ClinicDTO clinic = new ObjectMapper().convertValue(res.getBody(),ClinicDTO.class );
            clinic.setHospitalOverallRating(avgHospitalRating);
            adminServiceClient.updateClinic(hospitalId, clinic);}
            
            Optional<Doctors> rs = doctorsRepository.findByDoctorId(doctorId);
            if(rs.isPresent()) {
            	rs.get().setDoctorAverageRating(avgDoctorRating);
            	doctorsRepository.save(rs.get());}           
            RatingsDTO data = new RatingsDTO();
            data.setDoctorId(doctorId);
            data.setHospitalId(hospitalId);
            data.setOverallDoctorRating(avgDoctorRating);
            data.setOverallHospitalRating(avgHospitalRating);
            data.setComments(matchedRatings);

            response.setSuccess(true);
            response.setData(data);
            response.setMessage("Ratings fetched successfully.");
            response.setStatus(200);
            return response;

        } catch (FeignException e) {
            response.setSuccess(false);
            response.setMessage(ExtractFeignMessage.clearMessage(e));
            response.setStatus(e.status());
            return response;
        }
    }
}