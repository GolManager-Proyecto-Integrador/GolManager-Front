// MatchManagement.tsx

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
// GET — DETALLES DEL PARTIDO
// ===========================
export const getMatchDetails = async (tournamentId: number, matchId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/${matchId}`;

  const response = await axios.get(url, authHeaders());
  return response.data; // Retorna exactamente el JSON que envía el backend
};

// ===========================
// GET — TABLA DE POSICIONES
// ===========================
export const getTournamentPositions = async (tournamentId: number) => {
  const url = `${API_BASE}/${tournamentId}/positions`;

  const response = await axios.get(url, authHeaders());
  return response.data; // { positions: [...] }
};

// ===========================
// GET — LISTA DE EVENTOS DEL PARTIDO
// ===========================
export const getMatchEvents = async (tournamentId: number, matchId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/${matchId}`;

  const response = await axios.get(url, authHeaders());
  return response.data; // { listGoals: [...], listCards: [...] }
};

// ======================================================
// ===================  CRUD GOLES  ======================
// ======================================================

// GET — DETALLE DE UN GOL
export const getGoalDetails = async (tournamentId: number, goalId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/goal/${goalId}`;

  const response = await axios.get(url, authHeaders());
  return response.data;
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
  return response.data;
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
  return response.data;
};

// DELETE — ELIMINAR UN GOL
export const deleteGoal = async (tournamentId: number, goalId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/goal/${goalId}`;

  const response = await axios.delete(url, authHeaders());
  return response.data; // { elementId, elementName, deletionElementDate }
};

// ======================================================
// ===================  CRUD TARJETAS  ===================
// ======================================================

// GET — DETALLE DE UNA TARJETA
export const getCardDetails = async (tournamentId: number, cardId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/card/${cardId}`;

  const response = await axios.get(url, authHeaders());
  return response.data;
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
  return response.data;
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
  return response.data;
};

// DELETE — ELIMINAR TARJETA
export const deleteCard = async (tournamentId: number, cardId: number) => {
  const url = `${API_BASE}/${tournamentId}/matches/events/card/${cardId}`;

  const response = await axios.delete(url, authHeaders());
  return response.data;
};
