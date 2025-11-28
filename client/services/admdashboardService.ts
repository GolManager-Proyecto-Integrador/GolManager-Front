//DashboardAdmin.tsx

import axios from "axios";
import { getToken } from "./authService";

// Endpoint correcto del backend
const API_URL = "http://localhost:8085/api/admin/dashboard";

// Headers de autenticación reutilizables
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  }
});

// Manejo centralizado de errores
const handleApiError = (error: any, operation: string) => {
  console.error(`❌ Error en ${operation}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });

  if (error.response?.status === 401) {
    throw new Error("No autorizado: Por favor, inicia sesión nuevamente");
  } else if (error.response?.status === 403) {
    throw new Error("Acceso denegado: No tienes permisos para acceder al dashboard");
  } else if (error.response?.status === 404) {
    throw new Error("Dashboard no encontrado");
  } else if (error.response?.status === 500) {
    throw new Error("Error interno del servidor al cargar el dashboard");
  } else if (error.code === 'ECONNABORTED') {
    throw new Error("Timeout: La solicitud tardó demasiado tiempo");
  } else if (error.request) {
    throw new Error("Error de conexión: No se pudo conectar con el servidor");
  } else {
    throw new Error(`Error al ${operation}: ${error.message}`);
  }
};

export const dashboardService = {
  // Obtener la información general del dashboard (GET)
  getDashboardData: async () => {
    try {
      console.log('🔄 Obteniendo datos del dashboard...');
      
      const response = await axios.get(API_URL, getAuthHeaders());
      
      console.log('✅ Datos del dashboard obtenidos correctamente');
      return response.data;
      
    } catch (error: any) {
      handleApiError(error, "obtener datos del dashboard");
      throw error;
    }
  },

  // 🔹 Obtener estadísticas específicas (OPCIONAL)
  getDashboardStats: async (periodo?: string) => {
    try {
      const params = periodo ? { period: periodo } : {};
      
      const response = await axios.get(`${API_URL}/stats`, {
        ...getAuthHeaders(),
        params
      });
      
      console.log('✅ Estadísticas del dashboard obtenidas correctamente');
      return response.data;
      
    } catch (error: any) {
      handleApiError(error, "obtener estadísticas del dashboard");
      throw error;
    }
  },

  // 🔹 Obtener actividades recientes (OPCIONAL)
  getRecentActivity: async (limit: number = 10) => {
    try {
      const response = await axios.get(`${API_URL}/activity`, {
        ...getAuthHeaders(),
        params: { limit }
      });
      
      console.log('✅ Actividad reciente obtenida correctamente');
      return response.data;
      
    } catch (error: any) {
      handleApiError(error, "obtener actividad reciente");
      throw error;
    }
  }
};

export default dashboardService;