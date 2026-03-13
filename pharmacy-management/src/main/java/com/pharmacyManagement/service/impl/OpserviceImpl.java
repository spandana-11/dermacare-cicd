package com.pharmacyManagement.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacyManagement.dto.DoctorSaveDetailsDTO;
import com.pharmacyManagement.dto.OpMedicineDTO;
import com.pharmacyManagement.dto.OpNoResponse;
import com.pharmacyManagement.dto.OpSalesRequest;
import com.pharmacyManagement.dto.OpSalesResponse;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Inventory;
import com.pharmacyManagement.entity.Medicine;
import com.pharmacyManagement.entity.OpMedicine;
import com.pharmacyManagement.entity.OpSales;
import com.pharmacyManagement.entity.PaymentEntry;
import com.pharmacyManagement.feign.DoctorFeign;
import com.pharmacyManagement.repository.InventoryRepository;
import com.pharmacyManagement.repository.MedicineRepository;
import com.pharmacyManagement.repository.OpSalesRepository;
import com.pharmacyManagement.service.Opservice;
import com.pharmacyManagement.util.DuplicateBillNoException;
import com.pharmacyManagement.util.ResourceNotFoundException;
import com.pharmacyManagement.util.ValidationException;

@Service
public class OpserviceImpl implements Opservice {

    @Autowired
    private OpSalesRepository opSalesRepository;
    
    @Autowired
    private DoctorFeign doctorFeign;
    
    @Autowired
    private MedicineRepository inventoryRepository;

    // ── FIX: inject ObjectMapper as a Spring bean instead of using new ObjectMapper() ──
    @Autowired
    private ObjectMapper objectMapper;

    private static final Logger log = LoggerFactory.getLogger(OpserviceImpl.class);

    // =========================================================================
    //  1. CREATE
    // =========================================================================
    @Override
    public ResponseEntity<Response> createOpSales(OpSalesRequest request) {
        Response res = new Response();
        log.info("Creating OP Sales with billNo: {}", request.getBillNo());

        // Duplicate bill check
        if (opSalesRepository.existsByBillNo(request.getBillNo())) {
            throw new DuplicateBillNoException(
                    "Bill number '" + request.getBillNo() + "' already exists.");
        }

        // Cross-field medicine validation
        validateMedicines(request.getMedicines());

        // Compute totals
        List<OpMedicine> medicines = toOpMedicineList(request.getMedicines());
        MedicineSummary summary    = computeSummary(medicines);

        double amountPaid = nvl(request.getAmountPaid());

        // amountPaid must not exceed finalTotal
        if (amountPaid > summary.finalTotal) {
            throw new ValidationException(
                    "Amount paid (" + amountPaid + ") cannot exceed the total bill amount ("
                    + summary.finalTotal + ").");
        }

        double due = round2(summary.finalTotal - amountPaid);

        // First PaymentEntry
        PaymentEntry firstPayment = PaymentEntry.builder()
                .amountPaid(amountPaid)
                .dueAmount(due)
                .paidAt(LocalDateTime.now())
                .build();

        List<PaymentEntry> paymentHistory = new ArrayList<>();
        paymentHistory.add(firstPayment);

        OpSales opSales = OpSales.builder()
                .billNo(request.getBillNo())
                .billDate(request.getBillDate())
                .billTime(request.getBillTime())
                .visitType(request.getVisitType())
                .opNo(request.getOpNo())
                .payCategory(request.getPayCategory())
                .patientName(request.getPatientName())
                .mobile(request.getMobile())
                .age(request.getAge())
                .sex(request.getSex())
                .consultingDoctor(request.getConsultingDoctor())
                .includeReturns(request.getIncludeReturns())
                .medicines(medicines)
                .totalAmt(summary.totalAmt)
                .avgDiscPercent(summary.avgDiscPercent)
                .totalDiscAmt(summary.totalDiscAmt)
                .totalGstAmount(summary.totalGstAmount)
                .netAmount(summary.netAmount)
                .amountPaid(amountPaid)
                .amountToBePaid(paymentHistory)
                .dueAmount(due)
                .finalTotal(summary.finalTotal)
                .clinicId(request.getClinicId())
                .branchId(request.getBranchId())
                .createdAt(LocalDateTime.now())
                .build();

        OpSales saved = opSalesRepository.save(opSales);
        log.info("OP Sales created with id: {}", saved.getId());

        OpSalesResponse opSalesResponse = toResponse(saved);
        if (opSalesResponse != null) {
            res.setMessage("OP Sales created successfully");
            res.setData(opSalesResponse);
            res.setStatus(200);
            res.setSuccess(true);
        } else {
            res.setMessage("Unable to create OP Sales");
            res.setStatus(400);
            res.setSuccess(false);
        }
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @Override
    public ResponseEntity<Response> updateOpSales(String id, OpSalesRequest request) {
        log.info("Updating OP Sales with id: {}", id);
        Response res = new Response();

        OpSales existing = opSalesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "OP Sales not found with id: " + id));

