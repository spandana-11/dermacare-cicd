package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.SupplierDTO;

public interface SupplierService {

	Response addSupplier(SupplierDTO dto);

	Response updateSupplier(String supplierId, SupplierDTO dto);

	Response getSupplierById(String supplierId);

	Response getAllSuppliers();

	Response deleteSupplier(String supplierId);
}
