//GestionCompetencias.tsx
//CreateTorurnamentModal.tsx

import axios from "axios";
import { getToken } from "./authService";

// Ajustar al puerto y ruta de backend
const API_URL = "http://localhost:8085/api/tournaments";
const REFEREES_URL = "http://localhost:8085/api/referees"; 

// Interfaces
export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: "En curso" | "Finalizado" | "Pendiente";
  numberOfTeams: number;
  format: string;
  roundTrip?: boolean;
  yellowCards?: number;
  referees?: number[];
}

export interface Match {
  id: string;
  date: string;
  time: string;
  teamA: string;
  teamB: string;
  phase: string;
  result?: {
    scoreA: number;
    scoreB: number;
    winner: string;
  };
}

export interface TeamPosition {
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
  isQualified?: boolean;
}

// 🔹 Nueva interfaz para árbitros
export interface Referee {
  id: number;
  name: string;
}

// Obtener todas las competencias
async function getTournaments(): Promise<Tournament[]> {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Obtener detalles de una competencia
async function getTournamentDetails(id: string): Promise<Tournament> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ✅ Crear nueva competencia (TRADUCCIÓN DE CAMPOS AQUÍ)
async function createTournament(tournament: Omit<Tournament, "id">): Promise<Tournament> {
  const token = getToken();

  // 🔹 Traducimos nombres del front → backend
  const payload = {
    name: tournament.name,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    format: tournament.format,
    numberOfTeams: tournament.numberOfTeams,
    homeAndAway: tournament.roundTrip,              // 👈 el backend espera este nombre
    yellowCardsSuspension: tournament.yellowCards,  // 👈 el backend espera este nombre
    refereeIds: tournament.referees?.map(Number) || [],
    status: tournament.status,
  };

  const response = await axios.post(`${API_URL}/create`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ✅ Actualizar competencia (también traducimos aquí)
async function updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
  const token = getToken();

  const payload = {
    name: updates.name,
    startDate: updates.startDate,
    endDate: updates.endDate,
    format: updates.format,
    numberOfTeams: updates.numberOfTeams,
    homeAndAway: updates.roundTrip,
    yellowCardsSuspension: updates.yellowCards,
    refereeIds: updates.referees?.map(Number) || [],
    status: updates.status,
  };

  const response = await axios.put(`${API_URL}/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Eliminar competencia
async function deleteTournament(id: string): Promise<void> {
  const token = getToken();
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener partidos de un torneo
async function getMatches(tournamentId: string): Promise<Match[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${tournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Obtener tabla de posiciones de un torneo
async function getStandings(tournamentId: string): Promise<TeamPosition[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${tournamentId}/standings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Obtener lista de árbitros
async function getReferees(): Promise<Referee[]> {
  const token = getToken();
  const response = await axios.get(REFEREES_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.referees;
}

export default {
  getTournaments,
  getTournamentDetails,
  createTournament,
  updateTournament,
  deleteTournament,
  getMatches,
  getStandings,
  getReferees,
};
