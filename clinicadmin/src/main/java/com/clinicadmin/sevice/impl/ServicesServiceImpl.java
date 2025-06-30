package com.clinicadmin.sevice.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.dto.ServicesDto;
import com.clinicadmin.feignclient.ServiceFeignClient;
import com.clinicadmin.service.ServicesService;
import com.clinicadmin.utils.ExtractFeignMessage;

import feign.FeignException;
@Service
public class ServicesServiceImpl implements ServicesService{

	@Autowired
	ServiceFeignClient serviceFeignClient;
	
	@Override
	public Response getServiceById(String categoryId) {
	    Response response = new Response();
	    try {
	        ResponseEntity<ResponseStructure<List<ServicesDto>>> res = serviceFeignClient.getServiceById(categoryId);
	        if (res.hasBody() && res.getBody() != null) {
	            ResponseStructure<List<ServicesDto>> rsBody = res.getBody();
	            response.setSuccess(true);
	            response.setData(rsBody.getData());
	            response.setMessage(rsBody.getMessage());
	            response.setStatus(200);
	        }
	    } catch (FeignException e) {
	        response.setSuccess(false);
	        response.setMessage(ExtractFeignMessage.clearMessage(e));
	        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
//	        e.printStackTrace();
	    }
	    return response;
	}


	@Override
	public Response getServiceByServiceId(String serviceId) {
		Response response = new Response();
	    try {
	    	ResponseEntity<ResponseStructure<ServicesDto>> res = serviceFeignClient.getServiceByServiceId(serviceId);
	        if (res.hasBody() && res.getBody() != null) {
	            ResponseStructure<ServicesDto> rsBody = res.getBody();
	            response.setSuccess(true);
	            response.setData(rsBody.getData());
	            response.setMessage(rsBody.getMessage());
	            response.setStatus(200);
	        }
	    } catch (FeignException e) {
	        response.setSuccess(false);
	        response.setMessage(ExtractFeignMessage.clearMessage(e));
	        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
//	        e.printStackTrace();
	    }
	    return response;
	}

	@Override
	public Response getAllServices() {
		Response response = new Response();
	    try {
	        ResponseEntity<ResponseStructure<List<ServicesDto>>> res = serviceFeignClient.getAllServices();
	        if (res.hasBody() && res.getBody() != null) {
	            ResponseStructure<List<ServicesDto>> rsBody = res.getBody();
	            response.setSuccess(true);
	            response.setData(rsBody.getData());
	            response.setMessage(rsBody.getMessage());
	            response.setStatus(200);	
	        }
	    } catch (FeignException e) {
	        response.setSuccess(false);
	        response.setMessage(ExtractFeignMessage.clearMessage(e));
	        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
//	        e.printStackTrace();
	    }
	    return response;
	}

}
