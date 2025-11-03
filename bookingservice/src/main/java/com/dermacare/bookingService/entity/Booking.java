package com.dermacare.bookingService.entity;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.dermacare.bookingService.dto.TreatmentResponseDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "Appointments")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Booking {

    @Id
    private String bookingId;

    // --------------------- Booking Relationships ---------------------
    private String parentBookingId;       // references original booking
    private List<String> childBookingIds; // optional: list of child booking IDs
    private String bookingType;           // optional: NEW, FOLLOWUP, SITTING

    private String treatmentName; // <-- Add this to fix compilation error
    
    // --------------------- Patient Info ---------------------
    private String bookingFor;
    private String relation;
    private String patientMobileNumber;
    private String patientAddress;
    private String patientId;
    private Integer freeFollowUpsLeft;
    private Integer freeFollowUps;
    private String followupDate;
    private String visitType;
    private String name;
    private String age;
    private String gender;
    private String mobileNumber;
    private String customerId;
    private String customerDeviceId;
    private String problem;
    private String symptomsDuration;

    // --------------------- Clinic Info ---------------------
    private String clinicId;
    private String clinicName;
    private String branchId;
    private String branchname;
    private String clinicDeviceId;

    // --------------------- Doctor Info ---------------------
    private String doctorId;
    private String doctorName;
    private String doctorDeviceId;
    private String doctorWebDeviceId;

    // --------------------- Service Info ---------------------
    private String subServiceId;
    private String subServiceName;
    private String serviceDate;
    private String servicetime;
    private String consultationType;
    private double consultationFee;
    private double totalFee;
    private String foc;
    private String reasonForCancel;
    private String notes;

    // --------------------- Documents / Reports ---------------------
    private List<ReportsList> reports;
    private List<byte[]> attachments;
    private byte[] consentFormPdf;
    private List<byte[]> prescriptionPdf;

    // --------------------- Booking Tracking ---------------------
    private String channelId;
    private String bookedAt;
    private String status;
    private Integer visitCount;
    private String paymentType;
    private String paymentStatus;         // optional: PAID, PENDING, FAILED
    private String doctorRefCode;
    private String consultationExpiration;
    private String followupStatus;

    // --------------------- Sittings Info ---------------------
    private Integer sittings;
    private Integer totalSittings;
    private Integer pendingSittings;
    private Integer takenSittings;
    private Integer currentSitting;

    // --------------------- Treatments ---------------------
    private TreatmentResponseDTO treatments; // treatmentName -> treatment details

    // --------------------- Copy Constructor ---------------------
    public Booking(Booking booking) {
        this.bookingId = booking.getBookingId();
        this.parentBookingId = booking.getParentBookingId();
        this.childBookingIds = booking.getChildBookingIds();
        this.bookingType = booking.getBookingType();

        this.bookingFor = booking.getBookingFor();
        this.relation = booking.getRelation();
        this.patientMobileNumber = booking.getPatientMobileNumber();
        this.patientAddress = booking.getPatientAddress();
        this.patientId = booking.getPatientId();
        this.freeFollowUpsLeft = booking.getFreeFollowUpsLeft();
        this.freeFollowUps = booking.getFreeFollowUps();
        this.followupDate = booking.getFollowupDate();
        this.visitType = booking.getVisitType();
        this.name = booking.getName();
        this.age = booking.getAge();
        this.gender = booking.getGender();
        this.mobileNumber = booking.getMobileNumber();
        this.customerId = booking.getCustomerId();
        this.customerDeviceId = booking.getCustomerDeviceId();
        this.problem = booking.getProblem();
        this.symptomsDuration = booking.getSymptomsDuration();

        this.clinicId = booking.getClinicId();
        this.clinicName = booking.getClinicName();
        this.branchId = booking.getBranchId();
        this.branchname = booking.getBranchname();
        this.clinicDeviceId = booking.getClinicDeviceId();

        this.doctorId = booking.getDoctorId();
        this.doctorName = booking.getDoctorName();
        this.doctorDeviceId = booking.getDoctorDeviceId();
        this.doctorWebDeviceId = booking.getDoctorWebDeviceId();

        this.subServiceId = booking.getSubServiceId();
        this.subServiceName = booking.getSubServiceName();
        this.serviceDate = booking.getServiceDate();
        this.servicetime = booking.getServicetime();
        this.consultationType = booking.getConsultationType();
        this.consultationFee = booking.getConsultationFee();
        this.totalFee = booking.getTotalFee();
        this.foc = booking.getFoc();
        this.reasonForCancel = booking.getReasonForCancel();
        this.notes = booking.getNotes();

        this.reports = booking.getReports();
        this.attachments = booking.getAttachments();
        this.consentFormPdf = booking.getConsentFormPdf();
        this.prescriptionPdf = booking.getPrescriptionPdf();

        this.channelId = booking.getChannelId();
        this.bookedAt = booking.getBookedAt();
        this.status = booking.getStatus();
        this.visitCount = booking.getVisitCount();
        this.paymentType = booking.getPaymentType();
        this.paymentStatus = booking.getPaymentStatus();
        this.doctorRefCode = booking.getDoctorRefCode();
        this.consultationExpiration = booking.getConsultationExpiration();
        this.followupStatus = booking.getFollowupStatus();

        this.sittings = booking.getSittings();
        this.totalSittings = booking.getTotalSittings();
        this.pendingSittings = booking.getPendingSittings();
        this.takenSittings = booking.getTakenSittings();
        this.currentSitting = booking.getCurrentSitting();

        this.treatments = booking.getTreatments();
    }

    // --------------------- Child Booking Constructor ---------------------
    public Booking(Booking parentBooking, boolean isChild) {
        this(parentBooking); // copy all fields
        if (isChild) {
            this.bookingId = null; // will be generated by MongoDB
            this.parentBookingId = parentBooking.getBookingId();
            this.currentSitting = (parentBooking.getCurrentSitting() == null ? 1 : parentBooking.getCurrentSitting() + 1);
            this.takenSittings = (parentBooking.getTakenSittings() == null ? 0 : parentBooking.getTakenSittings() + 1);
            this.pendingSittings = (parentBooking.getPendingSittings() == null ? parentBooking.getTotalSittings() : parentBooking.getPendingSittings() - 1);
            this.status = "Confirmed";
            this.bookingType = "SITTING";
        }
    }
}
