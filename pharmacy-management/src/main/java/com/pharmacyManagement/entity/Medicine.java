package com.pharmacyManagement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "medicines")
public class Medicine {

    @Id
    private String id;
    private String medicineName;
    private String generic;
}
