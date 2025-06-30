package com.clinicadmin.service;

import org.springframework.stereotype.Service;

import com.clinicadmin.dto.ReportsDTO;
import com.clinicadmin.dto.ReportsDtoList;
import com.clinicadmin.dto.Response;

@Service
public interface ReportsService {

	Response saveReports(ReportsDtoList dto);

	Response getAllReports();

	Response getReportsByBookingId(String bookingId);

}
