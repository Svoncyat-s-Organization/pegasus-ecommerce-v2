package com.pegasus.backend.shared.locations.controller;

import com.pegasus.backend.shared.locations.dto.DepartmentResponse;
import com.pegasus.backend.shared.locations.dto.DistrictResponse;
import com.pegasus.backend.shared.locations.dto.ProvinceResponse;
import com.pegasus.backend.shared.locations.dto.UbigeoResponse;
import com.pegasus.backend.shared.locations.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para ubicaciones (Ubigeo Perú)
 * Endpoints públicos para obtener departamentos, provincias y distritos
 */
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Locations", description = "Sistema de ubicaciones de Perú (Ubigeo)")
public class LocationController {

    private final LocationService locationService;

    /**
     * GET /api/locations/departments
     * Obtener todos los departamentos
     */
    @GetMapping("/departments")
    @Operation(summary = "Listar departamentos", description = "Obtiene todos los departamentos del Perú")
    @ApiResponse(responseCode = "200", description = "Lista de departamentos")
    public ResponseEntity<List<DepartmentResponse>> getDepartments() {
        List<DepartmentResponse> departments = locationService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    /**
     * GET /api/locations/provinces/{departmentId}
     * Obtener provincias por departamento
     */
    @GetMapping("/provinces/{departmentId}")
    @Operation(summary = "Listar provincias por departamento", description = "Obtiene todas las provincias de un departamento específico")
    @ApiResponse(responseCode = "200", description = "Lista de provincias")
    public ResponseEntity<List<ProvinceResponse>> getProvincesByDepartment(@PathVariable String departmentId) {
        List<ProvinceResponse> provinces = locationService.getProvincesByDepartment(departmentId);
        return ResponseEntity.ok(provinces);
    }

    /**
     * GET /api/locations/districts/{provinceId}
     * Obtener distritos por provincia
     */
    @GetMapping("/districts/{provinceId}")
    @Operation(summary = "Listar distritos por provincia", description = "Obtiene todos los distritos de una provincia específica")
    @ApiResponse(responseCode = "200", description = "Lista de distritos")
    public ResponseEntity<List<DistrictResponse>> getDistrictsByProvince(@PathVariable String provinceId) {
        List<DistrictResponse> districts = locationService.getDistrictsByProvince(provinceId);
        return ResponseEntity.ok(districts);
    }

    /**
     * GET /api/locations/ubigeo/{ubigeoId}
     * Obtener ubicación completa por ID de ubigeo
     */
    @GetMapping("/ubigeo/{ubigeoId}")
    @Operation(summary = "Obtener ubicación completa", description = "Obtiene departamento, provincia y distrito por ID de ubigeo")
    @ApiResponse(responseCode = "200", description = "Ubicación completa")
    public ResponseEntity<UbigeoResponse> getUbigeoById(@PathVariable String ubigeoId) {
        UbigeoResponse ubigeo = locationService.getUbigeoById(ubigeoId);
        return ResponseEntity.ok(ubigeo);
    }
}
