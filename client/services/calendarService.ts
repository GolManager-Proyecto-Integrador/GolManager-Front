import axios from 'axios';
import { getToken } from "./authService";

const API_BASE_URL = 'http://localhost:8085/api';


export interface Match {
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

export interface CreateMatchPayload {
  homeTeamId: number;
  awayTeamId: number;
  tournamentId: number;
  stadiumName: string;
  referee: number;
  matchDate: string;
}

export interface CreatedMatchResponse {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  stadiumName: string;
  matchDate: string;
}

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  numberOfTeams: number;
  format: string;
}

export interface Team {
  teamId: number;
  name: string;
  coach: string;
  category: string;
  mainStadium: string;
  secondaryStadium: string;
  dateCreated: string;
}

export interface Referee {
  id: number;
  name: string;
}

export interface RefereesResponse {
  referees: Referee[];
}


export const CalendarioService = {
  // Obtener partidos de un rango de fechas
  getMatches: async (initialDate: string, finishDate: string): Promise<Match[]> => {
    try {
      const token = getToken();
      const response = await axios.get<Match[]>(`${API_BASE_URL}/tournaments/matches/calendar`, {
        params: { initialDate, finishDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Matches response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  },

  // Crear un nuevo partido
  createMatch: async (payload: CreateMatchPayload): Promise<CreatedMatchResponse> => {
    try {
      const token = getToken();
      const response = await axios.post<CreatedMatchResponse>(
        `${API_BASE_URL}/tournaments/matches/calendar`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // Obtener todos los torneos - con manejo de diferentes estructuras
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/tournaments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Tournaments raw response:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let tournamentsData = response.data;
      
      // Si es un objeto con propiedad 'tournaments'
      if (tournamentsData && typeof tournamentsData === 'object' && tournamentsData.tournaments) {
        tournamentsData = tournamentsData.tournaments;
      }
      
      // Si es un objeto con propiedad 'data'
      if (tournamentsData && typeof tournamentsData === 'object' && tournamentsData.data) {
        tournamentsData = tournamentsData.data;
      }
      
      // Asegurar que siempre sea un array
      return Array.isArray(tournamentsData) ? tournamentsData : [];
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  },

  // Obtener equipos por torneo
  getTeamsByTournament: async (tournamentId: number): Promise<Team[]> => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(`Teams for tournament ${tournamentId}:`, response.data);
      
      let teamsData = response.data;
      
      // Manejar diferentes estructuras de respuesta
      if (teamsData && typeof teamsData === 'object' && teamsData.teams) {
        teamsData = teamsData.teams;
      }
      
      if (teamsData && typeof teamsData === 'object' && teamsData.data) {
        teamsData = teamsData.data;
      }
      
      return Array.isArray(teamsData) ? teamsData : [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  },

  // Obtener árbitros
  getReferees: async (): Promise<Referee[]> => {
    try {
      const token = getToken();
      const response = await axios.get<RefereesResponse>(
        `${API_BASE_URL}/referees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Referees response:', response.data);
      
      let refereesData = response.data;
      
      // Extraer el array de referees de la respuesta
      if (refereesData && typeof refereesData === 'object' && refereesData.referees) {
        return Array.isArray(refereesData.referees) ? refereesData.referees : [];
      }
      
      // Si la respuesta ya es un array
      return Array.isArray(refereesData) ? refereesData : [];
    } catch (error) {
      console.error('Error fetching referees:', error);
      // Si hay error 404 (no hay árbitros), retornar array vacío
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      return [];
    }
  },
};