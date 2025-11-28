// RegistrarOrganizador.tsx
// OrganizerManagement.tsx


import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/admin/organizers";

// 🔹 Headers de autenticación reutilizables
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  }
});

// 🔹 Manejo centralizado de errores
const handleApiError = (error: any, operation: string) => {
  console.error(`❌ Error en ${operation}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });

  if (error.response?.status === 401) {
    throw new Error("No autorizado: Por favor, inicia sesión nuevamente");
  } else if (error.response?.status === 403) {
    throw new Error("Acceso denegado: No tienes permisos para esta acción");
  } else if (error.response?.status === 404) {
    throw new Error("Recurso no encontrado");
  } else if (error.response?.status === 409) {
    throw new Error("Conflicto: El organizador ya existe");
  } else if (error.response?.status === 422) {
    throw new Error("Datos inválidos: Verifica la información ingresada");
  } else if (error.response?.status === 500) {
    throw new Error("Error interno del servidor");
  } else if (error.code === 'ECONNABORTED') {
    throw new Error("Timeout: La solicitud tardó demasiado tiempo");
  } else if (error.request) {
    throw new Error("Error de conexión: No se pudo conectar con el servidor");
  } else {
    throw new Error(`Error al ${operation}: ${error.message}`);
  }
};

export const organizerService = {
  // 🔹 Registrar nuevo organizador
  register: async (data: { name: string; email: string; password: string }) => {
    try {
      console.log('🔄 Registrando nuevo organizador...', { email: data.email });
      
      const res = await axios.post(API_URL, data, getAuthHeaders());
      
      console.log('✅ Organizador registrado correctamente:', { email: data.email });
      return res.data;
    } catch (error: any) {
      handleApiError(error, "registrar organizador");
      throw error;
    }
  },

  // 🔹 Obtener todos los organizadores
  getAll: async () => {
    try {
      console.log('🔄 Obteniendo lista de organizadores...');
      
      const res = await axios.get(API_URL, getAuthHeaders());
      
      console.log(`✅ ${res.data.length} organizadores obtenidos correctamente`);
      return res.data; // array con id, name, email, numTournaments
    } catch (error: any) {
      handleApiError(error, "obtener organizadores");
      throw error;
    }
  },

  // 🔹 Actualizar organizador
  update: async (data: { 
    actualEmail: string; 
    newEmail: string; 
    newName: string; 
    newPassword: string 
  }) => {
    try {
      console.log('🔄 Actualizando organizador...', { 
        actualEmail: data.actualEmail,
        newEmail: data.newEmail 
      });
      
      const res = await axios.put(API_URL, data, getAuthHeaders());
      
      console.log('✅ Organizador actualizado correctamente:', { 
        email: data.actualEmail 
      });
      return res.data;
    } catch (error: any) {
      handleApiError(error, "actualizar organizador");
      throw error;
    }
  },

  // 🔹 Eliminar organizador
  remove: async (email: string) => {
    try {
      console.log('🔄 Eliminando organizador...', { email });
      
      const res = await axios.delete(API_URL, {
        ...getAuthHeaders(),
        data: { email },
      });
      
      console.log('✅ Organizador eliminado correctamente:', { email });
      return res.data; // devuelve elementId, elementName, deletionElementDate
    } catch (error: any) {
      handleApiError(error, "eliminar organizador");
      throw error;
    }
  },

  // 🔹 Obtener organizador por ID (FUNCIONALIDAD ADICIONAL)
  getById: async (id: string) => {
    try {
      console.log('🔄 Obteniendo organizador por ID...', { id });
      
      const res = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
      
      console.log('✅ Organizador obtenido correctamente:', { id });
      return res.data;
    } catch (error: any) {
      handleApiError(error, "obtener organizador por ID");
      throw error;
    }
  },

  // 🔹 Buscar organizadores (FUNCIONALIDAD ADICIONAL)
  search: async (query: string) => {
    try {
      console.log('🔄 Buscando organizadores...', { query });
      
      const res = await axios.get(`${API_URL}/search`, {
        ...getAuthHeaders(),
        params: { q: query }
      });
      
      console.log(`✅ ${res.data.length} organizadores encontrados`);
      return res.data;
    } catch (error: any) {
      handleApiError(error, "buscar organizadores");
      throw error;
    }
  }
};

export default organizerService;