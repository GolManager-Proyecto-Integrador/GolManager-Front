//DashboardAdmin.tsx

import axios from "axios";

// 🔹 Endpoint correcto del backend
const API_URL = "http://localhost:8085/api/dashboard";

export const dashboardService = {
  // Obtener la información general del dashboard (GET)
  getDashboardData: async (token: string) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Validar estructura esperada
      const data = response.data;
      if (
        !data ||
        typeof data.userName === "undefined" ||
        typeof data.numOrganizers === "undefined" ||
        typeof data.numTournaments === "undefined" ||
        typeof data.numTeams === "undefined"
      ) {
        throw new Error("La respuesta del backend no tiene el formato esperado.");
      }

      return {
        userName: data.userName,
        numOrganizers: data.numOrganizers,
        numTournaments: data.numTournaments,
        numTeams: data.numTeams,
      };
    } catch (error: any) {
      console.error("❌ Error en getDashboardData:", error);

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
