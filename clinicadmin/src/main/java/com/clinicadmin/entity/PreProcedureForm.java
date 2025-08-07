package com.clinicadmin.entity;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "PreProcedure")
public class PreProcedureForm {

	private ObjectId id;
	private String hospitalId;
	private String subServiceId;
	private String subServiceName;
	private String serviceId;
	private String serviceName;						
	private String categoryId;		
	private String categoryName;
	private String preProcedureName;
	private String totalDuration;
	private String preProcedureDetails;

}
