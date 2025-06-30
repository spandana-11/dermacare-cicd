package com.AdminService.service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.AdminService.dto.CategoryMediaCarouselDTO;
import com.AdminService.dto.ServiceMediaCarouselDTO;
import com.AdminService.entity.ServiceMediaCarousel;
import com.AdminService.repository.ServiceMediaCarousalRepository;



@Service
public class ServiceMediaCarouselServiceImpl {

	   @Autowired
	    private ServiceMediaCarousalRepository mediaRepository;

	    private static final Pattern VIDEO_PATTERN = Pattern.compile(
	        ".*\\.(mp4|avi|mov|wmv|flv|mkv|webm|ogg|m4v)$", Pattern.CASE_INSENSITIVE
	    );

	    public CategoryMediaCarouselDTO createMedia(ServiceMediaCarouselDTO mediaDTO) {
	    	ServiceMediaCarousel media = new ServiceMediaCarousel();
	        String mediaData = mediaDTO.getMediaUrlOrImage();

	        if (isBase64(mediaData)) {
	            byte[] decodedImage = Base64.getDecoder().decode(mediaData);
	            media.setMediaUrlOrImage(Base64.getEncoder().encodeToString(decodedImage));
	        } else if (isVideoUrl(mediaData)) {
	            media.setMediaUrlOrImage(mediaData);
	        } else {
	            media.setMediaUrlOrImage(mediaData);
	        }

	        media = mediaRepository.save(media);

	        return new CategoryMediaCarouselDTO(
	            media.getCarouselId().toHexString(),
	            media.getMediaUrlOrImage()
	        );
	    }

	    public Iterable<CategoryMediaCarouselDTO> getAllMedia() {
	        List<CategoryMediaCarouselDTO> mediaDTOs = new ArrayList<>();
	        for (ServiceMediaCarousel media : mediaRepository.findAll()) {
	            mediaDTOs.add(new CategoryMediaCarouselDTO(
	                media.getCarouselId().toHexString(),
	                media.getMediaUrlOrImage()
	            ));
	        }
	        return mediaDTOs;
	    }

	    public Optional<CategoryMediaCarouselDTO> getMediaById(String carouselId) {
	        return mediaRepository.findById(new ObjectId(carouselId))
	            .map(media -> new CategoryMediaCarouselDTO(
	                media.getCarouselId().toHexString(),
	                media.getMediaUrlOrImage()
	            ));
	    }

	    public Optional<CategoryMediaCarouselDTO> updateMediaOptional(String carouselId, ServiceMediaCarouselDTO mediaDTO) {
	        return mediaRepository.findById(new ObjectId(carouselId)).map(media -> {
	            String mediaData = mediaDTO.getMediaUrlOrImage();

	            if (isBase64(mediaData)) {
	                byte[] decodedImage = Base64.getDecoder().decode(mediaData);
	                media.setMediaUrlOrImage(Base64.getEncoder().encodeToString(decodedImage));
	            } else if (isVideoUrl(mediaData)) {
	                media.setMediaUrlOrImage(mediaData);
	            } else {
	                media.setMediaUrlOrImage(mediaData);
	            }

	            ServiceMediaCarousel updatedMedia = mediaRepository.save(media);

	            return new CategoryMediaCarouselDTO(
	                updatedMedia.getCarouselId().toHexString(),
	                updatedMedia.getMediaUrlOrImage()
	            );
	        });
	    }

	    public String deleteMedia(String carouselId) {
	        ObjectId id = new ObjectId(carouselId);
	        if (mediaRepository.existsById(id)) {
	            mediaRepository.deleteById(id);
	            return "Delete successful";
	        }
	        return "Data not found";
	    }

	    public boolean isBase64(String data) {
	        if (data == null || data.isEmpty()) {
	            return false;
	        }
	        return !data.startsWith("http") && data.matches("^[A-Za-z0-9+/]+={0,2}$");
	    }

	    public boolean isVideoUrl(String url) {
	        return url != null && VIDEO_PATTERN.matcher(url).matches();
	    }
}
