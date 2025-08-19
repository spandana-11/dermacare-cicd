package com.AdminService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.AdminService.dto.QuetionsAndAnswerForAddClinicDTO;
import com.AdminService.service.QuetionsAndAnswerForAddClinicService;
import com.AdminService.util.Response;

@RestController
@RequestMapping("/admin")
public class QuetionsAndAnswerForAddClinicController {

    @Autowired
    private QuetionsAndAnswerForAddClinicService quetionsAndAnswerForAddClinicService;

    // ------------------------Add questions & answers---------------------------------
    @PostMapping("/clinicQuetions/addQuetions")
    public ResponseEntity<Response> addQuestions(@RequestBody QuetionsAndAnswerForAddClinicDTO clinicQA) {
        Response res = quetionsAndAnswerForAddClinicService.saveQuetions(clinicQA);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // -----------------------Get all questions----------------------------------------------
    @GetMapping("/clinicQuetions/getAll")
    public ResponseEntity<Response> getAllQuestions() {
        Response res = quetionsAndAnswerForAddClinicService.getAllQuestions();
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // ---------------------------Get questions by Id---------------------------------------------
    @GetMapping("/clinicQuetions/getById/{id}")
    public ResponseEntity<Response> getQuestionsById(@PathVariable String id) {
        Response res = quetionsAndAnswerForAddClinicService.getQuestionsById(id);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    //------------------------- Update questions by Id ----------------------------------------------
    @PutMapping("/clinicQuetions/update/{id}")
    public ResponseEntity<Response> updateQuestions(
            @PathVariable String id,
            @RequestBody QuetionsAndAnswerForAddClinicDTO clinicQA) {

        Response res = quetionsAndAnswerForAddClinicService.updateQuestion(id, clinicQA);
        return ResponseEntity.status(res.getStatus()).body(res);
    }
}