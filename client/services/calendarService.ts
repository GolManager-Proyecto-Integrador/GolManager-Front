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
  matchDateTime: string;
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

// Función auxiliar para formatear fechas como OffsetDateTime
const formatToOffsetDateTime = (dateString: string, isStart: boolean = true): string => {
  const date = new Date(dateString);
  const timePart = isStart ? 'T00:00:00' : 'T23:59:59';
  
  // Obtener el offset en formato ±HH:MM
  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
  const minutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
  const offset = `${sign}${hours}:${minutes}`;
  
  // Formato: YYYY-MM-DDTHH:mm:ss±HH:MM
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}${timePart}${offset}`;
};

// Función auxiliar para verificar y obtener el token
const getValidToken = (): string => {
  const token = getToken();
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    throw new Error('No se encontró token de autenticación');
  }
  return token;
};

export const CalendarioService = {
  // Obtener partidos de un rango de fechas
  getMatches: async (initialDate: string, finishDate: string): Promise<Match[]> => {
    try {
      const token = getValidToken();
      
      // Formatear fechas como OffsetDateTime
      const initialDateTime = formatToOffsetDateTime(initialDate, true);
      const finishDateTime = formatToOffsetDateTime(finishDate, false);
      
      console.log('📅 Sending dates as OffsetDateTime:', { 
        initialDate: initialDateTime, 
        finishDate: finishDateTime 
      });
      
      const response = await axios.get<Match[]>(`${API_BASE_URL}/tournaments/matches/calendar`, {
        params: { 
          initialDate: initialDateTime, 
          finishDate: finishDateTime 
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('✅ Matches response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Matches error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      throw error;
    }
  },

  // Crear un nuevo partido
  createMatch: async (payload: CreateMatchPayload): Promise<CreatedMatchResponse> => {
    try {
      const token = getValidToken();
      
      console.log('🚀 Creating match with payload:', payload);
      
      const response = await axios.post<CreatedMatchResponse>(
        `${API_BASE_URL}/tournaments/matches/calendar`, 
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('✅ Match created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating match:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Create match error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      throw error;
    }
  },

  // Obtener todos los torneos - con manejo de diferentes estructuras
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const token = getValidToken();
      
      const response = await axios.get(`${API_BASE_URL}/tournaments`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('🏆 Tournaments raw response:', response.data);
      
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
      const result = Array.isArray(tournamentsData) ? tournamentsData : [];
      console.log(`✅ Loaded ${result.length} tournaments`);
      return result;
    } catch (error) {
      console.error('❌ Error fetching tournaments:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Tournaments error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      // Retornar array vacío en caso de error
      return [];
    }
  },

  // Obtener equipos por torneo - MEJORADO
  getTeamsByTournament: async (tournamentId: number): Promise<Team[]> => {
    try {
      const token = getValidToken();
      
      console.log(`👥 Fetching teams for tournament ${tournamentId}`);
      
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/teams`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log(`✅ Teams for tournament ${tournamentId}:`, response.data);
      
      let teamsData = response.data;
      
      // Manejar diferentes estructuras de respuesta
      if (teamsData && typeof teamsData === 'object' && teamsData.teams) {
        teamsData = teamsData.teams;
      }
      
      if (teamsData && typeof teamsData === 'object' && teamsData.data) {
        teamsData = teamsData.data;
      }
      
      const result = Array.isArray(teamsData) ? teamsData : [];
      console.log(`✅ Loaded ${result.length} teams for tournament ${tournamentId}`);
      
      // Verificar la estructura de los equipos
      if (result.length > 0) {
        console.log('🔍 First team structure:', result[0]);
        console.log('🔍 Team keys:', Object.keys(result[0]));
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Error fetching teams for tournament ${tournamentId}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Teams error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      return [];
    }
  },

  // Obtener detalles completos de un equipo específico - MEJORADO CON FALLBACK
  getTeamDetails: async (tournamentId: number, teamId: number): Promise<Team> => {
    try {
      const token = getValidToken();
      
      console.log('🔍 Fetching team details with:', { tournamentId, teamId, token: !!token });
      
      const response = await axios.get<Team>(
        `${API_BASE_URL}/tournaments/${tournamentId}/teams/${teamId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('✅ Team details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching team details:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Team details error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        // Si es error 401, el token podría estar expirado
        if (error.response?.status === 401) {
          console.warn('⚠️ Authentication error - token might be expired or invalid');
        }
        
        // Si es error 404, el endpoint podría no existir
        if (error.response?.status === 404) {
          console.warn('⚠️ Endpoint not found - team details endpoint might not be available');
          
          // Crear un equipo por defecto con estadios vacíos
          const fallbackTeam: Team = {
            teamId: teamId,
            name: 'Equipo no disponible',
            coach: '',
            category: 'UNKNOWN',
            mainStadium: '',
            secondaryStadium: '',
            dateCreated: new Date().toISOString()
          };
          
          console.log('🔄 Returning fallback team data:', fallbackTeam);
          return fallbackTeam;
        }
      }
      
      // Para otros errores, lanzar la excepción
      throw error;
    }
  },

  // Método alternativo para obtener estadios si getTeamDetails falla
  getTeamStadiums: async (tournamentId: number, teamId: number): Promise<{mainStadium: string; secondaryStadium: string}> => {
    try {
      // Primero intentar con el endpoint específico
      const teamDetails = await CalendarioService.getTeamDetails(tournamentId, teamId);
      return {
        mainStadium: teamDetails.mainStadium || '',
        secondaryStadium: teamDetails.secondaryStadium || ''
      };
    } catch (error) {
      console.warn('⚠️ Could not fetch team details, using fallback stadiums');
      // Si falla, retornar estadios vacíos
      return {
        mainStadium: '',
        secondaryStadium: ''
      };
    }
  },

  // Obtener árbitros
  getReferees: async (): Promise<Referee[]> => {
    try {
      const token = getValidToken();
      
      const response = await axios.get<RefereesResponse>(
        `${API_BASE_URL}/referees`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('✅ Referees response:', response.data);
      
      let refereesData = response.data;
      
      // Extraer el array de referees de la respuesta
      if (refereesData && typeof refereesData === 'object' && refereesData.referees) {
        const result = Array.isArray(refereesData.referees) ? refereesData.referees : [];
        console.log(`✅ Loaded ${result.length} referees`);
        return result;
      }
      
      // Si la respuesta ya es un array
      const result = Array.isArray(refereesData) ? refereesData : [];
      console.log(`✅ Loaded ${result.length} referees`);
      return result;
    } catch (error) {
      console.error('❌ Error fetching referees:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 Referees error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      // Si hay error 404 (no hay árbitros), retornar array vacío
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('ℹ️ No referees found, returning empty array');
        return [];
      }
      return [];
    }
  },
};