import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refrescar cuando vuelves a la ventana
      refetchOnMount: true, // Refrescar cuando se monta el componente
      refetchOnReconnect: true, // Refrescar cuando se reconecta
      retry: 1,
      staleTime: 0, // Los datos se consideran obsoletos inmediatamente
      gcTime: 5 * 60 * 1000, // Mantener en caché 5 minutos (antes era cacheTime)
    },
  },
});
