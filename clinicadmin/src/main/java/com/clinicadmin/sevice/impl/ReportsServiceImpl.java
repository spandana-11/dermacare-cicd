package com.clinicadmin.sevice.impl;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.BookingResponse;
import com.clinicadmin.dto.ReportsDTO;
import com.clinicadmin.dto.ReportsDtoList;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.entity.Reports;
import com.clinicadmin.entity.ReportsList;
import com.clinicadmin.feignclient.BookingFeign;
import com.clinicadmin.repository.ReportsRepository;
import com.clinicadmin.service.ReportsService;
import com.clinicadmin.utils.ExtractFeignMessage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;

@Service
public class ReportsServiceImpl implements ReportsService {

	@Autowired
	private ReportsRepository reportsRepository;
	
	@Autowired
	private BookingFeign bookingFeign;
//-----------------------------------------Add Reports-----------------------------------------------------
	String bkngId ;
	@Override
	public Response saveReports(ReportsDtoList dto) {
		try {
			ReportsList reportsList = new ReportsList();
			List<Reports> reports = new ArrayList<>();
			for (ReportsDTO d : dto.getReportsList()) {
				List<byte[]> list = new ArrayList<>();
				bkngId = d.getBookingId();
				if(d.getReportFile() != null) {
				for(String s:d.getReportFile()) {
				byte[] decodedFile = Base64.getDecoder().decode(s);
				list.add(decodedFile);}}
				Reports report = Reports.builder().bookingId(d.getBookingId()).reportName(d.getReportName())
						.reportDate(d.getReportDate()).reportStatus(d.getReportStatus()).reportType(d.getReportType())
						.customerMobileNumber(d.getCustomerMobileNumber()).reportFile(list).build();
				reports.add(report);}
				ResponseEntity<ResponseStructure<BookingResponse>> r = bookingFeign.getBookedService(bkngId);
				BookingResponse res = r.getBody().getData();
				if(res!=null) {			
					res.setReports(dto);
					bookingFeign.updateAppointment(res);}
			reportsList.setReportsList(reports);
			ReportsList saved = reportsRepository.save(reportsList);
			return Response.builder().success(true).data(saved).message("Report uploaded successfully")
					.status(HttpStatus.CREATED.value()).build();			
		} catch (FeignException e) {
			return Response.builder().success(false).data(null).message(e.getMessage())
					.status(HttpStatus.INTERNAL_SERVER_ERROR.value()).build();
		}
	}
	
//	---------------------------------------Get Reports By BookingId--------------------------------------------
	@Override
	public Response getReportsByBookingId(String bookingId) {
		Response res = new Response();
	    try {
	        List<ReportsList> reportsListData = reportsRepository.findByReportsListBookingId(bookingId);
	        List<ReportsDtoList> toDTO = new ObjectMapper().convertValue(reportsListData,new TypeReference<List<ReportsDtoList>>() {});
			if (toDTO != null && !toDTO.isEmpty()) {
				res.setSuccess(true);
				res.setStatus(200);
				res.setMessage("Records Fetched Successfully");
				res.setData(toDTO);
			} else {
				res.setSuccess(true);
				res.setStatus(200);
				res.setMessage("Records Not Found");
				res.setData(Collections.emptyList());
			}
		} catch (Exception e) {
			res.setSuccess(false);
			res.setStatus(500);
			res.setMessage(e.getMessage());
			res.setData(null);
		}
		return res;
	}
	

//----------------------------------------Get All reports-------------------------------------------------------
	@Override
	public Response getAllReports() {
		Response res = new Response();
		try {
			List<ReportsList> reportList = reportsRepository.findAll();
			List<ReportsDtoList> toDTO = new ObjectMapper().convertValue(reportList,
					new TypeReference<List<ReportsDtoList>>() {});
			if (toDTO != null && !toDTO.isEmpty()) {
				res.setSuccess(true);
				res.setStatus(200);
				res.setMessage("Records Fetched Successfully");
				res.setData(toDTO);
			} else {
				res.setSuccess(true);
				res.setStatus(200);
				res.setMessage("Records Not Found");
				res.setData(Collections.emptyList());
			}
		} catch (Exception e) {
			res.setSuccess(false);
			res.setStatus(500);
			res.setMessage(e.getMessage());
			res.setData(null);
		}
		return res;
	}

}