        if (!existing.getBillNo().equals(request.getBillNo())
                && opSalesRepository.existsByBillNo(request.getBillNo())) {
            throw new DuplicateBillNoException(
                    "Bill number '" + request.getBillNo() + "' already exists.");
        }

        // Cross-field medicine validation on updated medicines
        validateMedicines(request.getMedicines());

        List<OpMedicine> updatedMedicines = toOpMedicineList(request.getMedicines());
        MedicineSummary summary           = computeSummary(updatedMedicines);

        double newAmountPaid = nvl(request.getAmountPaid());

        if (newAmountPaid > summary.finalTotal) {
            throw new ValidationException(
                    "Amount paid (" + newAmountPaid + ") cannot exceed the total bill amount ("
                    + summary.finalTotal + ").");
        }

        double newDue = round2(summary.finalTotal - newAmountPaid);

        // ── Rebuild payment history: start fresh on a full update ──
        PaymentEntry updatedPayment = PaymentEntry.builder()
                .amountPaid(newAmountPaid)
                .dueAmount(newDue)
                .paidAt(LocalDateTime.now())
                .build();

        List<PaymentEntry> paymentHistory = new ArrayList<>();
        paymentHistory.add(updatedPayment);

        existing.setBillNo(request.getBillNo());
        existing.setBillDate(request.getBillDate());
        existing.setBillTime(request.getBillTime());
        existing.setVisitType(request.getVisitType());
        existing.setOpNo(request.getOpNo());
        existing.setPayCategory(request.getPayCategory());
        existing.setPatientName(request.getPatientName());
        existing.setMobile(request.getMobile());
        existing.setAge(request.getAge());
        existing.setSex(request.getSex());
        existing.setConsultingDoctor(request.getConsultingDoctor());
        existing.setIncludeReturns(request.getIncludeReturns());
        existing.setMedicines(updatedMedicines);
        existing.setTotalAmt(summary.totalAmt);
        existing.setAvgDiscPercent(summary.avgDiscPercent);
        existing.setTotalDiscAmt(summary.totalDiscAmt);
        existing.setTotalGstAmount(summary.totalGstAmount);
        existing.setNetAmount(summary.netAmount);
        existing.setAmountPaid(newAmountPaid);
        existing.setAmountToBePaid(paymentHistory);   // ── FIX: List<PaymentEntry>
        existing.setDueAmount(newDue);
        existing.setFinalTotal(summary.finalTotal);
        existing.setClinicId(request.getClinicId());
        existing.setBranchId(request.getBranchId());
        existing.setUpdatedAt(LocalDateTime.now());

        // ── FIX: save only once (original code saved twice) ──
        OpSales saved = opSalesRepository.save(existing);

