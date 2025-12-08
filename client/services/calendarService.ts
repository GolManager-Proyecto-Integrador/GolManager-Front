import axios from 'axios';
import { getToken } from "./authService";

const API_BASE_URL = 'http://localhost:8085/api';

// 🔹 CREAR EL MISMO CLIENTE AXIOS QUE EN teamManagementService
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 AGREGAR EL MISMO INTERCEPTOR DE REQUEST
apiClient.interceptors.request.use(
  (config) => {
    let token = getToken();
    const tokenSource = token ? 'getToken()' : 'localStorage';
    
    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      let cleanToken = token.replace(/^"(.*)"$/, '$1');
      if (cleanToken.startsWith("Bearer ")) {
        cleanToken = cleanToken.slice(7).trim();
      }
      
      // 🔍 DEBUG EXTENDIDO DEL TOKEN
      console.log(`🔐 CalendarService - Token source: ${tokenSource}`);
      console.log(`🔐 CalendarService - Token length: ${cleanToken.length}`);
      
      if (cleanToken && cleanToken !== "null" && cleanToken !== "undefined") {
        config.headers.Authorization = `Bearer ${cleanToken}`;
        console.log('✅ CalendarService - Token configurado en headers');
      } else {
        console.warn('⚠️ CalendarService - Token inválido o vacío después de limpieza');
      }
    } else {
      console.warn('⚠️ CalendarService - No se encontró token en ninguna fuente');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ CalendarService - Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// 🔹 AGREGAR INTERCEPTOR DE RESPUESTA
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ CalendarService - ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method;
    
    console.error(`❌ CalendarService - ${method?.toUpperCase()} ${url} - Status: ${status}`);
    
    if (status === 401) {
      console.error('🔐 CalendarService - ERROR 401 DETECTADO');
      const authHeader = error.config?.headers?.Authorization;
      console.log('🔑 CalendarService - Header Authorization:', authHeader ? 'PRESENTE' : 'AUSENTE');
    }
    
    return Promise.reject(error);
  }
);

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

// Función auxiliar para verificar y obtener el token (mantenida para compatibilidad)
const getValidToken = (): string => {
  const token = getToken();
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    throw new Error('No se encontró token de autenticación');
  }
  return token;
};

export const CalendarioService = {
  // Obtener partidos de un rango de fechas - USANDO apiClient
  getMatches: async (initialDate: string, finishDate: string): Promise<Match[]> => {
    try {
      // Formatear fechas como OffsetDateTime
      const initialDateTime = formatToOffsetDateTime(initialDate, true);
      const finishDateTime = formatToOffsetDateTime(finishDate, false);
      
      console.log('📅 CalendarService - Sending dates as OffsetDateTime:', { 
        initialDate: initialDateTime, 
        finishDate: finishDateTime 
      });
      
      const response = await apiClient.get<Match[]>('/tournaments/matches/calendar', {
        params: { 
          initialDate: initialDateTime, 
          finishDate: finishDateTime 
        }
      });
      
      console.log('✅ CalendarService - Matches response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ CalendarService - Error fetching matches:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 CalendarService - Matches error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      throw error;
    }
  },

  // Crear un nuevo partido - USANDO apiClient
  createMatch: async (payload: CreateMatchPayload): Promise<CreatedMatchResponse> => {
    try {
      console.log('🚀 CalendarService - Creating match with payload:', payload);
      
      const response = await apiClient.post<CreatedMatchResponse>(
        '/tournaments/matches/calendar', 
        payload
      );
      
      console.log('✅ CalendarService - Match created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService - Error creating match:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 CalendarService - Create match error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      throw error;
    }
  },

  // Obtener todos los torneos - USANDO apiClient
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get('/tournaments');
      
      console.log('🏆 CalendarService - Tournaments raw response:', response.data);
      
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
      console.log(`✅ CalendarService - Loaded ${result.length} tournaments`);
      return result;
    } catch (error) {
      console.error('❌ CalendarService - Error fetching tournaments:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 CalendarService - Tournaments error details:', {
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

  // Obtener equipos por torneo - USANDO apiClient
  getTeamsByTournament: async (tournamentId: number): Promise<Team[]> => {
    try {
      console.log(`👥 CalendarService - Fetching teams for tournament ${tournamentId}`);
      
      const response = await apiClient.get(`/tournaments/${tournamentId}/teams`);
      
      console.log(`✅ CalendarService - Teams for tournament ${tournamentId}:`, response.data);
      
      let teamsData = response.data;
      
      // Manejar diferentes estructuras de respuesta
      if (teamsData && typeof teamsData === 'object' && teamsData.teams) {
        teamsData = teamsData.teams;
      }
      
      if (teamsData && typeof teamsData === 'object' && teamsData.data) {
        teamsData = teamsData.data;
      }
      
      const result = Array.isArray(teamsData) ? teamsData : [];
      console.log(`✅ CalendarService - Loaded ${result.length} teams for tournament ${tournamentId}`);
      
      // Verificar la estructura de los equipos
      if (result.length > 0) {
        console.log('🔍 CalendarService - First team structure:', result[0]);
        console.log('🔍 CalendarService - Team keys:', Object.keys(result[0]));
      }
      
      return result;
    } catch (error) {
      console.error(`❌ CalendarService - Error fetching teams for tournament ${tournamentId}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 CalendarService - Teams error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      return [];
    }
  },

  // Obtener detalles completos de un equipo específico - USANDO apiClient
  getTeamDetails: async (tournamentId: number, teamId: number): Promise<Team> => {
    try {
      console.log('🔍 CalendarService - Fetching team details with:', { tournamentId, teamId });
      
      const response = await apiClient.get<Team>(
        `/tournaments/${tournamentId}/teams/${teamId}`
      );
      
      console.log('✅ CalendarService - Team details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CalendarService - Error fetching team details:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 CalendarService - Team details error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        // Si es error 401, el token podría estar expirado
        if (error.response?.status === 401) {
          console.warn('⚠️ CalendarService - Authentication error - token might be expired or invalid');
        }
        
        // Si es error 404, el endpoint podría no existir
        if (error.response?.status === 404) {
          console.warn('⚠️ CalendarService - Endpoint not found - team details endpoint might not be available');
          
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
          
          console.log('🔄 CalendarService - Returning fallback team data:', fallbackTeam);
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
      console.warn('⚠️ CalendarService - Could not fetch team details, using fallback stadiums');
      // Si falla, retornar estadios vacíos
      return {
        mainStadium: '',
        secondaryStadium: ''
      };
    }
  },

  // Obtener árbitros - USANDO apiClient
  getReferees: async (): Promise<Referee[]> => {
    try {
      const response = await apiClient.get<RefereesResponse>('/referees');
      
      console.log('✅ CalendarService - Referees response:', response.data);
      
      let refereesData = response.data;
      
      // Extraer el array de referees de la respuesta
      if (refereesData && typeof refereesData === 'object' && refereesData.referees) {
        const result = Array.isArray(refereesData.referees) ? refereesData.referees : [];
        console.log(`✅ CalendarService - Loaded ${result.length} referees`);
        return result;
      }
      
      // Si la respuesta ya es un array
      const result = Array.isArray(refereesData) ? refereesData : [];
      console.log(`✅ CalendarService - Loaded ${result.length} referees`);
      return result;
    } catch (error) {
      console.error('❌ CalendarService - Error fetching referees:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔍 CalendarService - Referees error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      }
      // Si hay error 404 (no hay árbitros), retornar array vacío
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('ℹ️ CalendarService - No referees found, returning empty array');
        return [];
      }
      return [];
    }
  },
};