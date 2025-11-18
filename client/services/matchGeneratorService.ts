// GeneracionAutomatica.tsx

import axios from "axios";
import { getToken } from "./authService";

// ===========================
//   URL BASE BASE SEGÚN BACKEND
// ===========================
const API_TOURNAMENT = "/api/tournaments";

// ===========================
//   GENERAR ENFRENTAMIENTOS (POST)
// ===========================
export const generarLlavesEnfrentamientos = async (tournamentId: number) => {
  try {
    const token = getToken();

    const response = await axios.post(
      `${API_TOURNAMENT}/${tournamentId}/matches/generator`,
      {}, // el backend NO requiere body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // La respuesta esperada:
    // [
    //   {
    //     "idMatch":1,
    //     "homeTeam":"string",
    //     "awayTeam":"string",
    //     "stadium":"string",
    //     "matchDateTime":"2025-11-10T00:33:27.512Z",
    //   }
    // ]
    return response.data;
  } catch (error: any) {
    console.error("Error generando llaves:", error);
    throw error.response?.data || error;
  }
};
