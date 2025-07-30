package com.AdminService.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "counters")
public class IdCounter {

    @Id
    private String id;  // e.g., "hospitalId"
    private int sequence;

}