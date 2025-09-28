// src/services/teamDetailsService.ts
import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/tournaments";

// Interfaces
export interface Player {
  id: string;
  name: string;
  position: string;          // Enum en backend (ej: "PO")
  dorsalNumber: number;      // Número en camiseta
  age?: number;
  goals?: number;            // Estadísticas (si backend las expone)
  yellowCards?: number;
  redCards?: number;
  role?: "Titular" | "Suplente";               // 🔹 necesario para TeamDetails
  status?: "Activo" | "Suspendido" | "Lesionado"; // 🔹 necesario para TeamDetails
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField?: string;
  players: Player[];
}

// 🔹 Obtener detalle de un equipo específico
export async function getTeamDetails(
  idTournament: string,
  teamId: string
): Promise<Team> {
  const token = getToken();
  const response = await axios.get(
    `${API_URL}/${idTournament}/teams/${teamId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// 🔹 Actualizar equipo (información general + jugadores)
export async function updateTeamDetails(
  idTournament: string,
  teamId: string,
  team: Partial<Team>
): Promise<Team> {
  const token = getToken();
  const response = await axios.put(
    `${API_URL}/${idTournament}/teams/${teamId}`,
    team,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export default {
  getTeamDetails,
  updateTeamDetails,
};
