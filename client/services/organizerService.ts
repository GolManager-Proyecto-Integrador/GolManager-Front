import axios from "axios";

// ✅ Usa variable de entorno o fallback al localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8085/api";
const API_BASE_URL = `${BASE_URL}/admin/organizers`;

export const organizerService = {
  // 🔹 Registrar nuevo organizador
  register: async (
    data: { name: string; email: string; password: string },
    token?: string
  ) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.data;
    } catch (error: any) {
      throw (
        error.response?.data || { message: "Error al registrar organizador" }
      );
    }
  },

  // 🔹 Obtener todos los organizadores
  getAll: async (token?: string) => {
    try {
      const res = await axios.get(API_BASE_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.data; // array con id, name, email, numTournaments
    } catch (error: any) {
      throw (
        error.response?.data || { message: "Error al obtener organizadores" }
      );
    }
  },

  // 🔹 Actualizar organizador
  update: async (
    data: { email: string; name: string; password: string },
    token?: string
  ) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/update`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.data;
    } catch (error: any) {
      throw (
        error.response?.data || { message: "Error al actualizar organizador" }
      );
    }
  },

  // 🔹 Eliminar organizador
  remove: async (email: string, token?: string) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/delete`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        data: { email },
      });
      return res.data; // devuelve elementId, elementName, deletionElementDate
    } catch (error: any) {
      throw (
        error.response?.data || { message: "Error al eliminar organizador" }
      );
    }
  },
};
