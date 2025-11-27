import axios from "axios";
import { getToken } from "./authService";

// Ajustar esta URL según backend (podemos usar import.meta.env.VITE_API_URL)
const API_URL = "http://localhost:8085/api/tournaments";

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "pendiente" | "en_curso" | "finalizado";
  description: string;
}

export interface Match {
  id: number;
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

const tournamentService = {
  async getTournamentDetails(id: string): Promise<Tournament> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async getMatches(tournamentId: string): Promise<Match[]> {
    const response = await axios.get(`${API_URL}/${tournamentId}/matches`);
    return response.data;
  },

  async getStandings(tournamentId: string): Promise<TeamPosition[]> {
    const response = await axios.get(`${API_URL}/${tournamentId}/standings`);
    return response.data;
  }
};

export default tournamentService;
