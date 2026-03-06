package com.pharmacyManagement.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacyManagement.dto.OpMedicineDTO;
import com.pharmacyManagement.dto.OpNoResponse;
import com.pharmacyManagement.dto.OpSalesRequest;
import com.pharmacyManagement.dto.OpSalesResponse;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.OpMedicine;
import com.pharmacyManagement.entity.OpSales;
import com.pharmacyManagement.repository.OpSalesRepository;
import com.pharmacyManagement.service.Opservice;
import com.pharmacyManagement.util.DuplicateBillNoException;
import com.pharmacyManagement.util.ResourceNotFoundException;

@Service
public class OpserviceImpl implements Opservice {
	
	@Autowired
	public OpSalesRepository opSalesRepository;
	
	
	  private static final Logger log = LoggerFactory.getLogger(OpserviceImpl.class);
	   
	   
	 public ResponseEntity<Response> createOpSales(OpSalesRequest request) {
		  Response res = new Response();
	        log.info("Creating OP Sales with billNo: {}", request.getBillNo());

	        if (opSalesRepository.existsByBillNo(request.getBillNo())) {
	            throw new DuplicateBillNoException("Bill number '" + request.getBillNo() + "' already exists.");
	        }

	        MedicineSummary summary = computeSummary(new ObjectMapper().convertValue(request.getMedicines(), new TypeReference<List<OpMedicine>>() {}));
	        double amountPaid      = nvl(request.getAmountPaid());
	        double due             = round2(summary.finalTotal - amountPaid);
	        // amountToBePaid = remaining to be collected; 0 if already paid in full
	        double amountToBePaid  = due > 0 ? due : 0.0;
	        double dueAmount       = due > 0 ? due : 0.0;

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
	                .medicines(new ObjectMapper().convertValue(request.getMedicines(), new TypeReference<List<OpMedicine>>() {}))
	                .totalAmt(summary.totalAmt)
	                .avgDiscPercent(summary.avgDiscPercent)
	                .totalDiscAmt(summary.totalDiscAmt)
	                .totalGstAmount(summary.totalGstAmount)
	                .netAmount(summary.netAmount)
	                .amountPaid(amountPaid)
	                .amountToBePaid(amountToBePaid)
	                .dueAmount(dueAmount)
	                .finalTotal(summary.finalTotal)
	                .clinicId(request.getClinicId())
	                .branchId(request.getBranchId())
	                .createdAt(LocalDateTime.now())
	                .build();

	        OpSales saved = opSalesRepository.save(opSales);
	        log.info("OP Sales created with id: {}", saved.getId());
	        OpSalesResponse opSalesResponse = toResponse(saved);
	        if(opSalesResponse != null) {
	        	res.setMessage("OP Sales created successfully");
	        	res.setData(opSalesResponse);
	        	res.setStatus(200);
	        	res.setSuccess(true);
	        }else {
	        	res.setMessage("Unable to create OP Sales");
	        	res.setStatus(400);
	        	res.setSuccess(false);
	        }
	        return ResponseEntity.status(res.getStatus()).body(res);
	    }

