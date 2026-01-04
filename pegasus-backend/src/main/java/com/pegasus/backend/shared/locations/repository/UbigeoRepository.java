package com.pegasus.backend.shared.locations.repository;

import com.pegasus.backend.shared.locations.entity.Ubigeo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para Ubigeo
 */
@Repository
public interface UbigeoRepository extends JpaRepository<Ubigeo, String> {
    
    /**
     * Obtener todos los departamentos (únicos)
     */
    @Query("SELECT DISTINCT u.departmentId, u.departmentName FROM Ubigeo u ORDER BY u.departmentName")
    List<Object[]> findAllDepartments();
    
    /**
     * Obtener todas las provincias de un departamento
     */
    @Query("SELECT DISTINCT u.provinceId, u.provinceName FROM Ubigeo u WHERE u.departmentId = :departmentId ORDER BY u.provinceName")
    List<Object[]> findProvincesByDepartment(String departmentId);
    
    /**
     * Obtener todos los distritos de una provincia
     */
    @Query("SELECT u.id, u.districtName FROM Ubigeo u WHERE u.provinceId = :provinceId ORDER BY u.districtName")
    List<Object[]> findDistrictsByProvince(String provinceId);
}
