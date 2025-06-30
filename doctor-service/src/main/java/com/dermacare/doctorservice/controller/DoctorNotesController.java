package com.dermacare.doctorservice.controller;

import com.dermacare.doctorservice.dto.DoctorNotesDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.service.DoctorNotesService;

import static com.dermacare.doctorservice.dermacaredoctorutils.DermaCareUtils.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(DOCTOR_NOTES)
//Origin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorNotesController {

    @Autowired
    private DoctorNotesService doctorNotesService;

    @PostMapping(ADD_DOCTOR_NOTE)
    public ResponseEntity<Response> addNote(@RequestBody DoctorNotesDTO dto) {
        return ResponseEntity.ok(doctorNotesService.addDoctorNote(dto));
    }

    @GetMapping(GET_ALL_DOCTOR_NOTES)
    public ResponseEntity<Response> getAllNotes() {
        return ResponseEntity.ok(doctorNotesService.getAllDoctorNotes());
    }
    
    @GetMapping("/getNoteByDoctorId/{doctorId}")
    public ResponseEntity<Response> getNoteByDoctorId(@PathVariable String doctorId) {
    	Response res = doctorNotesService.getNoteByDoctorId(doctorId);
    	if(res != null) {
        return ResponseEntity.status(res.getStatus()).body(res);
    }
    	return null;}
}
