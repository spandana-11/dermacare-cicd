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
import com.AdminService.entity.CategoryMediaCarousel;
import com.AdminService.repository.CategoryMediaCarouselRepository;

@Service
public class CategoryMediaCarouselServiceImpl {
    @Autowired
    private CategoryMediaCarouselRepository mediaRepository;
    private static final Pattern VIDEO_PATTERN = Pattern.compile(
        ".*\\.(mp4|avi|mov|wmv|flv|mkv|webm|ogg|m4v)$",
        Pattern.CASE_INSENSITIVE
    );

    private static final String VIDEO_FOLDER = "videos/";
    private static final String BASE_URL = "http://13.202.16.119:9090/derma-care/media/videos/";

    public CategoryMediaCarouselDTO createMedia(CategoryMediaCarouselDTO mediaDTO) {
        CategoryMediaCarousel media = new CategoryMediaCarousel();
        String mediaData = mediaDTO.getMediaUrlOrImage();

        if (isVideoUrl(mediaData)) {
            media.setMediaUrlOrImage(mediaData);
        } else if (isBase64(mediaData)) {
            String videoUrl = saveBase64Video(mediaData);
            media.setMediaUrlOrImage(videoUrl);
        } else {
            media.setMediaUrlOrImage(mediaData);
        }

        CategoryMediaCarousel saved = mediaRepository.save(media);

        return new CategoryMediaCarouselDTO(
            saved.getCarouselId().toHexString(),
            saved.getMediaUrlOrImage()
        );
    }

    public Iterable<CategoryMediaCarouselDTO> getAllMedia() {
        List<CategoryMediaCarouselDTO> list = new ArrayList<>();
        for (CategoryMediaCarousel media : mediaRepository.findAll()) {
            list.add(new CategoryMediaCarouselDTO(
                media.getCarouselId().toHexString(),
                media.getMediaUrlOrImage()
            ));
        }
        return list;
    }

    public Optional<CategoryMediaCarouselDTO> getMediaById(String carouselId) {
        return mediaRepository.findById(new ObjectId(carouselId)).map(
            media -> new CategoryMediaCarouselDTO(
                media.getCarouselId().toHexString(),
                media.getMediaUrlOrImage()
            )
        );
    }

    public Optional<CategoryMediaCarouselDTO> updateMediaOptional(String carouselId, CategoryMediaCarouselDTO mediaDTO) {
        return mediaRepository.findById(new ObjectId(carouselId)).map(media -> {
            String mediaData = mediaDTO.getMediaUrlOrImage();

            if (isVideoUrl(mediaData)) {
                media.setMediaUrlOrImage(mediaData);
            } else if (isBase64(mediaData)) {
                String videoUrl = saveBase64Video(mediaData);
                media.setMediaUrlOrImage(videoUrl);
            } else {
                media.setMediaUrlOrImage(mediaData);
            }

            CategoryMediaCarousel updated = mediaRepository.save(media);
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

    /**
     * ✅ Checks if the given string is a valid base64-encoded video
     */
    private boolean isBase64(String data) {
        if (data == null) return false;

        // Case 1: Base64 with media type prefix
        if (data.startsWith("data:video") && data.contains("base64,")) {
            return true;
        }

        // Case 2: Raw base64 string (without prefix)
        try {
            Base64.getDecoder().decode(data);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isVideoUrl(String url) {
        return url != null && VIDEO_PATTERN.matcher(url).matches();
    }

    /**
     * ✅ Converts base64 video string (with or without prefix) into a physical file and returns public URL
     */
    private String saveBase64Video(String base64Data) {
        try {
            // Remove prefix if present
            if (base64Data.contains(",")) {
                base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
            }
            base64Data = base64Data.replaceAll("\\s+", ""); // Remove whitespace

            byte[] videoBytes = Base64.getDecoder().decode(base64Data);
            String fileName = "video_" + System.currentTimeMillis() + ".mp4";

            File directory = new File(VIDEO_FOLDER);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            File file = new File(directory, fileName);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(videoBytes);
            }

            return BASE_URL + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save base64 video: " + e.getMessage(), e);
        }
    }
}