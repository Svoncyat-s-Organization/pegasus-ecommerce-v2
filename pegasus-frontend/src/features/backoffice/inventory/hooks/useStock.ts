import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStockByWarehouse } from '../api/stockApi';

/**
 * Hook for stock list by warehouse
 */
export const useStock = (warehouseId: number | null) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const query = useQuery({
    queryKey: ['stock', warehouseId, page, pageSize],
    queryFn: () => getStockByWarehouse(warehouseId!, page, pageSize),
    enabled: !!warehouseId,
  });

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage - 1);
    setPageSize(newPageSize);
  };

  return {
    ...query,
    page,
    pageSize,
    handlePageChange,
  };
};