	    // ─────────────────────────────────────────────────────────────────────
	    // 2. UPDATE
	    // ─────────────────────────────────────────────────────────────────────
	    public ResponseEntity<Response> updateOpSales(String id, OpSalesRequest request) {
	        log.info("Updating OP Sales with id: {}", id);
	        Response res = new Response();
	        OpSales existing = opSalesRepository.findById(id)
	                .orElseThrow(() -> new ResourceNotFoundException("OP Sales not found with id: " + id));

	        if (!existing.getBillNo().equals(request.getBillNo())
	                && opSalesRepository.existsByBillNo(request.getBillNo())) {
	            throw new DuplicateBillNoException("Bill number '" + request.getBillNo() + "' already exists.");
	        }

	        MedicineSummary summary = computeSummary(new ObjectMapper().convertValue(request.getMedicines(), new TypeReference<List<OpMedicine>>() {}));
	        double amountPaid     = nvl(request.getAmountPaid());
	        double due            = round2(summary.finalTotal - amountPaid);
	        double amountToBePaid = due > 0 ? due : 0.0;
	        double dueAmount      = due > 0 ? due : 0.0;
	        LocalDateTime now     = LocalDateTime.now();

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
	        existing.setMedicines(new ObjectMapper().convertValue(request.getMedicines(), new TypeReference<List<OpMedicine>>() {}));
	        existing.setTotalAmt(summary.totalAmt);
	        existing.setAvgDiscPercent(summary.avgDiscPercent);
	        existing.setTotalDiscAmt(summary.totalDiscAmt);
	        existing.setTotalGstAmount(summary.totalGstAmount);
	        existing.setNetAmount(summary.netAmount);
	        existing.setAmountPaid(amountPaid);
	        existing.setAmountToBePaid(amountToBePaid);
	        existing.setDueAmount(dueAmount);
	        existing.setFinalTotal(summary.finalTotal);
	        existing.setClinicId(request.getClinicId());
	        existing.setBranchId(request.getBranchId());
	        existing.setUpdatedAt(now);
	        opSalesRepository.save(existing);
	        if(opSalesRepository.save(existing) != null) {
	        	res.setMessage("OP Sales updated successfully");
	        	res.setStatus(200);
	        	res.setSuccess(true);
	        }else {
	        	res.setMessage("Unable to update OP Sales");
	        	res.setStatus(400);
	        	res.setSuccess(false);
	        }
	        return ResponseEntity.status(res.getStatus()).body(res);
	    }

	    // ─────────────────────────────────────────────────────────────────────
	    // 3. GET ALL
	    // ─────────────────────────────────────────────────────────────────────
	    public ResponseEntity<Response> getAllOpSales(String clinicId, String branchId) {
	    	  Response res = new Response();
	    	log.info("Fetching all OP Sales for clinicId: {}, branchId: {}", clinicId, branchId);
	        List<OpSalesResponse> lst = opSalesRepository.findByClinicIdAndBranchId(clinicId, branchId)
	                .stream().map(this::toResponse).collect(Collectors.toList());
	        if(!lst.isEmpty()) {
	        	res.setMessage("OP Sales retrieved successfully");
	        	res.setStatus(200);
	        	res.setData(lst);
	        	res.setSuccess(true);
	        }else {
	        	res.setMessage("Unable to retrieve OP Sales");
	        	res.setStatus(404);
	        	res.setSuccess(false);
	        }
	        return ResponseEntity.status(res.getStatus()).body(res);
	     }

	    // ─────────────────────────────────────────────────────────────────────
	    // 4a. GET BY BILL NO
	    // ─────────────────────────────────────────────────────────────────────
	    public ResponseEntity<Response> getByBillNo(String billNo) {
	    	  Response res = new Response();
	    	log.info("Fetching OP Sales by billNo: {}", billNo);
	        OpSalesResponse ops =  toResponse(opSalesRepository.findByBillNo(billNo)
	                .orElseThrow(() -> new ResourceNotFoundException("OP Sales not found with billNo: " + billNo)));
	        if(ops!= null) {
	        	res.setMessage("OP Sales retrieved successfully");
	        	res.setStatus(200);
	        	res.setData(ops);
	        	res.setSuccess(true);
	        }else {
	        	res.setMessage("Unable to retrieve OP Sales");
	        	res.setStatus(404);
	        	res.setSuccess(false);
	        }
	        return ResponseEntity.status(res.getStatus()).body(res);
	    }

