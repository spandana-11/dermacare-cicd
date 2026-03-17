package com.pharmacyManagement.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.ReturnBillDTO;
import com.pharmacyManagement.dto.ReturnItemDTO;
import com.pharmacyManagement.entity.ReturnBill;
import com.pharmacyManagement.entity.ReturnItem;
import com.pharmacyManagement.repository.ReturnBillRepository;
import com.pharmacyManagement.service.ReturnBillService;
import com.pharmacyManagement.util.Counter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReturnBillServiceImpl implements ReturnBillService {

	@Autowired
    private  ReturnBillRepository repository;
	@Autowired
    private  MongoTemplate mongoTemplate;

    // =========================
    // ✅ CREATE
    // =========================
    @Override
    public Response createReturnBill(ReturnBillDTO dto) {

        Response res = new Response();

        try {

            String receiptNo = generateReceiptNo(dto.getSupplierName());

            ReturnBill entity = mapToEntity(dto, receiptNo);

            repository.save(entity);

            ReturnBillDTO responseDTO = mapToDTO(entity);

            res.setSuccess(true);
            res.setMessage("Stock return created successfully");
            res.setStatus(HttpStatus.OK.value());
            res.setData(responseDTO);

        } catch (Exception e) {

            res.setSuccess(false);
            res.setMessage("Error: " + e.getMessage());
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }

        return res;
    }

    // =========================
    // ✅ GET BY ID
    // =========================
    @Override
    public Response getByreceiptNo(String receiptNo) {

        Response res = new Response();

        try {

            Optional<ReturnBill> optional = repository.findById(receiptNo);

            if (optional.isEmpty()) {

                res.setSuccess(false);
                res.setMessage("Return bill not found with receiptNo: " + receiptNo);
                res.setStatus(HttpStatus.NOT_FOUND.value());
                return res;
            }

            ReturnBillDTO dto = mapToDTO(optional.get());

            res.setSuccess(true);
            res.setMessage("Fetched successfully");
            res.setStatus(HttpStatus.OK.value());
            res.setData(dto);

        } catch (Exception e) {

            res.setSuccess(false);
            res.setMessage("Error: " + e.getMessage());
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }

        return res;
    }

    // =========================
    // ✅ GET BY CLINIC + BRANCH
    // =========================
    @Override
    public Response getByClinicIdAndBranchId(String clinicId, String branchId) {

        Response res = new Response();

        try {

            List<ReturnBill> list = repository.findByClinicIdAndBranchId(clinicId, branchId);

            if (list.isEmpty()) {

                res.setSuccess(false);
                res.setMessage("No data found");
                res.setStatus(HttpStatus.NOT_FOUND.value());
                return res;
            }

            List<ReturnBillDTO> dtoList = list.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            res.setSuccess(true);
            res.setMessage("Fetched successfully");
            res.setStatus(HttpStatus.OK.value());
            res.setData(dtoList);

        } catch (Exception e) {

            res.setSuccess(false);
            res.setMessage("Error: " + e.getMessage());
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }

        return res;
    }

    // =========================
    // ✅ DELETE
    // =========================
    @Override
    public Response deleteByreceiptNo(String receiptNo) {

        Response res = new Response();

        try {

            Optional<ReturnBill> optional = repository.findById(receiptNo);

            if (optional.isEmpty()) {

                res.setSuccess(false);
                res.setMessage("Return bill not found with receiptNo: " + receiptNo);
                res.setStatus(HttpStatus.NOT_FOUND.value());
                return res;
            }

            repository.deleteById(receiptNo);

            res.setSuccess(true);
            res.setMessage("Return bill deleted successfully");
            res.setStatus(HttpStatus.OK.value());

        } catch (Exception e) {

            res.setSuccess(false);
            res.setMessage("Error: " + e.getMessage());
            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }

        return res;
    }

    // =========================================================
    // 🔥 REUSABLE METHODS (IMPORTANT)
    // =========================================================

    // ✅ Generate Receipt No
    private String generateReceiptNo(String supplierName) {

        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String name = supplierName.replaceAll("\\s+", "").toUpperCase();

        String prefix = name.length() >= 3
                ? name.substring(0, 3)
                : String.format("%-3s", name).replace(' ', 'X');

        Query query = new Query(Criteria.where("_id").is(date));
        Update update = new Update().inc("seq", 1);

        FindAndModifyOptions options = new FindAndModifyOptions()
                .returnNew(true)
                .upsert(true);

        Counter counter = mongoTemplate.findAndModify(query, update, options, Counter.class);

        long seq = (counter != null) ? counter.getSeq() : 1;

        return prefix + "-" + date + "-" + String.format("%04d", seq);
    }

    // ✅ DTO → ENTITY
    private ReturnBill mapToEntity(ReturnBillDTO dto, String receiptNo) {

        ReturnBill entity = new ReturnBill();

        entity.setReceiptNo(receiptNo);
        entity.setBillNo(dto.getBillNo());
        entity.setSupplierName(dto.getSupplierName());
        entity.setSupplierId(dto.getSupplierId());
        entity.setReturnType(dto.getReturnType());
        entity.setRefundMode(dto.getRefundMode());
        entity.setClinicId(dto.getClinicId());
        entity.setBranchId(dto.getBranchId());
        entity.setDate(LocalDateTime.now());
        entity.setCreatedBy(dto.getCreatedBy());

        List<ReturnItem> items = dto.getItems().stream().map(i -> {

            ReturnItem item = new ReturnItem();

            item.setProductId(i.getProductId());
            item.setProductName(i.getProductName());
            item.setBatchNo(i.getBatchNo());
            item.setReturnQty(i.getReturnQty());
            item.setNetRate(i.getNetRate());
            item.setMrp(i.getMrp());
            item.setReason(i.getReason());
            item.setAvailableStock(i.getAvailableStock());

            double returnAmount = i.getReturnQty() * i.getNetRate();
            item.setReturnAmount(returnAmount);

            return item;

        }).collect(Collectors.toList());

        entity.setItems(items);

        double totalAmount = items.stream()
                .mapToDouble(ReturnItem::getReturnAmount)
                .sum();

        entity.setTotalAmount(totalAmount);

        return entity;
    }

    // ✅ ENTITY → DTO
    private ReturnBillDTO mapToDTO(ReturnBill entity) {

        ReturnBillDTO dto = new ReturnBillDTO();

        dto.setReceiptNo(entity.getReceiptNo());
        dto.setBillNo(entity.getBillNo());
        dto.setSupplierName(entity.getSupplierName());
        dto.setSupplierId(entity.getSupplierId());
        dto.setReturnType(entity.getReturnType());
        dto.setRefundMode(entity.getRefundMode());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setClinicId(entity.getClinicId());
        dto.setBranchId(entity.getBranchId());
        dto.setDate(LocalDateTime.now());
        dto.setCreatedBy(entity.getCreatedBy());

        List<ReturnItemDTO> items = entity.getItems().stream().map(it -> {

            ReturnItemDTO d = new ReturnItemDTO();

            d.setProductId(it.getProductId());
            d.setProductName(it.getProductName());
            d.setBatchNo(it.getBatchNo());
            d.setReturnQty(it.getReturnQty());
            d.setNetRate(it.getNetRate());
            d.setMrp(it.getMrp());
            d.setReturnAmount(it.getReturnAmount());
            d.setReason(it.getReason());
            d.setAvailableStock(it.getAvailableStock());

            return d;

        }).collect(Collectors.toList());

        dto.setItems(items);

        return dto;
    }
}