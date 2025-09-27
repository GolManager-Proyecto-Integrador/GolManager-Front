import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/gestdettournaments";

// 🔹 Interfaces para tipar la data que usa GestionDetallesTorneo.tsx
export interface TournamentData {
  id: string;
  name: string;
  status: "En curso" | "Finalizado" | "Pendiente";
  startDate: string;
  endDate: string;
  teams: number;
  format: string;
}

export interface TeamStanding {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  date: string;
  time?: string;
}

// 🔹 Obtener info general del torneo
async function getTournament(idTournament: string): Promise<TournamentData> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 🔹 Tabla de posiciones
async function getStandings(idTournament: string): Promise<TeamStanding[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/standings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 🔹 Partidos del torneo
async function getMatches(idTournament: string): Promise<Match[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 🔹 Partidos próximos (si tu backend diferencia)
async function getUpcomingMatches(idTournament: string): Promise<Match[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/matches/upcoming`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 🔹 Partidos recientes (si tu backend diferencia)
async function getRecentMatches(idTournament: string): Promise<Match[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/matches/recent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export default {
  getTournament,
  getStandings,
  getMatches,
  getUpcomingMatches,
  getRecentMatches,
};
