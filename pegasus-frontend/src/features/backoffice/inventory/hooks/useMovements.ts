import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchMovements } from '../api/movementsApi';
import type { OperationType } from '@types';

/**
 * Hook for movements (Kardex) with filters
 */
export const useMovements = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [warehouseFilter, setWarehouseFilter] = useState<number | undefined>(undefined);
  const [variantFilter, setVariantFilter] = useState<number | undefined>(undefined);
  const [operationTypeFilter, setOperationTypeFilter] = useState<OperationType | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<[string?, string?]>([undefined, undefined]);

  const query = useQuery({
    queryKey: [
      'movements',
      page,
      pageSize,
      warehouseFilter,
      variantFilter,
      operationTypeFilter,
      dateRange,
    ],
    queryFn: () =>
      searchMovements(
        page,
        pageSize,
        warehouseFilter,
        variantFilter,
        operationTypeFilter,
        dateRange[0],
        dateRange[1]
      ),
  });

  const handleWarehouseFilter = (warehouseId: number | undefined) => {
    setWarehouseFilter(warehouseId);
    setPage(0);
  };

  const handleVariantFilter = (variantId: number | undefined) => {
    setVariantFilter(variantId);
    setPage(0);
  };

  const handleOperationTypeFilter = (operationType: OperationType | undefined) => {
    setOperationTypeFilter(operationType);
    setPage(0);
  };

  const handleDateRangeFilter = (fromDate?: string, toDate?: string) => {
    setDateRange([fromDate, toDate]);
    setPage(0);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage - 1);
    setPageSize(newPageSize);
  };

  return {
    ...query,
    page,
    pageSize,
    warehouseFilter,
    variantFilter,
    operationTypeFilter,
    dateRange,
    handleWarehouseFilter,
    handleVariantFilter,
    handleOperationTypeFilter,
    handleDateRangeFilter,
    handlePageChange,
  };
};
