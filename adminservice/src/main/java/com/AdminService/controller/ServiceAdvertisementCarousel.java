package com.AdminService.controller;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.AdminService.dto.CategoryMediaCarouselDTO;
import com.AdminService.dto.ServiceMediaCarouselDTO;
import com.AdminService.service.ServiceMediaCarouselServiceImpl;

@RestController
@RequestMapping("/admin")
//Origin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ServiceAdvertisementCarousel {

	 @Autowired
	 private ServiceMediaCarouselServiceImpl mediaService;

	    // Add new media
	    @PostMapping("/ServiceAdvertisement/add")
	    public ResponseEntity<CategoryMediaCarouselDTO> createMedia(@RequestBody ServiceMediaCarouselDTO mediaDTO) {
	        return ResponseEntity.status(HttpStatus.CREATED).body(mediaService.createMedia(mediaDTO));
	    }

	    // Get all media
	    @GetMapping("/ServiceAdvertisement/getAll")
	    public ResponseEntity<?> getAllMedia() {
	        var media = mediaService.getAllMedia();
	        return media.iterator().hasNext() ? ResponseEntity.ok(media) :
	                ResponseEntity.status(HttpStatus.OK).body("No media found");
	    }

	    @GetMapping("/ServiceAdvertisement/getById/{carouselId}")
	    public ResponseEntity<CategoryMediaCarouselDTO> getMediaById(@PathVariable String carouselId) {
	        Optional<CategoryMediaCarouselDTO> mediaDTO = mediaService.getMediaById(carouselId);
	        
	        return mediaDTO.map(media -> ResponseEntity.ok().body(media)) // if found
	                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
	                        .body(new CategoryMediaCarouselDTO("", "Media not found"))); // if not found
	    }

	    // Update media by ID
	    @PutMapping("/ServiceAdvertisement/updateById/{carouselId}")
	    public ResponseEntity<String> updateMedia(@PathVariable String carouselId, @RequestBody ServiceMediaCarouselDTO mediaDTO) {
	        return mediaService.updateMediaOptional(carouselId, mediaDTO)
	                .map(dto -> ResponseEntity.ok("Media Carousel updated successfully!"))
	                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Media not found"));
	    }

	    // Delete media by ID
	    @DeleteMapping("/ServiceAdvertisement/deleteByCarouselId/{carouselId}")
	    public ResponseEntity<String> deleteMedia(@PathVariable String carouselId) {
	        String result = mediaService.deleteMedia(carouselId);
	        return result.equals("Delete successful") ? ResponseEntity.ok(result) :
	                ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
	    }
}
