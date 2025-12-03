package com.clinicadmin.feignclient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.clinicadmin.dto.AreaDTO;
import com.clinicadmin.dto.CityDTO;
import com.clinicadmin.dto.MedicineDetailDTO;
import com.clinicadmin.dto.PurchaseBillDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.SupplierDTO;
@FeignClient(name = "pharmacy-management")
public interface PharmacyManagementFeignClient {

    @PostMapping("/api/pharmacy/area/save")
    Response saveArea(@RequestBody AreaDTO dto);

    @PutMapping("/api/pharmacy/area/update/{id}")
    Response updateArea(@PathVariable String id, @RequestBody AreaDTO dto);

    @GetMapping("/api/pharmacy/area/getById/{id}")
    Response getAreaById(@PathVariable String id);

    @GetMapping("/api/pharmacy/area/all")
    Response getAllAreas();

    @DeleteMapping("/api/pharmacy/area/delete/{id}")
    Response deleteArea(@PathVariable String id);

    @GetMapping("/api/pharmacy/area/city/{cityId}")
    Response getAreasByCity(@PathVariable String cityId);
    
    //// ========== CITY APIs ========== ////    

    // SAVE CITY
    @PostMapping("/api/pharmacy/city/save")
    Response saveCity(@RequestBody CityDTO dto);

    // UPDATE CITY
    @PutMapping("/api/pharmacy/city/update/{id}")
    Response updateCity(@PathVariable String id, @RequestBody CityDTO dto);

    // GET CITY BY ID
    @GetMapping("/api/pharmacy/city/getById/{id}")
    Response getCityById(@PathVariable String id);

    // GET ALL CITIES
    @GetMapping("/api/pharmacy/city/all")
    Response getAllCities();

    // DELETE CITY
    @DeleteMapping("/api/pharmacy/city/delete/{id}")
    Response deleteCity(@PathVariable String id);
    
    
    
 // ==================== PURCHASE BILL APIs ====================

 // SAVE
 @PostMapping("/api/pharmacy/purchase/save")
 Response savePurchase(@RequestBody PurchaseBillDTO dto);

 // UPDATE
 @PutMapping("/api/pharmacy/purchase/update/{id}")
 Response updatePurchase(@PathVariable String id, @RequestBody PurchaseBillDTO dto);

 // GET BY ID
 @GetMapping("/api/pharmacy/purchase/getById/{id}")
 Response getPurchaseById(@PathVariable String id);

 // GET BY BILL NO
 @GetMapping("/api/pharmacy/purchase/getByBillNo/{billNo}")
 Response getPurchaseByBillNo(@PathVariable String billNo);

 // GET ALL
 @GetMapping("/api/pharmacy/purchase/all")
 Response getAllPurchases();

 // DELETE
 @DeleteMapping("/api/pharmacy/purchase/delete/{id}")
 Response deletePurchase(@PathVariable String id);

 // SEARCH BY DATE RANGE
 @GetMapping("/api/pharmacy/purchase/search/date/{fromDate}/{toDate}")
 Response getByDateRange(@PathVariable String fromDate, @PathVariable String toDate);



//==================== SUPPLIER APIs ====================

@PostMapping("/api/pharmacy/supplier/add")
Response addSupplier(@RequestBody SupplierDTO dto);

@PutMapping("/api/pharmacy/supplier/update/{supplierId}")
Response updateSupplier(@PathVariable String supplierId, @RequestBody SupplierDTO dto);

@GetMapping("/api/pharmacy/supplier/get/{supplierId}")
Response getSupplierById(@PathVariable String supplierId);

@GetMapping("/api/pharmacy/supplier/getAll")
Response getAllSuppliers();

@DeleteMapping("/api/pharmacy/supplier/delete/{supplierId}")
Response deleteSupplier(@PathVariable String supplierId);


////////////////MedicanDetails/////////////////
@PostMapping("/api/pharmacy/medicine/addMedicine")
Response addMedicine(@RequestBody MedicineDetailDTO dto);

@GetMapping("/api/pharmacy/medicine/getMedicineById/{id}")
Response getMedicineById(@PathVariable String id);

@GetMapping("/api/pharmacy/medicine/getAllMedicines")
Response getAllMedicines();

@PutMapping("/api/pharmacy/medicine/updateMedicineById/{id}")
Response updateMedicine(@PathVariable String id, @RequestBody MedicineDetailDTO dto);

@DeleteMapping("/api/pharmacy/medicine/deleteMedicineById/{id}")
Response deleteMedicine(@PathVariable String id);
}


    

