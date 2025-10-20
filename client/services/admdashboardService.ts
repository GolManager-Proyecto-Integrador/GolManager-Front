//DashboardAdmin.tsx

import axios from "axios";

// 🔹 Endpoint correcto del backend
const API_URL = "http://localhost:8085/api/admin/dashboard";

export const dashboardService = {
  // Obtener la información general del dashboard (GET)
  getDashboardData: async (token: string) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data || {
          status: 500,
          error: "Error desconocido",
          messages: "No se pudo obtener la información del dashboard",
        }
      );
    }
  },
};