        if (saved != null) {
            res.setMessage("OP Sales updated successfully");
            res.setStatus(200);
            res.setSuccess(true);
            res.setData(toResponse(saved));
        } else {
            res.setMessage("Unable to update OP Sales");
            res.setStatus(400);
            res.setSuccess(false);
        }
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================================================================
    //  3. GET ALL
    // =========================================================================
    @Override
    public ResponseEntity<Response> getAllOpSales(String clinicId, String branchId) {
        Response res = new Response();
        log.info("Fetching all OP Sales for clinicId: {}, branchId: {}", clinicId, branchId);

        List<OpSalesResponse> lst = opSalesRepository
                .findByClinicIdAndBranchId(clinicId, branchId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        if (!lst.isEmpty()) {
            res.setMessage("OP Sales retrieved successfully");
            res.setStatus(200);
            res.setData(lst);
            res.setSuccess(true);
        } else {
            res.setMessage("Unable to retrieve OP Sales");
            res.setStatus(404);
            res.setSuccess(false);
        }
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================================================================
    //  4a. GET BY BILL NO
    // =========================================================================
    @Override
    public ResponseEntity<Response> getByBillNo(String billNo) {
        Response res = new Response();
        log.info("Fetching OP Sales by billNo: {}", billNo);

        OpSalesResponse ops = toResponse(
                opSalesRepository.findByBillNo(billNo)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "OP Sales not found with billNo: " + billNo)));

        if (ops != null) {
            res.setMessage("OP Sales retrieved successfully");
            res.setStatus(200);
            res.setData(ops);
            res.setSuccess(true);
        } else {
            res.setMessage("Unable to retrieve OP Sales");
            res.setStatus(404);
            res.setSuccess(false);
        }
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================================================================
    //  4b. GET BY ID
    // =========================================================================
    @Override
    public ResponseEntity<Response> getById(String id) {
        Response res = new Response();
        log.info("Fetching OP Sales by id: {}", id);

        OpSalesResponse ops = toResponse(
                opSalesRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "OP Sales not found with id: " + id)));

        if (ops != null) {
            res.setMessage("OP Sales retrieved successfully");
            res.setStatus(200);
            res.setData(ops);
            res.setSuccess(true);
        } else {
            res.setMessage("Unable to retrieve OP Sales");
            res.setStatus(404);
            res.setSuccess(false);
        }
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================================================================
    //  5. GET BY OPNO
    // =========================================================================
    @Override
    public ResponseEntity<Response> getByOpNo(String clinicId, String branchId, String opNo) {
        Response res = new Response();
        log.info("Fetching by opNo: {}, clinicId: {}, branchId: {}", opNo, clinicId, branchId);
        try {
        DoctorSaveDetailsDTO doctorSaveDetailsDTO = doctorFeign.getDoctorSaveDetails(opNo).getBody();
        System.out.println(doctorSaveDetailsDTO);
        List<String> lst = doctorSaveDetailsDTO.getPrescription().getMedicines().stream().map(n->n.getId()).toList();
        List<Medicine> lt = new ArrayList<>();
        for(String s : lst) {
         Medicine invent = inventoryRepository.findById(s).get();
        lt.add(invent);}
        if(lt.isEmpty()) {
            res.setMessage("OP Sales Not Found with OpNo");
            res.setStatus(404);
            res.setSuccess(false);
        }else {       
        res.setMessage("OP Sales Found with OpNo");
        res.setStatus(200);
        res.setData(lt);
        res.setSuccess(true);
        }}catch(Exception e) {}
        return ResponseEntity.status(res.getStatus()).body(res);}
  

    // =========================================================================
    //  6. DELETE
    // =========================================================================
    @Override
    public ResponseEntity<Response> deleteOpSales(String clinicId, String branchId, String id) {
        Response res = new Response();
        log.info("Deleting OP Sales id: {}, clinicId: {}, branchId: {}", id, clinicId, branchId);

        OpSales opSales = opSalesRepository
                .findByIdAndClinicIdAndBranchId(id, clinicId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "OP Sales not found with id: " + id + " for clinic/branch"));

