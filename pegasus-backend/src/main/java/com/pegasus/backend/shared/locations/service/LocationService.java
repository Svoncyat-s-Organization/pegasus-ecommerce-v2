package com.pegasus.backend.shared.locations.service;

import com.pegasus.backend.shared.locations.dto.DepartmentResponse;
import com.pegasus.backend.shared.locations.dto.DistrictResponse;
import com.pegasus.backend.shared.locations.dto.ProvinceResponse;
import com.pegasus.backend.shared.locations.dto.UbigeoResponse;
import com.pegasus.backend.shared.locations.entity.Ubigeo;
import com.pegasus.backend.shared.locations.repository.UbigeoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de ubicaciones (Ubigeo Perú)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LocationService {

    private final UbigeoRepository ubigeoRepository;

    /**
     * Obtener todos los departamentos
     */
    public List<DepartmentResponse> getAllDepartments() {
        log.debug("Fetching all departments");
        return ubigeoRepository.findAllDepartments().stream()
                .map(row -> new DepartmentResponse((String) row[0], (String) row[1]))
                .toList();
    }

    /**
     * Obtener provincias por departamento
     */
    public List<ProvinceResponse> getProvincesByDepartment(String departmentId) {
        log.debug("Fetching provinces for department: {}", departmentId);
        return ubigeoRepository.findProvincesByDepartment(departmentId).stream()
                .map(row -> new ProvinceResponse((String) row[0], (String) row[1]))
                .toList();
    }

    /**
     * Obtener distritos por provincia
     */
    public List<DistrictResponse> getDistrictsByProvince(String provinceId) {
        log.debug("Fetching districts for province: {}", provinceId);
        return ubigeoRepository.findDistrictsByProvince(provinceId).stream()
                .map(row -> new DistrictResponse((String) row[0], (String) row[1]))
                .toList();
    }

    /**
     * Obtener ubicación completa por ID de ubigeo (distrito)
     */
    public UbigeoResponse getUbigeoById(String ubigeoId) {
        log.debug("Fetching ubigeo: {}", ubigeoId);
        Ubigeo ubigeo = ubigeoRepository.findById(ubigeoId)
                .orElseThrow(() -> new IllegalArgumentException("Ubigeo no encontrado: " + ubigeoId));

        // Extraer departmentId (2 primeros dígitos) y provinceId (4 primeros dígitos)
        String departmentId = ubigeoId.substring(0, 2);
        String provinceId = ubigeoId.substring(0, 4);

        return new UbigeoResponse(
                ubigeo.getId(),
                ubigeo.getDepartmentName(),
                ubigeo.getProvinceName(),
                ubigeo.getDistrictName(),
                departmentId,
                provinceId);
    }
}
