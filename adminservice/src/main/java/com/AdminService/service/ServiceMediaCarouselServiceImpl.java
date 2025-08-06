package com.AdminService.service;

import java.io.File;
import java.io.FileOutputStream;
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

    private static final Pattern VIDEO_PATTERN = Pattern.compile(".*\\.(mp4|avi|mov|wmv|flv|mkv|webm|ogg|m4v)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern IMAGE_PATTERN = Pattern.compile(".*\\.(jpg|jpeg|png|gif|bmp|webp)$", Pattern.CASE_INSENSITIVE);

    private static final String VIDEO_FOLDER = "videos/";
    private static final String IMAGE_FOLDER = "images/";

    private static final String VIDEO_BASE_URL = "http://localhost:8081/derma-care/media/videos/";
    private static final String IMAGE_BASE_URL = "http://localhost:8081/derma-care/media/images/";

    public CategoryMediaCarouselDTO createMedia(ServiceMediaCarouselDTO mediaDTO) {
        ServiceMediaCarousel media = new ServiceMediaCarousel();
        String mediaData = mediaDTO.getMediaUrlOrImage();

        if (isVideoUrl(mediaData) || isImageUrl(mediaData)) {
            media.setMediaUrlOrImage(mediaData); // direct URL
        } else if (isBase64Video(mediaData)) {
            String url = saveBase64Video(mediaData);
            media.setMediaUrlOrImage(url);
        } else if (isBase64Image(mediaData)) {
            String url = saveBase64Image(mediaData);
            media.setMediaUrlOrImage(url);
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

            if (isVideoUrl(mediaData) || isImageUrl(mediaData)) {
                media.setMediaUrlOrImage(mediaData);
            } else if (isBase64Video(mediaData)) {
                media.setMediaUrlOrImage(saveBase64Video(mediaData));
            } else if (isBase64Image(mediaData)) {
                media.setMediaUrlOrImage(saveBase64Image(mediaData));
            } else {
                media.setMediaUrlOrImage(mediaData);
            }

            ServiceMediaCarousel updated = mediaRepository.save(media);

            return new CategoryMediaCarouselDTO(
                updated.getCarouselId().toHexString(),
                updated.getMediaUrlOrImage()
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

    // ----------------------------------
    // 🔍 Helpers
    // ----------------------------------

    private boolean isBase64Image(String data) {
        return data != null && data.startsWith("data:image") && data.contains("base64,");
    }

    private boolean isBase64Video(String data) {
        return data != null && data.startsWith("data:video") && data.contains("base64,");
    }

    public boolean isVideoUrl(String url) {
        return url != null && VIDEO_PATTERN.matcher(url).matches();
    }

    public boolean isImageUrl(String url) {
        return url != null && IMAGE_PATTERN.matcher(url).matches();
    }

    // ----------------------------------
    // 💾 Save Base64 as Files
    // ----------------------------------

    private String saveBase64Image(String base64Data) {
        try {
            String extension = "jpg";
            if (base64Data.contains("image/")) {
                extension = base64Data.substring(base64Data.indexOf("image/") + 6, base64Data.indexOf(";"));
            }

            String cleaned = base64Data.substring(base64Data.indexOf(",") + 1).replaceAll("\\s+", "");
            byte[] imageBytes = Base64.getDecoder().decode(cleaned);
            String fileName = "image_" + System.currentTimeMillis() + "." + extension;

            File dir = new File(IMAGE_FOLDER);
            if (!dir.exists()) dir.mkdirs();

            File file = new File(dir, fileName);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(imageBytes);
            }

            return IMAGE_BASE_URL + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save base64 image: " + e.getMessage(), e);
        }
    }

    private String saveBase64Video(String base64Data) {
        try {
            String cleaned = base64Data.substring(base64Data.indexOf(",") + 1).replaceAll("\\s+", "");
            byte[] videoBytes = Base64.getDecoder().decode(cleaned);
            String fileName = "video_" + System.currentTimeMillis() + ".mp4";

            File dir = new File(VIDEO_FOLDER);
            if (!dir.exists()) dir.mkdirs();

            File file = new File(dir, fileName);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(videoBytes);
            }

            return VIDEO_BASE_URL + fileName;
            
        } catch (Exception e) {
        	
            throw new RuntimeException("Failed to save base64 video: " + e.getMessage(), e);
        }
    }
}