        opSalesRepository.delete(opSales);
        res.setMessage("OP Sales Deleted Successfully");
        res.setStatus(200);
        res.setSuccess(true);
        log.info("OP Sales deleted with id: {}", id);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================================================================
    //  7. FILTER
    // =========================================================================
    @Override
    public ResponseEntity<Response> filterOpSales(String clinicId, String branchId,
            String billNo, String patientName,
            String mobile, String consultingDoctor,
            String fromDate, String toDate) {

        Response res = new Response();
        log.info("Filtering OP Sales for clinicId: {}, branchId: {}", clinicId, branchId);

        List<OpSales> rawList = opSalesRepository
                .findByClinicIdAndBranchIdAndBillNoContainingIgnoreCaseAndPatientNameContainingIgnoreCaseAndMobileAndConsultingDoctorContainingIgnoreCase(
                        isPresent(clinicId)         ? clinicId         : "",
                        isPresent(branchId)         ? branchId         : "",
                        isPresent(billNo)           ? billNo           : "",
                        isPresent(patientName)      ? patientName      : "",
                        isPresent(mobile)           ? mobile           : "",
                        isPresent(consultingDoctor) ? consultingDoctor : "");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate from = isPresent(fromDate) ? LocalDate.parse(fromDate, formatter) : null;
        LocalDate to   = isPresent(toDate)   ? LocalDate.parse(toDate,   formatter) : null;

        List<OpSalesResponse> lst = rawList.stream()
                .filter(sale -> {
                    if (sale.getBillDate() == null) return false;
                    LocalDate billDate = LocalDate.parse(sale.getBillDate(), formatter);
                    if (from != null && billDate.isBefore(from)) return false;
                    if (to   != null && billDate.isAfter(to))    return false;
                    return true;
                })
                .map(this::toResponse)
                .collect(Collectors.toList());

        if (!lst.isEmpty()) {
            res.setMessage("OP Sales retrieved successfully");
            res.setStatus(200);
            res.setData(lst);
            res.setSuccess(true);
        } else {
            res.setMessage("Unable to retrieve OP Sales");
            res.setStatus(404);
            res.setSuccess(false);
        }
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================================================================
    //  CROSS-FIELD MEDICINE VALIDATION
    // =========================================================================
    private void validateMedicines(List<OpMedicineDTO> medicines) {
        if (medicines == null || medicines.isEmpty()) return;

        final double TOLERANCE = 0.02;

        for (int i = 0; i < medicines.size(); i++) {
            OpMedicineDTO m = medicines.get(i);
            String prefix   = "Medicine[" + i + "] (" + m.getMedicineName() + "): ";

            double qty         = m.getQty()       != null ? m.getQty() : 0;
            double rate        = nvl(m.getRate());
            double totalA      = nvl(m.getTotalA());
            double discPercent = nvl(m.getDiscPercent());
            double discAmtB    = nvl(m.getDiscAmtB());
            double netAmtAB    = nvl(m.getNetAmtAB());
            double gstPercent  = nvl(m.getGstPercent());
            double gstAmtC     = nvl(m.getGstAmtC());
            double finalAmt    = nvl(m.getFinalAmountABC());

            // totalA = qty × rate
            double expectedTotalA = round2(qty * rate);
            if (Math.abs(totalA - expectedTotalA) > TOLERANCE)
                throw new ValidationException(prefix + "totalA (" + totalA
                        + ") does not match qty × rate (" + expectedTotalA + ").");

            // discAmtB = -(totalA × discPercent / 100)
            double expectedDiscAmt = round2(-(totalA * discPercent / 100.0));
            if (Math.abs(discAmtB - expectedDiscAmt) > TOLERANCE)
                throw new ValidationException(prefix + "discAmtB (" + discAmtB
                        + ") does not match -(totalA × discPercent/100) (" + expectedDiscAmt + ").");

            // netAmtAB = totalA + discAmtB
            double expectedNetAmt = round2(totalA + discAmtB);
            if (Math.abs(netAmtAB - expectedNetAmt) > TOLERANCE)
                throw new ValidationException(prefix + "netAmtAB (" + netAmtAB
                        + ") does not match totalA + discAmtB (" + expectedNetAmt + ").");

            // gstAmtC = netAmtAB × gstPercent / 100
            double expectedGstAmt = round2(netAmtAB * gstPercent / 100.0);
            if (Math.abs(gstAmtC - expectedGstAmt) > TOLERANCE)
                throw new ValidationException(prefix + "gstAmtC (" + gstAmtC
                        + ") does not match netAmtAB × gstPercent/100 (" + expectedGstAmt + ").");

            // finalAmountABC = netAmtAB + gstAmtC
            double expectedFinal = round2(netAmtAB + gstAmtC);
            if (Math.abs(finalAmt - expectedFinal) > TOLERANCE)
                throw new ValidationException(prefix + "finalAmountABC (" + finalAmt
                        + ") does not match netAmtAB + gstAmtC (" + expectedFinal + ").");
        }
    }

    // =========================================================================
    //  PRIVATE HELPERS
    // =========================================================================
    private MedicineSummary computeSummary(List<OpMedicine> medicines) {
        MedicineSummary s = new MedicineSummary();
        if (medicines == null || medicines.isEmpty()) return s;

        double sumDiscPercent = 0;
        for (OpMedicine m : medicines) {
            s.totalAmt       += nvl(m.getTotalA());
            s.totalDiscAmt   += Math.abs(nvl(m.getDiscAmtB()));
            s.totalGstAmount += nvl(m.getGstAmtC());
            s.finalTotal     += nvl(m.getFinalAmountABC());
            sumDiscPercent   += nvl(m.getDiscPercent());
        }
        s.netAmount      = s.totalAmt - s.totalDiscAmt;
        s.avgDiscPercent = sumDiscPercent / medicines.size();

        s.totalAmt       = round2(s.totalAmt);
        s.totalDiscAmt   = round2(s.totalDiscAmt);
        s.totalGstAmount = round2(s.totalGstAmount);
        s.netAmount      = round2(s.netAmount);
        s.avgDiscPercent = round2(s.avgDiscPercent);
        s.finalTotal     = round2(s.finalTotal);
        return s;
    }

    private OpSalesResponse toResponse(OpSales o) {
        return OpSalesResponse.builder()
                .id(o.getId())
                .billNo(o.getBillNo())
                .billDate(o.getBillDate())
                .billTime(o.getBillTime())
                .visitType(o.getVisitType())
                .opNo(o.getOpNo())
                .payCategory(o.getPayCategory())
                .patientName(o.getPatientName())
                .mobile(o.getMobile())
                .age(o.getAge())
                .sex(o.getSex())
                .consultingDoctor(o.getConsultingDoctor())
                .includeReturns(o.getIncludeReturns())
                .medicines(objectMapper.convertValue(
                        o.getMedicines(), new TypeReference<List<OpMedicineDTO>>() {}))
                .totalAmt(o.getTotalAmt())
                .avgDiscPercent(o.getAvgDiscPercent())
                .totalDiscAmt(o.getTotalDiscAmt())
                .totalGstAmount(o.getTotalGstAmount())
                .netAmount(o.getNetAmount())
                .amountPaid(o.getAmountPaid())
                .amountToBePaid(o.getAmountToBePaid())   // List<PaymentEntry>
                .dueAmount(o.getDueAmount())
                .finalTotal(o.getFinalTotal())
                .clinicId(o.getClinicId())
                .branchId(o.getBranchId())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }

    private List<OpMedicine> toOpMedicineList(List<OpMedicineDTO> dtos) {
        return objectMapper.convertValue(dtos, new TypeReference<List<OpMedicine>>() {});
    }

    private double nvl(Double val)      { return val != null ? val : 0.0; }
    private double round2(double val)   { return Math.round(val * 100.0) / 100.0; }
    private boolean isPresent(String s) { return s != null && !s.isBlank(); }

    private static class MedicineSummary {
        double totalAmt = 0, avgDiscPercent = 0, totalDiscAmt = 0;
        double totalGstAmount = 0, netAmount = 0, finalTotal = 0;
    }
}