package com.AdminService.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.AdminService.dto.QuestionAnswerDTO;
import com.AdminService.dto.QuetionsAndAnswerForAddClinicDTO;
import com.AdminService.entity.QuestionAnswer;
import com.AdminService.entity.QuetionsAndAnswerForAddClinic;
import com.AdminService.repository.QuetionsAndAnswerForAddClinicRepository;
import com.AdminService.util.Response;

@Service
public class QuetionsAndAnswerForAddClinicServiceImpl implements QuetionsAndAnswerForAddClinicService {

	@Autowired
	private QuetionsAndAnswerForAddClinicRepository repository;

	// ✅ Save Question
	@Override
	public Response saveQuetions(QuetionsAndAnswerForAddClinicDTO dto) {
		QuetionsAndAnswerForAddClinic entity = new QuetionsAndAnswerForAddClinic();
		List<QuestionAnswer> qaList = dto.getQuestionsAndAnswers().stream()
				.map(qaDto -> new QuestionAnswer(qaDto.getQuestion(), qaDto.isAnswer())).collect(Collectors.toList());
		entity.setQuestionsAndAnswers(qaList);
		QuetionsAndAnswerForAddClinic saved = repository.save(entity);
		QuetionsAndAnswerForAddClinicDTO toSaveDTO = new QuetionsAndAnswerForAddClinicDTO();
		toSaveDTO.setId(saved.getId());
		List<QuestionAnswerDTO> dtoList = saved.getQuestionsAndAnswers().stream()
				.map(qaEntity -> new QuestionAnswerDTO(qaEntity.getQuestion(), qaEntity.isAnswer()))
				.collect(Collectors.toList());
		toSaveDTO.setQuestionsAndAnswers(dtoList);
		Response response = new Response();
		response.setSuccess(true);
		response.setData(toSaveDTO);
		response.setMessage("Questions added successfully");
		response.setStatus(200);
		return response;
	}

	// ✅ Get Question by Id
	@Override
	public Response getQuestionsById(String id) {
		Optional<QuetionsAndAnswerForAddClinic> entityOpt = repository.findById(id);
		Response response = new Response();
		try {
			if (entityOpt.isEmpty()) {
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				response.setMessage("Quetions are not found with this id : " + id);
				response.setStatus(200);
				return response;
			}
			QuetionsAndAnswerForAddClinicDTO dto = new QuetionsAndAnswerForAddClinicDTO();
			QuetionsAndAnswerForAddClinic dbData = entityOpt.get();
			dto.setId(dbData.getId());
			List<QuestionAnswerDTO> dtoList = dbData.getQuestionsAndAnswers().stream()
					.map(data -> new QuestionAnswerDTO(data.getQuestion(), data.isAnswer()))
					.collect(Collectors.toList());
			dto.setQuestionsAndAnswers(dtoList);
			response.setSuccess(true);
			response.setData(dtoList);
			response.setMessage("Questions fetched successfully");
			response.setStatus(200);
			return response;
		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Exeception occures while getting the admin quetionnaries  : " + e.getMessage());
			response.setStatus(500);
			return response;
		}
	}

	@Override
	public Response updateQuestion(String id, QuetionsAndAnswerForAddClinicDTO dto) {
	    Optional<QuetionsAndAnswerForAddClinic> entityOpt = repository.findById(id);
	    Response response = new Response();

	    try {
	        if (entityOpt.isEmpty()) {
	            response.setSuccess(false);
	            response.setData(Collections.emptyList());
	            response.setMessage("Questions not found with this id : " + id);
	            response.setStatus(404);
	            return response;
	        }

	        QuetionsAndAnswerForAddClinic dbData = entityOpt.get();

	        if (dto.getQuestionsAndAnswers() != null && !dto.getQuestionsAndAnswers().isEmpty()) {
	            List<QuestionAnswer> updatedList = new ArrayList<>();

	            for (QuestionAnswerDTO qaDto : dto.getQuestionsAndAnswers()) {
	                if (qaDto == null) continue;

	                String question = qaDto.getQuestion();
	                Boolean answer = qaDto.isAnswer(); // primitive boolean → already false if null not possible

	                // ✅ Null/empty check for question
	                if (question == null || question.isBlank()) {
	                    continue; // skip invalid entries
	                }

	                updatedList.add(new QuestionAnswer(question, answer));
	            }

	            // Only update if we got valid data
	            if (!updatedList.isEmpty()) {
	                dbData.setQuestionsAndAnswers(updatedList);
	            }
	        }

	        QuetionsAndAnswerForAddClinic saved = repository.save(dbData);

	        // Convert back to DTO
	        QuetionsAndAnswerForAddClinicDTO toSaveDTO = new QuetionsAndAnswerForAddClinicDTO();
	        toSaveDTO.setId(saved.getId());

	        List<QuestionAnswerDTO> dtoList = saved.getQuestionsAndAnswers() != null
	                ? saved.getQuestionsAndAnswers().stream()
	                      .map(qaEntity -> new QuestionAnswerDTO(qaEntity.getQuestion(), qaEntity.isAnswer()))
	                      .collect(Collectors.toList())
	                : Collections.emptyList();

	        toSaveDTO.setQuestionsAndAnswers(dtoList);

	        response.setSuccess(true);
	        response.setData(toSaveDTO);
	        response.setMessage("Questions updated successfully");
	        response.setStatus(200);

	    } catch (Exception e) {
	        response.setSuccess(false);
	        response.setMessage("Exception occurred while updating the admin questionnaires: " + e.getMessage());
	        response.setStatus(500);
	    }

	    return response;
	}

	// ✅ Get All
	@Override
	public Response getAllQuestions() {
	
		Response response = new Response();
		List<QuetionsAndAnswerForAddClinic> allDbData = repository.findAll();
		try {
		
		

		List<QuetionsAndAnswerForAddClinicDTO> dtoList = allDbData.stream()
		    .map(data -> new QuetionsAndAnswerForAddClinicDTO(
		            data.getId(),
		            data.getQuestionsAndAnswers() != null
		                ? data.getQuestionsAndAnswers().stream()
		                      .map(a -> new QuestionAnswerDTO(a.getQuestion(), a.isAnswer()))
		                      .collect(Collectors.toList())
		                : Collections.emptyList()
		        )
		    )
		    .collect(Collectors.toList());
		response.setSuccess(true);
		response.setData(dtoList);
		response.setMessage("Questions fetched successfully");
		response.setStatus(200);
		return response;
		}
		catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Exeception occures while get all admin quetionnaries  : " + e.getMessage());
			response.setStatus(500);
			return response;
		}
	}
}