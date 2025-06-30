package com.clinicadmin.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "doctor_login_credentials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorLoginCredentials {

    @Id
    private String id;
    private String doctorId;   
    private String hospitalId;
    private String username;       
    private String password;      
    private String role = "DOCTOR"; 
}

