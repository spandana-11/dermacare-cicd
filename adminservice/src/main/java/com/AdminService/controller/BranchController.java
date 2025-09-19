package com.AdminService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.AdminService.dto.BranchDTO;
import com.AdminService.service.BranchServiceImpl;
import com.AdminService.util.Response;

@RestController
@RequestMapping("/admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001" })
public class BranchController {

	@Autowired
	private BranchServiceImpl serviceImpl;

	@GetMapping("/getBranchById/{branchId}")
	public ResponseEntity<?> getBranchById(@PathVariable String branchId) {
		return serviceImpl.getBranchById(branchId);
	}

	@GetMapping("/getAllBranches")
	public ResponseEntity<?> getAllBranches() {
		Response response = serviceImpl.getAllBranches();
		if (response != null && response.getStatus() != 0) {
			return ResponseEntity.status(response.getStatus()).body(response);
		} else {
			return null;
		}
	}

	@PostMapping("/createBranch")
	public Response createBranch(@RequestBody BranchDTO branchDto) {
		Response response = serviceImpl.createBranch(branchDto);
		return response;
	}

	@PutMapping("/updateBranch/{branchId}")
	public Response updateBranch(@PathVariable String branchId, @RequestBody BranchDTO branchDto) {
		Response response = serviceImpl.updateBranch(branchId, branchDto);
		return response;
	}

	@DeleteMapping("/deleteBranch/{branchId}")
	public ResponseEntity<?> deleteBranch(@PathVariable String branchId) {
		Response response = serviceImpl.deleteBranch(branchId);
		if (response != null && response.getStatus() != 0) {
			return ResponseEntity.status(response.getStatus()).body(response);
		} else {
			return null;
		}
	}

	@GetMapping("/getBranchByClinicId/{clinicId}")
	public ResponseEntity<?> getBranchByClinicId(@PathVariable String clinicId) {
		return serviceImpl.getBranchByClinicId(clinicId);

	}
	
	
	@GetMapping("/getBranchByClinicAndBranchId/{clinicId}/{branchId}")
	public ResponseEntity<?> getBranchByClinicAndBranchId(@PathVariable String clinicId,
	                                                      @PathVariable String branchId) {
	    return serviceImpl.getBranchByClinicAndBranchId(clinicId, branchId);
	}
	
}
