// RegistrarOrganizador.tsx
// OrganizerManagement.tsx


import axios from "axios";

const API_URL = "http://localhost:8085/api/admin/organizers";


export const organizerService = {
  // 🔹 Registrar nuevo organizador
  register: async (
    data: { name: string; email: string; password: string },
    token?: string
  ) => {
    try {
      const res = await axios.post(API_URL, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Error al registrar organizador" };
    }
  },

  // 🔹 Obtener todos los organizadores
  getAll: async (token?: string) => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.data; // array con id, name, email, numTournaments
    } catch (error: any) {
      throw error.response?.data || { message: "Error al obtener organizadores" };
    }
  },

// 🔹 Actualizar organizador (el email se envía solo para verificación)
update: async (
  data: { actualEmail: string; newEmail: string; newName: string; newPassword: string },
  token?: string
) => {
  try {
    const res = await axios.put(API_URL, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Error al actualizar organizador" };
  }
},


  // 🔹 Eliminar organizador
  remove: async (email: string, token?: string) => {
    try {
      const res = await axios.delete(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        data: { email },
      });
      return res.data; // devuelve elementId, elementName, deletionElementDate
    } catch (error: any) {
      throw error.response?.data || { message: "Error al eliminar organizador" };
    }
  },
};