	    // ─────────────────────────────────────────────────────────────────────
	    // 4b. GET BY ID
	    // ─────────────────────────────────────────────────────────────────────
	    public ResponseEntity<Response> getById(String id) {
	    	  Response res = new Response();
	    	log.info("Fetching OP Sales by id: {}", id);
	        OpSalesResponse ops = toResponse(opSalesRepository.findById(id)
	                .orElseThrow(() -> new ResourceNotFoundException("OP Sales not found with id: " + id)));
	        if(ops!= null) {
	        	res.setMessage("OP Sales retrieved successfully");
	        	res.setStatus(200);
	        	res.setData(ops);
	        	res.setSuccess(true);
	        }else {
	        	res.setMessage("Unable to retrieve OP Sales");
	        	res.setStatus(404);
	        	res.setSuccess(false);
	        }
	        return ResponseEntity.status(res.getStatus()).body(res);
	    }

	    // ─────────────────────────────────────────────────────────────────────
	    // 5. GET BY OPNO
	    // ─────────────────────────────────────────────────────────────────────
	    public ResponseEntity<Response> getByOpNo(String clinicId, String branchId, String opNo) {
	    	  Response res = new Response();
	    	log.info("Fetching by opNo: {}, clinicId: {}, branchId: {}", opNo, clinicId, branchId);

	        boolean exists = opSalesRepository.existsByOpNoAndClinicIdAndBranchId(opNo, clinicId, branchId);

	        if (!exists) {
	        	OpNoResponse opNoResponse = OpNoResponse.builder()
	                    .opNo(opNo)
	                    .visitType("new")
	                    .medicines(new ArrayList<>())
	                    .clinicId(clinicId)
	                    .branchId(branchId)
	                    .build();
	        	res.setMessage("OP Sales Not Found with OpNo");
	        	res.setStatus(404);
	        	res.setData(opNoResponse);
	        	res.setSuccess(false);
	        	 return ResponseEntity.status(res.getStatus()).body(res);
	        }

	        OpSales latest = opSalesRepository
	                .findTopByOpNoAndClinicIdAndBranchIdOrderByCreatedAtDesc(opNo, clinicId, branchId)
	                .orElseThrow(() -> new ResourceNotFoundException("No record found for opNo: " + opNo));
	       List<OpMedicineDTO> op =  new ObjectMapper().convertValue(latest.getMedicines(), new TypeReference<List<OpMedicineDTO>>() {});
	   	OpNoResponse opNoResponse = OpNoResponse.builder()
	                .opNo(latest.getOpNo())
	                .visitType("existing")
	                .patientName(latest.getPatientName())
	                .mobile(latest.getMobile())
	                .age(latest.getAge())
	                .sex(latest.getSex())
	                .medicines(latest.getMedicines() != null ? op: new ArrayList<>())
	                .clinicId(clinicId)
	                .branchId(branchId)
	                .build();
	   	res.setMessage("OP Sales Found with OpNo");
    	res.setStatus(200);
    	res.setData(opNoResponse);
    	res.setSuccess(true);
    	 return ResponseEntity.status(res.getStatus()).body(res);
	    }

	    // ─────────────────────────────────────────────────────────────────────
	    // 6. DELETE
	    // ─────────────────────────────────────────────────────────────────────
	    public ResponseEntity<Response> deleteOpSales(String clinicId, String branchId, String id) {
	    	  Response res = new Response();
	    	log.info("Deleting OP Sales id: {}, clinicId: {}, branchId: {}", id, clinicId, branchId);
	        OpSales opSales = opSalesRepository.findByIdAndClinicIdAndBranchId(id, clinicId, branchId)
	                .orElseThrow(() -> new ResourceNotFoundException(
	                        "OP Sales not found with id: " + id + " for clinic/branch"));
	           opSalesRepository.delete(opSales);
	        	res.setMessage("OP Sales Deleted Successfully");
	        	res.setStatus(200);
	        	res.setSuccess(true);
	        	log.info("OP Sales deleted with id: {}", id);
	        	 return ResponseEntity.status(res.getStatus()).body(res);
	        }
	        

