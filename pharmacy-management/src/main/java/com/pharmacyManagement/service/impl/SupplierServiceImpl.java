package com.pharmacyManagement.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.SupplierDTO;
import com.pharmacyManagement.entity.Supplier;
import com.pharmacyManagement.repository.SupplierRepository;
import com.pharmacyManagement.service.SupplierService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

	private static final Logger log = LoggerFactory.getLogger(SupplierServiceImpl.class);

	private final SupplierRepository supplierRepository;

	// ---------------------------------------------------------
	// CREATE SUPPLIER
	// ---------------------------------------------------------
	@Override
	public Response addSupplier(SupplierDTO dto) {

		log.info("Request received to add supplier: {}", dto);

		Response response = new Response();

		try {
			// ------------------------------ VALIDATIONS ------------------------------
			if (dto == null) {
				response.setSuccess(false);
				response.setMessage("Supplier details cannot be null");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				log.error("Supplier DTO is null");
				return response;
			}

			if (dto.getSupplierName() == null || dto.getSupplierName().trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Supplier name is required");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				log.warn("Supplier name missing");
				return response;
			}

			if (dto.getContactNumber() == null || dto.getContactNumber().trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Contact number is required");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				log.warn("Supplier contact number missing");
				return response;
			}

			// ------------------------------ DUPLICATE CHECKS
			// ------------------------------

			// Duplicate Supplier Name
			boolean supplierNameExists = supplierRepository.existsBySupplierNameIgnoreCase(dto.getSupplierName());

			if (supplierNameExists) {
				response.setSuccess(false);
				response.setMessage("Supplier name already exists: " + dto.getSupplierName());
				response.setStatus(HttpStatus.CONFLICT.value());
				log.warn("Duplicate supplier name attempt: {}", dto.getSupplierName());
				return response;
			}

			// Duplicate Mobile Number
			boolean mobileExists = supplierRepository.existsByContactNumber(dto.getContactNumber());

			if (mobileExists) {
				response.setSuccess(false);
				response.setMessage("Mobile number already exists: " + dto.getContactNumber());
				response.setStatus(HttpStatus.CONFLICT.value());
				log.warn("Duplicate mobile number attempt: {}", dto.getContactNumber());
				return response;
			}

			// ------------------------------ SAVE SUPPLIER ------------------------------
			Supplier supplier = mapToEntity(dto);
			supplierRepository.save(supplier);

			log.info("Supplier added successfully: {}", supplier.getSupplierId());

			response.setSuccess(true);
			response.setMessage("Supplier added successfully");
			response.setData(mapToDTO(supplier));
			response.setStatus(HttpStatus.CREATED.value());

		} catch (Exception ex) {
			log.error("Error while adding supplier", ex);
			response.setSuccess(false);
			response.setMessage("An error occurred while adding supplier");
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	// ---------------------------------------------------------
	// UPDATE SUPPLIER
	// ---------------------------------------------------------
	@Override
	public Response updateSupplier(String supplierId, SupplierDTO dto) {

		log.info("Request received to update supplier: {}", supplierId);

		Response response = new Response();

		try {
			if (supplierId == null || supplierId.isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Supplier ID cannot be null or empty");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				log.warn("Supplier ID missing");
				return response;
			}

			Supplier existing = supplierRepository.findById(supplierId).orElse(null);

			if (existing == null) {
				response.setSuccess(false);
				response.setMessage("Supplier not found with ID: " + supplierId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				log.warn("Supplier not found: {}", supplierId);
				return response;
			}

			// Update fields
			if (dto.getSupplierName() != null)
				existing.setSupplierName(dto.getSupplierName());
			if (dto.getSupplierLicenseNo() != null)
				existing.setSupplierLicenseNo(dto.getSupplierLicenseNo());
			if (dto.getGstNumber() != null)
				existing.setGstNumber(dto.getGstNumber());
			if (dto.getGstClassification() != null)
				existing.setGstClassification(dto.getGstClassification());
			if (dto.getContactNumber() != null)
				existing.setContactNumber(dto.getContactNumber());
			if (dto.getEmail() != null)
				existing.setEmail(dto.getEmail());
			if (dto.getAddress() != null)
				existing.setAddress(dto.getAddress());

			existing.setActive(dto.isActive());

			supplierRepository.save(existing);

			log.info("Supplier updated successfully: {}", supplierId);

			response.setSuccess(true);
			response.setMessage("Supplier updated successfully");
			response.setData(mapToDTO(existing));
			response.setStatus(HttpStatus.OK.value());

		} catch (Exception ex) {
			log.error("Error while updating supplier {}", supplierId, ex);
			response.setSuccess(false);
			response.setMessage("An error occurred while updating supplier");
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	// ---------------------------------------------------------
	// GET SUPPLIER BY ID
	// ---------------------------------------------------------
	@Override
	public Response getSupplierById(String supplierId) {

		log.info("Fetching supplier details for ID: {}", supplierId);

		Response response = new Response();

		try {
			if (supplierId == null || supplierId.isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Supplier ID cannot be empty");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				log.warn("Supplier ID empty");
				return response;
			}

			Supplier supplier = supplierRepository.findById(supplierId).orElse(null);

			if (supplier == null) {
				response.setSuccess(false);
				response.setMessage("Supplier not found with ID: " + supplierId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				log.warn("Supplier not found: {}", supplierId);
				return response;
			}

			log.info("Supplier found: {}", supplierId);

			response.setSuccess(true);
			response.setMessage("Supplier retrieved successfully");
			response.setData(mapToDTO(supplier));
			response.setStatus(HttpStatus.OK.value());

		} catch (Exception ex) {
			log.error("Error fetching supplier {}", supplierId, ex);
			response.setSuccess(false);
			response.setMessage("An error occurred while fetching supplier");
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	// ---------------------------------------------------------
	// GET ALL SUPPLIERS
	// ---------------------------------------------------------
	@Override
	public Response getAllSuppliers() {

		log.info("Fetching all suppliers");

		Response response = new Response();

		try {
			List<SupplierDTO> list = supplierRepository.findAll().stream().map(this::mapToDTO)
					.collect(Collectors.toList());

			response.setSuccess(true);
			response.setMessage("Suppliers fetched successfully");
			response.setData(list);
			response.setStatus(HttpStatus.OK.value());

		} catch (Exception ex) {
			log.error("Error fetching suppliers", ex);
			response.setSuccess(false);
			response.setMessage("An error occurred while fetching suppliers");
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	// ---------------------------------------------------------
	// DELETE SUPPLIER
	// ---------------------------------------------------------
	@Override
	public Response deleteSupplier(String supplierId) {

		log.info("Request received to delete supplier: {}", supplierId);

		Response response = new Response();

		try {
			if (supplierId == null || supplierId.isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Supplier ID cannot be null or empty");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				log.warn("Supplier ID missing");
				return response;
			}

			boolean exists = supplierRepository.existsById(supplierId);
			if (!exists) {
				response.setSuccess(false);
				response.setMessage("Supplier not found: " + supplierId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				log.warn("Supplier not found for deletion: {}", supplierId);
				return response;
			}

			supplierRepository.deleteById(supplierId);

			log.info("Supplier deleted: {}", supplierId);

			response.setSuccess(true);
			response.setMessage("Supplier deleted successfully");
			response.setStatus(HttpStatus.OK.value());

		} catch (Exception ex) {
			log.error("Error deleting supplier {}", supplierId, ex);
			response.setSuccess(false);
			response.setMessage("An error occurred while deleting supplier");
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	// ---------------------------------------------------------
	// MAPPING METHODS
	// ---------------------------------------------------------
	private Supplier mapToEntity(SupplierDTO dto) {
		Supplier supplier = new Supplier();
//        supplier.setSupplierId(dto.getSupplierId());
		supplier.setSupplierName(dto.getSupplierName());
		supplier.setSupplierLicenseNo(dto.getSupplierLicenseNo());
		supplier.setGstNumber(dto.getGstNumber());
		supplier.setGstClassification(dto.getGstClassification());
		supplier.setContactNumber(dto.getContactNumber());
		supplier.setEmail(dto.getEmail());
		supplier.setAddress(dto.getAddress());
		supplier.setActive(dto.isActive());
		return supplier;
	}

	private SupplierDTO mapToDTO(Supplier supplier) {
		SupplierDTO dto = new SupplierDTO();
		dto.setSupplierId(supplier.getSupplierId());
		dto.setSupplierName(supplier.getSupplierName());
		dto.setSupplierLicenseNo(supplier.getSupplierLicenseNo());
		dto.setGstNumber(supplier.getGstNumber());
		dto.setGstClassification(supplier.getGstClassification());
		dto.setContactNumber(supplier.getContactNumber());
		dto.setEmail(supplier.getEmail());
		dto.setAddress(supplier.getAddress());
		dto.setActive(supplier.isActive());
		return dto;
	}
}
