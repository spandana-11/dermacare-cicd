package com.clinicadmin.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.clinicadmin.dto.DoctorAvailableSlotDTO;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "doctor_slots")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorSlot {

    @Id
    private String id;

    private String doctorId;
    private String hospitalId ;
    private String date;

    private List<DoctorAvailableSlotDTO> availableSlots;

    @JsonFormat(pattern = "dd-MM-yyyy")
    @Indexed(name = "slotExpiryIndex", expireAfter = "30d") // Correct usage
    private LocalDateTime createdAt = LocalDateTime.now();

     
}