	    // ─────────────────────────────────────────────────────────────────────
	    // 7. FILTER
	    // ─────────────────────────────────────────────────────────────────────
public ResponseEntity<Response> filterOpSales(String clinicId, String branchId,
                String billNo, String patientName,
                String mobile, String consultingDoctor,
                String fromDate, String toDate) {
	  Response res = new Response();
log.info("Filtering OP Sales for clinicId: {}, branchId: {}", clinicId, branchId);

// Step 1: Fetch from repository using field-based query
List<OpSales> rawList = opSalesRepository
.findByClinicIdAndBranchIdAndBillNoContainingIgnoreCaseAndPatientNameContainingIgnoreCaseAndMobileAndConsultingDoctorContainingIgnoreCase(
isPresent(clinicId)          ? clinicId          : "",
isPresent(branchId)          ? branchId          : "",
isPresent(billNo)            ? billNo            : "",
isPresent(patientName)       ? patientName       : "",
isPresent(mobile)            ? mobile            : "",
isPresent(consultingDoctor)  ? consultingDoctor  : ""
);

// Step 2: Parse dates for in-memory filtering
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // adjust pattern as needed
LocalDate from = isPresent(fromDate) ? LocalDate.parse(fromDate, formatter) : null;
LocalDate to   = isPresent(toDate)   ? LocalDate.parse(toDate,   formatter) : null;
////System.out.println(rawList);
// Step 3: Filter by date range in-memory
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
	///System.out.println(lst);
// Step 4: Build response
if (!lst.isEmpty()) {
res.setMessage("OP Sales retrieved successfully");
res.setStatus(200);
res.setData(lst);
res.setSuccess(true);
return ResponseEntity.status(res.getStatus()).body(res);
} else {
res.setMessage("Unable to retrieve OP Sales");
res.setStatus(404);
res.setSuccess(false);
return ResponseEntity.status(res.getStatus()).body(res);
}
}

	    // ─────────────────────────────────────────────────────────────────────
	    // PRIVATE HELPERS
	    // ─────────────────────────────────────────────────────────────────────

	    /**
	     * Computes all financial summary fields from the medicines list.
	     * totalAmt        = sum of totalA  (qty * rate)
	     * totalDiscAmt    = sum of |discAmtB|
	     * totalGstAmount  = sum of gstAmtC
	     * netAmount       = totalAmt - totalDiscAmt
	     * finalTotal      = sum of finalAmountABC
	     * avgDiscPercent  = average of discPercent across all medicines
	     */
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

	        // Round all to 2 decimal places
	        s.totalAmt       = round2(s.totalAmt);
	        s.totalDiscAmt   = round2(s.totalDiscAmt);
	        s.totalGstAmount = round2(s.totalGstAmount);
	        s.netAmount      = round2(s.netAmount);
	        s.avgDiscPercent = round2(s.avgDiscPercent);
	        s.finalTotal     = round2(s.finalTotal);
	        return s;
	    }

	    /** Map OpSales entity → OpSalesResponse DTO */
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
	                .medicines(new ObjectMapper().convertValue(o.getMedicines(), new TypeReference<List<OpMedicineDTO>>() {}))
	                .totalAmt(o.getTotalAmt())
	                .avgDiscPercent(o.getAvgDiscPercent())
	                .totalDiscAmt(o.getTotalDiscAmt())
	                .totalGstAmount(o.getTotalGstAmount())
	                .netAmount(o.getNetAmount())
	                .amountPaid(o.getAmountPaid())
	                .amountToBePaid(o.getAmountToBePaid())
	                .dueAmount(o.getDueAmount())
	                .finalTotal(o.getFinalTotal())
	                .clinicId(o.getClinicId())
	                .branchId(o.getBranchId())
	                .createdAt(o.getCreatedAt())
	                .updatedAt(o.getUpdatedAt())
	                .build();
	    }

	    private double nvl(Double val) { return val != null ? val : 0.0; }
	    private double round2(double val) { return Math.round(val * 100.0) / 100.0; }
	    private boolean isPresent(String s) { return s != null && !s.isBlank(); }

	    private static class MedicineSummary {
	        double totalAmt = 0, avgDiscPercent = 0, totalDiscAmt = 0;
	        double totalGstAmount = 0, netAmount = 0, finalTotal = 0;
	    }

}
