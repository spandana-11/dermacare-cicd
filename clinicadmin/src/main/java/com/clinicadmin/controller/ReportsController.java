package com.clinicadmin.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.ReportsDtoList;
import com.clinicadmin.dto.Response;
import com.clinicadmin.service.ReportsService;


@RestController
@RequestMapping("/clinic-admin")
//Origin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    @PostMapping("/savereports")
    public ResponseEntity<Response> saveReports(@RequestBody ReportsDtoList dto) {
        Response response = reportsService.saveReports(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

 
     @GetMapping("/getallreports")
     public ResponseEntity<Response> getAllReports() {
    	 Response response = reportsService.getAllReports();
         return ResponseEntity.status(response.getStatus()).body(response);
     }
     @GetMapping("getReportByBookingId/{bookingId}")
     public ResponseEntity<Response> getReportsByBookingId(@PathVariable String bookingId) {
    	 Response response = reportsService.getReportsByBookingId(bookingId);
         return ResponseEntity.status(response.getStatus()).body(response);
     }
}
