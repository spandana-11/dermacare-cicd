package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.RatingsDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.sevice.impl.RatingCalculationService;

@RestController
@RequestMapping("/clinic-admin")
//Origin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class RatingsController {

	@Autowired
	private RatingCalculationService ratingCalculationService;

	@GetMapping("/averageRatings/{hospitalId}/{doctorId}")
	public ResponseEntity<Response> getAverageRatings(@PathVariable String hospitalId, @PathVariable String doctorId) {

		Response response = ratingCalculationService.calculateAverageRating(hospitalId, doctorId);
		if (response != null) {
			return ResponseEntity.status(response.getStatus()).body(response);
		}
		return null;
	}
}
