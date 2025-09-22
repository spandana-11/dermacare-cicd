package com.clinicadmin.entity;

import lombok.*;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clinic_staff_login_credentials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorLoginCredentials {

	@Id
	private String id;
	private String staffId;
	private String staffName;
	private String hospitalId;
	private String hospitalName;
	private String branchId;
	private String username;
	private String password;
	private String role;
	private Map<String, List<String>> permissions;


}
