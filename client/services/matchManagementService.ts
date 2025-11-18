// src/services/matchManagementService.ts
import axios from "axios";

const API_BASE = "/api";

export interface MatchDetailResponse {
  tournamentId: number;
  tournamentName: string;
  matchId: number;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
  matchDateTIme: string;
  stadium: string;
  goalsHomeTeam: number;
  goalsAwayTeam: number;
  refereeId: number;
  refereeName: string;
}

export interface UpdateMatchRequest {
  matchDateTIme: string;   // "2025-10-24 02:10:00+0000"
  stadium: string;
  refereeId: number;
}

export interface UpdateScoreRequest {
  goalsHomeTeam: number;
  goalsAwayTeam: number;
}

export interface MatchEventRequest {
  minute: number;
  playerId: number;
  eventType: "goal" | "yellow" | "red";
  teamId: number;
}

export const MatchManagementService = {
  /**
   * Obtener los detalles del partido
   */
  async getMatchDetails(tournamentId: string, matchId: string) {
    const url = `${API_BASE}/tournaments/${tournamentId}/teams/${matchId}`;
    const response = await axios.get<MatchDetailResponse>(url);
    return response.data;
  },

  /**
   * Reprogramar partido (PUT)
   */
  async updateMatch(tournamentId: string, matchId: string, data: UpdateMatchRequest) {
    const url = `${API_BASE}/tournaments/${tournamentId}/teams/${matchId}`;
    const response = await axios.put(url, data);
    return response.data;
  },

  /**
   * Actualizar marcador del partido (PUT)
   */
  async updateScore(tournamentId: string, matchId: string, data: UpdateScoreRequest) {
    const url = `${API_BASE}/tournaments/${tournamentId}/teams/${matchId}/score`;
    const response = await axios.put(url, data);
    return response.data;
  },

  /**
   * Registrar evento del partido (POST)
   */
  async registerEvent(tournamentId: string, matchId: string, data: MatchEventRequest) {
    const url = `${API_BASE}/tournaments/${tournamentId}/teams/${matchId}/events`;
    const response = await axios.post(url, data);
    return response.data;
  }
};
