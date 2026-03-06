package com.pharmacyManagement.service;

import java.util.List;
import com.pharmacyManagement.dto.SalesReturnCreateResponse;
import com.pharmacyManagement.dto.SalesReturnFilterRequest;
import com.pharmacyManagement.dto.SalesReturnRequest;
import com.pharmacyManagement.dto.SalesReturnResponse;
import com.pharmacyManagement.dto.SalesReturnSummaryResponse;
import com.pharmacyManagement.dto.SalesReturnUpdateRequest;

public interface SalesReturnService {

    SalesReturnCreateResponse createReturn(SalesReturnRequest request);

    SalesReturnResponse getByReturnNo(String returnNo);

    void updateReturn(String returnNo, SalesReturnUpdateRequest request);

    void cancelReturn(String returnNo);

    List<SalesReturnSummaryResponse> filterReturns(SalesReturnFilterRequest filter);
}
