import axios from "axios";

const API_URL = "/api/admin/organizers";

export const organizerService = {
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
      return res.data; // Devuelve el objeto con id, email, name, status, token
    } catch (error: any) {
      throw error.response?.data || { message: "Error al registrar organizador" };
    }
  },
};
