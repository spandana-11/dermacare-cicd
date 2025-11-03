package com.dermacare.bookingService.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingRequset {

    private String bookingId;
    private String parentBookingId;      // optional, for child bookings
    private List<String> childBookingIds; // optional
    private String bookingType;          // NEW, FOLLOWUP, SITTING

    private String bookingFor;
    private String relation;
    private String patientMobileNumber;
    private String visitType;
    private Integer freeFollowUps;
    private String patientAddress;
    private String patientId;
    private String name;
    private String age;
    private String gender;
    private String mobileNumber;
    private String customerId;
    private String customerDeviceId;
    private String consultationExpiration;
    private String problem;
    private String symptomsDuration;

    private String clinicId;
    private String clinicName;
    private String branchId;
    private String branchname;
    private String clinicDeviceId;

    private String doctorId;
    private String doctorName;
    private String doctorMobileDeviceId;
    private String doctorWebDeviceId;

    private String subServiceId;
    private String subServiceName;
    private String serviceDate;
    private Integer totalSittings;
    private Integer pendingSittings;
    private Integer takenSittings;
    private Integer currentSitting;
    private String followupDate;
    private String servicetime;
    private String consultationType;
    private double consultationFee;
    private double totalFee;
    private String paymentType;
    private String foc;

    private List<String> attachments;    // could be Base64 or file URLs
    private String consentFormPdf;       // Base64
    private List<String> prescriptionPdf; // optional
    private String doctorRefCode;
    private String bookedAt;
    private String followupStatus;
    private String notes;
    private String reasonForCancel;
 // ✅ Add Treatment Response field
    private TreatmentResponseDTO treatmentResponse;
}
