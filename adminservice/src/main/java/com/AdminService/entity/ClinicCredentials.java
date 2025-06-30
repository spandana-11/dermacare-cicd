package com.AdminService.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "clinic_credentials")
public class ClinicCredentials {

    @Id
    private String id;  
    private String hospitalName;
    private String userName;
    private String password;
    
}