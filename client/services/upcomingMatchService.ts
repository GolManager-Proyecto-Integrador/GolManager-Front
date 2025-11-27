import axios from 'axios';
import { getToken } from "./authService";

const API_URL = "/api/tournaments";
const API_REFEREES_URL = "/api/referees";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

// Crear un partido con fecha
export const createMatch = async (tournamentId, matchData) => {
  const url = `${API_URL}/${tournamentId}/matches`;
  const res = await axios.post(url, matchData, authHeaders());
  return res.data;
};

// Generar los partidos automáticamente
export const generateMatches = async (tournamentId) => {
  const url = `${API_URL}/${tournamentId}/matches/generator`;
  const res = await axios.post(url, {}, authHeaders());
  return res.data;
};

// Obtener un partido por ID
export const getMatchById = async (tournamentId, matchId) => {
  const url = `${API_URL}/${tournamentId}/matches/${matchId}`;
  const res = await axios.get(url, authHeaders());
  return res.data;
};

// Obtener próximos partidos
export const getUpcomingMatches = async (tournamentId, numberRegisters = 3) => {
  const url = `${API_URL}/${tournamentId}/matches/upcoming`;
  const res = await axios.get(url, {
    ...authHeaders(),
    params: { numberRegisters }
  });
  return res.data;
};

// Obtener partidos jugados
export const getPlayedMatches = async (tournamentId, numberRegisters = 3) => {
  const url = `${API_URL}/${tournamentId}/matches/played`;
  const res = await axios.get(url, {
    ...authHeaders(),
    params: { numberRegisters }
  });
  return res.data;
};

// Obtener equipos del torneo
export const getTournamentTeams = async (tournamentId) => {
  const url = `${API_URL}/${tournamentId}/teams`;
  const res = await axios.get(url, authHeaders());
  return res.data;
};

// Obtener árbitros
export const getReferees = async () => {
  const res = await axios.get(API_REFEREES_URL, authHeaders());
  return res.data;
};

// Obtener detalles del torneo
export const getTournamentDetails = async (tournamentId) => {
  const url = `${API_URL}/${tournamentId}`;
  const res = await axios.get(url, authHeaders());
  return res.data;
};

// Actualizar partido
export const updateMatch = async (tournamentId, matchData) => {
  const url = `${API_URL}/${tournamentId}/matches`;
  const res = await axios.put(url, matchData, authHeaders());
  return res.data;
};

// Eliminar partido
export const deleteMatch = async (tournamentId, matchId) => {
  const url = `${API_URL}/${tournamentId}/matches?matchId=${matchId}`;
  const res = await axios.delete(url, authHeaders());
  return res.data;
};
