import { useQuery } from '@tanstack/react-query';
import { assignmentsApi } from '@features/backoffice/security/rbac/api/assignmentsApi';
import { useAuthStore } from '@stores/backoffice/authStore';

/**
 * Hook para obtener los permisos (módulos) del usuario autenticado
 * Retorna las rutas de los módulos a los que el usuario tiene acceso
 */
export const useUserPermissions = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['user-permissions', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];

      const response = await assignmentsApi.getRolesByUser(user.userId);
      
      // Extraer todas las rutas de módulos únicos
      const modulePaths = new Set<string>();
      
      // Si el usuario tiene rol de Administrador, retornar acceso completo
      const isAdmin = response.roles.some(role => 
        role.name.toLowerCase() === 'administrador' || 
        role.name.toLowerCase() === 'admin'
      );
      
      if (isAdmin) {
        // Retornar null para indicar acceso completo
        return null;
      }
      
      // Si no es admin, obtener módulos de cada rol
      for (const role of response.roles) {
        const roleModules = await assignmentsApi.getModulesByRole(role.id);
        roleModules.modules.forEach(module => modulePaths.add(module.path));
      }
      
      return Array.from(modulePaths);
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};
