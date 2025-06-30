package com.dermaCare.customerService.config;

import java.io.InputStream;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Configuration
public class CustomerFcm {
	
	@PostConstruct
    public void initialize() {
		try {
		    InputStream serviceAccount = getClass()
		            .getClassLoader()
		            .getResourceAsStream("dermacare.json");

		    if (serviceAccount == null) {
		        throw new IllegalStateException("Firebase service account file not found in classpath!");
		    }

		    FirebaseOptions options = FirebaseOptions.builder()
		            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
		            .build();

		    if (FirebaseApp.getApps().isEmpty()) {
		        FirebaseApp.initializeApp(options);
		        System.out.println("Firebase initialized");
		    }
		} catch (Exception e) {
		    e.printStackTrace();
		}
}
}