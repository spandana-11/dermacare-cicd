package com.dermaCare.customerService.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "customer_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRating {
    @Id
    private ObjectId id; // MongoDB ObjectId
    private double doctorRating;
    private double hospitalRating;
    private String feedback;
    private String hospitalId;
    private String doctorId; // Provider's mobile number
    private String customerMobileNumber;
    private String appointmentId;
    private boolean rated;
    private String dateAndTimeAtRating;
}

