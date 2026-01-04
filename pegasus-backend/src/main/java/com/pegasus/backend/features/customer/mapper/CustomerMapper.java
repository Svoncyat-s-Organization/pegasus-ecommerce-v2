package com.pegasus.backend.features.customer.mapper;

import com.pegasus.backend.features.customer.dto.*;
import com.pegasus.backend.features.customer.entity.Customer;
import com.pegasus.backend.features.customer.entity.CustomerAddress;
import org.mapstruct.*;

/**
 * Mapper MapStruct para Customer y CustomerAddress
 */
@Mapper(componentModel = "spring")
public interface CustomerMapper {
    
    // Customer mappings
    CustomerResponse toResponse(Customer customer);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    Customer toEntity(CreateCustomerRequest request);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    void updateEntity(UpdateCustomerRequest request, @MappingTarget Customer customer);
    
    // CustomerAddress mappings
    @Mapping(source = "customer.id", target = "customerId")
    CustomerAddressResponse toAddressResponse(CustomerAddress address);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CustomerAddress toAddressEntity(CreateCustomerAddressRequest request);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "isDefaultShipping", ignore = true)
    @Mapping(target = "isDefaultBilling", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateAddressEntity(UpdateCustomerAddressRequest request, @MappingTarget CustomerAddress address);
}
