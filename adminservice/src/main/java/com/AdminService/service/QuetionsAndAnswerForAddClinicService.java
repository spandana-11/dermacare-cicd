package com.AdminService.service;

import com.AdminService.dto.QuetionsAndAnswerForAddClinicDTO;
import com.AdminService.util.Response;

public interface QuetionsAndAnswerForAddClinicService {

	Response saveQuetions(QuetionsAndAnswerForAddClinicDTO dto);

	Response getQuestionsById(String id);

	Response updateQuestion(String id, QuetionsAndAnswerForAddClinicDTO dto);

	Response getAllQuestions();

}