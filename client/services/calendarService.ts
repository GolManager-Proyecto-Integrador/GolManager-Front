import axios from "axios";
import { getToken } from "./authService";

// Ajustar al puerto de backend
const API_URL = "http://localhost:8085/api/calendar";

export interface CalendarMatch {
  id: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;   // formato YYYY-MM-DD
  time: string;   // formato HH:mm
  stadium: string;
  referee: string;
}

export interface Tournament {
  id: string;
  name: string;
}

// Obtener todos los torneos
export async function fetchTournaments(): Promise<Tournament[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/tournaments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 🔹 Obtener partidos (opcional filtrar por torneo)
export async function fetchMatches(tournamentId?: string): Promise<CalendarMatch[]> {
  const token = getToken();
  const url = tournamentId
    ? `${API_URL}/matches?tournamentId=${tournamentId}`
    : `${API_URL}/matches`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Crear nuevo partido
export async function createMatch(match: Omit<CalendarMatch, "id">): Promise<CalendarMatch> {
  const token = getToken();
  const response = await axios.post(`${API_URL}/matches`, match, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Obtener detalle de un partido
export async function fetchMatchById(id: string): Promise<CalendarMatch> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Actualizar partido
export async function updateMatch(id: string, updates: Partial<CalendarMatch>): Promise<CalendarMatch> {
  const token = getToken();
  const response = await axios.put(`${API_URL}/matches/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Eliminar partido
export async function deleteMatch(id: string): Promise<void> {
  const token = getToken();
  await axios.delete(`${API_URL}/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
