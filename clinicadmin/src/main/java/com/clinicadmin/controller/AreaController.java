package com.clinicadmin.controller;
import com.clinicadmin.dto.AreaDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.service.AreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clinic-admin/area")
@RequiredArgsConstructor
public class AreaController {
    private final AreaService areaService;

    @PostMapping("/addArea")
    public Response addArea(@RequestBody AreaDTO dto) {
        return areaService.saveArea(dto);
    }

    @PutMapping("/updateAreaById/{id}")
    public Response updateAreaById(@PathVariable String id,
                               @RequestBody AreaDTO dto) {
        return areaService.updateArea(id, dto);
    }

    @GetMapping("/getAreaById/{id}")
    public Response getAreaById(@PathVariable String id) {
        return areaService.getAreaById(id);
    }

    @GetMapping("/getAllAreas")
    public Response getAllAreas() {
        return areaService.getAllAreas();
    }

    @DeleteMapping("/deleteAreaById/{id}")
    public Response deleteAreaById(@PathVariable String id) {
        return areaService.deleteArea(id);
    }

    @GetMapping("/getAreasByCity/{cityId}")
    public Response getAreasByCity(@PathVariable String cityId) {
        return areaService.getAreasByCity(cityId);
    }
}
