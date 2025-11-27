// MatchManagement.tsx - VERSIÓN CORREGIDA

import axios from "axios";
import { getToken } from "./authService";

// ===========================
// CONFIGURACIÓN BASE
// ===========================
const API_BASE = "/api/tournaments";

// ===========================
// HEADERS AUTORIZACIÓN
// ===========================
const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// ===========================
// INTERFACES
// ===========================
interface GoalResponse {
  goalId: number;
  matchId: number;
  matchDate: string;
  playerId: number;
  playerTeamId: number;
  playerTeamName: string;
  minute: number;
}

interface CardResponse {
  cardId: number;
  matchId: number;
  cardColor: "RED" | "YELLOW";
  matchDate: string;
  playerId: number;
  playerTeamId: number;
  playerTeamName: string;
  minute: number;
}

interface MatchEventsResponse {
  listGoals: GoalResponse[];
  listCards: CardResponse[];
}

// ===========================
// GET — DETALLES DEL PARTIDO
// ===========================
export const getMatchDetails = async (tournamentId: number, matchId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/${matchId}`;
  const response = await axios.get(url, authHeaders());
  return response.data;
};

// ===========================
// GET — TABLA DE POSICIONES (ASUMIENDO QUE EXISTE)
// ===========================
export const getTournamentPositions = async (tournamentId: number) => {
  const url = `${API_BASE}/${tournamentId}/positions`;
  const response = await axios.get(url, authHeaders());
  return response.data;
};

// ===========================
// GET — LISTA DE EVENTOS DEL PARTIDO
// ===========================
export const getMatchEvents = async (tournamentId: number, matchId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/${matchId}`;
  const response = await axios.get(url, authHeaders());
  return response.data as MatchEventsResponse;
};

// ======================================================
// ===================  CRUD GOLES  ======================
// ======================================================

// GET — DETALLE DE UN GOL
export const getGoalDetails = async (tournamentId: number, goalId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/goal/${goalId}`;
  const response = await axios.get(url, authHeaders());
  return response.data as GoalResponse;
};

// POST — REGISTRA UN NUEVO GOL
export const createGoal = async (
  tournamentId: number,
  body: {
    matchId: number;
    playerId: number;
    goalMinute: number;
  }
) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/goal`;
  const response = await axios.post(url, body, authHeaders());
  return response.data as GoalResponse;
};

// PUT — ACTUALIZA UN GOL
export const updateGoal = async (
  tournamentId: number,
  goalId: number,
  body: {
    matchId: number;
    playerId: number;
    goalMinute: number;
  }
) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/goal/${goalId}`;
  const response = await axios.put(url, body, authHeaders());
  return response.data as GoalResponse;
};

// DELETE — ELIMINAR UN GOL
export const deleteGoal = async (tournamentId: number, goalId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/goal/${goalId}`;
  const response = await axios.delete(url, authHeaders());
  return response.data;
};

// ======================================================
// ===================  CRUD TARJETAS  ===================
// ======================================================

// GET — DETALLE DE UNA TARJETA
export const getCardDetails = async (tournamentId: number, cardId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/card/${cardId}`;
  const response = await axios.get(url, authHeaders());
  return response.data as CardResponse;
};

// POST — REGISTRAR TARJETA
export const createCard = async (
  tournamentId: number,
  body: {
    matchId: number;
    playerId: number;
    cardMinute: number;
    cardColor: "RED" | "YELLOW";
  }
) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/card`;
  const response = await axios.post(url, body, authHeaders());
  return response.data as CardResponse;
};

// PUT — ACTUALIZAR TARJETA
export const updateCard = async (
  tournamentId: number,
  cardId: number,
  body: {
    matchId: number;
    playerId: number;
    cardMinute: number;
    cardColor: "RED" | "YELLOW";
  }
) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/card/${cardId}`;
  const response = await axios.put(url, body, authHeaders());
  return response.data as CardResponse;
};

// DELETE — ELIMINAR TARJETA
export const deleteCard = async (tournamentId: number, cardId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/card/${cardId}`;
  const response = await axios.delete(url, authHeaders());
  return response.data;
};

// ======================================================
// ===================  FUNCIONES ADICIONALES  ===========
// ======================================================

// GET — JUGADORES POR EQUIPO (ASUMIENDO QUE EXISTE)
export const getTeamPlayers = async (tournamentId: number, teamId: number) => {
  const url = `${API_BASE}/${tournamentId}/teams/${teamId}/players`;
  try {
    const response = await axios.get(url, authHeaders());
    return response.data;
  } catch (error) {
    console.warn('Endpoint de jugadores no disponible, retornando array vacío');
    return [];
  }
};

// PUT — REPROGRAMAR PARTIDO (ASUMIENDO QUE EXISTE)
export const updateMatchSchedule = async (
  tournamentId: number,
  matchId: number,
  body: {
    matchDate: string;
    stadiumName: string;
    referee: number;
  }
) => {
  const url = `${API_BASE}/${tournamentId}/matches/${matchId}`;
  try {
    const response = await axios.put(url, body, authHeaders());
    return response.data;
  } catch (error) {
    console.error('Error reprogramando partido:', error);
    throw error;
  }
};