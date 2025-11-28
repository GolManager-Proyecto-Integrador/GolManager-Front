//ReglasTorneo.tsx

import axios from "axios";
import { getToken } from "./authService";

// ==================== 🔹 URL base ====================
const API_URL_TOURNAMENTS = "http://localhost:8085/api/tournaments";
const API_URL_PLAYERS = "http://localhost:8085/api/players";

// ==================== 🔹 Tipos ====================
export interface TournamentRules {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  format: string;
  homeAndAway: boolean;
  numberOfTeams: number;
  yellowCardsSuspension: number;
  refereeIds: number[];
}

export interface SuspendedPlayer {
  id: number;
  name: string;
  team: string;
  numYellowCards: number;
}

// ==================== 🔹 Peticiones ====================

// 1️⃣ Obtener detalles del torneo
export async function getTournamentRules(idTournament: string): Promise<TournamentRules> {
  const token = getToken();
  const response = await axios.get(`${API_URL_TOURNAMENTS}/${idTournament}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// 2️⃣ Obtener jugadores suspendidos
export async function getSuspendedPlayers(idTournament: string): Promise<SuspendedPlayer[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL_PLAYERS}/${idTournament}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      status: "SUSPENDED",
    },
  });

  // El backend devuelve { "players": [ ... ] }
  return response.data.players || [];
}

// ==================== 🔹 Exportación agrupada ====================
export default {
  getTournamentRules,
  getSuspendedPlayers,
};
