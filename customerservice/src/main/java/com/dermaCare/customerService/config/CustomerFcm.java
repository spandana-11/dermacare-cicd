package com.dermaCare.customerService.config;

import java.io.InputStream;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.core.io.Resource;
import jakarta.annotation.PostConstruct;

@Configuration
public class CustomerFcm {
	
	 @Value("${app.firebase-configuration-file}")
	    private Resource firebaseConfigFile;

	    @PostConstruct
	    public void initialize() {
	        try (InputStream serviceAccount = firebaseConfigFile.getInputStream()) {
	            if (FirebaseApp.getApps().isEmpty()) {
	                FirebaseOptions options = FirebaseOptions.builder()
	                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
	                    .build();
	                FirebaseApp.initializeApp(options);
	                System.out.println("Firebase initialized successfully.");}
	        }catch (Exception e) {
	            System.err.println("Error initializing Firebase: " + e.getMessage());
	            e.printStackTrace();
	        }
	    }
}