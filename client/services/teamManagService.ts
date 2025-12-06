import axios from "axios";
import { getToken } from "./authService";

const API_BASE = "http://localhost:8085/api";

// =======================
// 🔹 CONFIGURACIÓN AXIOS CON DEBUG EXTENDIDO
// =======================
const tournamentsApiClient = axios.create({
  baseURL: `${API_BASE}/tournaments`,
  headers: {
    "Content-Type": "application/json",
  },
});

const playersApiClient = axios.create({
  baseURL: `${API_BASE}/players`,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// 🔹 INTERCEPTORES COMPARTIDOS
// =======================
const setupInterceptor = (apiClient: any, clientName: string) => {
  // Interceptor de request CON DEBUG COMPLETO
  apiClient.interceptors.request.use(
    (config: any) => {
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
        console.group(`🔐 ${clientName} Request Interceptor - ${config.method?.toUpperCase()} ${config.url}`);
        console.log('📋 Token source:', tokenSource);
        console.log('🔢 Token length:', cleanToken.length);
        console.log('👀 Token preview:', cleanToken.substring(0, 20) + '...');
        console.log('🎯 Endpoint:', config.url);
        console.log('📝 Method:', config.method);
        console.groupEnd();
        
        // Verificar que el token no esté vacío
        if (cleanToken && cleanToken !== "null" && cleanToken !== "undefined") {
          config.headers.Authorization = `Bearer ${cleanToken}`;
          console.log('✅ Token configurado en headers');
        } else {
          console.warn('⚠️ Token inválido o vacío después de limpieza');
          console.log('🔍 Token después de limpieza:', cleanToken);
        }
      } else {
        console.warn('⚠️ No se encontró token en ninguna fuente');
        console.log('🔍 localStorage token:', localStorage.getItem("token"));
        console.log('🔍 getToken():', getToken());
      }
      
      // 🔍 DEBUG de headers completos
      console.log('📨 Headers finales:', {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers['Authorization'] ? '***PRESENTE***' : 'AUSENTE'
      });
      
      return config;
    },
    (error: any) => {
      console.error(`❌ Error en ${clientName} request interceptor:`, error);
      return Promise.reject(error);
    }
  );

  // Interceptor de respuesta CON DEBUG MEJORADO
  apiClient.interceptors.response.use(
    (response: any) => {
      console.group(`✅ ${clientName} Response Success - ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('📊 Status:', response.status);
      console.log('📦 Data preview:', response.data ? 'DATA_RECIBIDA' : 'SIN_DATA');
      if (response.config.method?.toUpperCase() === 'GET') {
        console.log('🔢 Cantidad de elementos:', Array.isArray(response.data) ? response.data.length : 'N/A');
      }
      console.groupEnd();
      return response;
    },
    (error: any) => {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method;
      
      console.group(`❌ ${clientName} Response Error - ${method?.toUpperCase()} ${url}`);
      console.log('📊 Status:', status);
      console.log('🔍 URL:', url);
      console.log('📝 Method:', method);
      console.log('📄 Error data:', error.response?.data);
      console.log('🔧 Config:', {
        headers: error.config?.headers,
        baseURL: error.config?.baseURL,
        data: error.config?.data
      });
      
      if (status === 401) {
        console.error('🔐 ERROR 401 DETECTADO - Posibles causas:');
        console.log('   • Token expirado');
        console.log('   • Token inválido');
        console.log('   • Falta de permisos');
        console.log('   • Problema de CORS');
        console.log('   • Endpoint requiere autenticación diferente');
        
        // 🔍 DEBUG ESPECÍFICO PARA 401
        const authHeader = error.config?.headers?.Authorization;
        console.log('🔑 Header Authorization enviado:', authHeader ? 'PRESENTE' : 'AUSENTE');
        if (authHeader) {
          console.log('   📏 Longitud:', authHeader.length);
          console.log('   👀 Preview:', authHeader.substring(0, 30) + '...');
        }
      }
      
      console.groupEnd();
      
      return Promise.reject(error);
    }
  );
};

setupInterceptor(tournamentsApiClient, 'Tournaments');
setupInterceptor(playersApiClient, 'Players');

// =======================
// 🔹 MODELOS FRONTEND
// =======================
export interface Player {
  id?: number;
  name: string;
  position: string;
  dorsalNumber: number;
  age?: number;
  starter?: boolean;
  goals?: number;
  yellowCards?: number;
  redCards?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Team {
  id: number;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField?: string;
  players: Player[];
}

export const positions = [
  { value: "PO", label: "Portero" },
  { value: "DF", label: "Defensa" },
  { value: "MC", label: "Mediocampista" },
  { value: "DL", label: "Delantero" },
];

// =======================
// 🔹 MAPEO DE CATEGORÍAS CORREGIDO
// =======================
const categoryMapping: { [key: string]: string } = {
  'sub-15': 'SUB15',
  'sub-17': 'SUB17', 
  'sub-20': 'SUB20',
  'libre': 'LIBRE',
  'sub-13': 'SUB13'
};

const reverseCategoryMapping: { [key: string]: string } = {
  'SUB13': 'sub-13',
  'SUB15': 'sub-15',
  'SUB17': 'sub-17',
  'SUB20': 'sub-20', 
  'LIBRE': 'libre'
};

// =======================
// 🔹 MODELOS BACKEND PARA JUGADORES
// =======================
export interface BackendPlayer {
  idPlayer?: number;
  name: string;
  position: string;
  starter?: boolean;
  shirtNumber: number;
  goals?: number;
  yellowCards?: number;
  redCards?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdatePlayerRequest {
  idPlayer: number;
  name: string;
  position: string;
  starter?: boolean;
  shirtNumber: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// =======================
// 🔹 REQUESTS BACKEND CORREGIDOS
// =======================
export interface CreatePlayerRequest {
  name: string;
  age?: number;
  playerPosition: string;
  shirtNumber: number;
}

export interface CreateTeamRequest {
  teamName: string;
  coachName: string;
  teamCategory: string;
  mainStadium: string;
  secondaryStadium?: string;
  teamPlayers: CreatePlayerRequest[];
}

export interface UpdateTeamRequest {
  name: string;
  coach: string;
  teamCategory: string;
  mainStadium: string;
  secondaryStadium?: string;
}

// =======================
// 🔹 SERVICE METHODS COMPLETOS
// =======================
class TeamService {

  // =======================
  // 🔹 MÉTODOS DE EQUIPOS
  // =======================

  // GET all teams - CON DEBUG MEJORADO
  async getTeams(idTournament: number): Promise<Team[]> {
    try {
      console.group(`🔄 GET Teams - Tournament ${idTournament}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams`);
      
      const res = await tournamentsApiClient.get(`/${idTournament}/teams`);
      console.log('📦 Respuesta completa del backend:', res.data);
      
      let teamsData = res.data;
      
      if (teamsData && typeof teamsData === 'object') {
        if (Array.isArray(teamsData)) {
          teamsData = teamsData;
          console.log('📊 Datos son array directo');
        } else if (teamsData.teams && Array.isArray(teamsData.teams)) {
          teamsData = teamsData.teams;
          console.log('📊 Datos en propiedad teams');
        } else if (teamsData.referees && Array.isArray(teamsData.referees)) {
          console.warn('⚠️ El backend está devolviendo referees en lugar de teams');
          teamsData = teamsData.referees;
        } else {
          teamsData = Object.values(teamsData).find(val => Array.isArray(val)) || [];
          console.log('📊 Datos encontrados en valores del objeto');
        }
      }

      if (!Array.isArray(teamsData)) {
        console.warn('⚠️ teamsData no es un array:', teamsData);
        console.groupEnd();
        return [];
      }

      // 🔹 CORRECCIÓN CRÍTICA: Eliminar equipos duplicados por ID
      const uniqueTeamsMap = new Map();
      
      teamsData.forEach((backendTeam: any, index: number) => {
        const teamId = backendTeam.teamId || backendTeam.id || index + 1;
        
        // Si ya existe un equipo con este ID, no lo agregamos
        if (!uniqueTeamsMap.has(teamId)) {
          const backendCategory = backendTeam.teamCategory || backendTeam.category;
          const frontendCategory = reverseCategoryMapping[backendCategory] || 'libre';

          const mappedTeam = {
            id: teamId,
            name: backendTeam.teamName || backendTeam.name || `Equipo ${teamId}`,
            coach: backendTeam.coachName || backendTeam.coach || 'Sin DT asignado',
            category: frontendCategory,
            mainField: backendTeam.mainStadium || backendTeam.mainField || 'Cancha principal',
            secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField || '',
            players: Array.isArray(backendTeam.teamPlayers) ? backendTeam.teamPlayers.map((p: any) => ({
              id: p.id || Date.now() + Math.random(),
              name: p.name || 'Jugador sin nombre',
              position: p.playerPosition || p.position || 'DF',
              dorsalNumber: p.shirtNumber || p.dorsalNumber || 0,
              age: p.age || 18
            })) : []
          };

          uniqueTeamsMap.set(teamId, mappedTeam);
          console.log(`🔍 Equipo mapeado [${index}]:`, mappedTeam.name, '- ID:', mappedTeam.id);
        } else {
          console.warn(`⚠️ Equipo duplicado con ID ${teamId} filtrado`);
        }
      });

      const mappedTeams = Array.from(uniqueTeamsMap.values());
      console.log('✅ Equipos mapeados exitosamente (sin duplicados):', mappedTeams.length);
      console.groupEnd();
      return mappedTeams;

    } catch (error: any) {
      console.error('❌ Error en getTeams:', error);
      console.groupEnd();
      throw error;
    }
  }

  // GET team by id - CORREGIDO SEGÚN DOCUMENTACIÓN BACKEND
  async getTeam(idTournament: number, idTeam: number): Promise<Team> {
    try {
      console.group(`🔍 GET Team - Tournament ${idTournament}, Team ${idTeam}`);
      const res = await tournamentsApiClient.get(`/${idTournament}/teams/${idTeam}`);
      const backendTeam = res.data;

      console.log('📦 Respuesta de equipo individual:', backendTeam);

      // 🔹 CORRECCIÓN: Según documentación, el backend usa "category" no "teamCategory"
      const backendCategory = backendTeam.category || backendTeam.teamCategory;
      const frontendCategory = reverseCategoryMapping[backendCategory] || 'libre';

      const result = {
        id: backendTeam.teamId || backendTeam.id || idTeam,
        name: backendTeam.name || backendTeam.teamName,
        coach: backendTeam.coach || backendTeam.coachName,
        category: frontendCategory,
        mainField: backendTeam.mainStadium || backendTeam.mainField,
        secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField || '',
        players: [] // Los jugadores se cargan por separado
      };
      
      console.log('✅ Equipo mapeado (sin jugadores):', result);
      console.groupEnd();
      return result;
    } catch (error: any) {
      console.error('❌ Error en getTeam:', error);
      console.groupEnd();
      throw error;
    }
  }

  // CREATE team - CON DEBUG EXTENDIDO
  async createTeam(idTournament: number, team: Omit<Team, "id">) {
    try {
      console.group(`📝 CREATE Team - Tournament ${idTournament}`);
      const backendCategory = categoryMapping[team.category] || 'LIBRE';
      
      const payload: CreateTeamRequest = {
        teamName: team.name,
        coachName: team.coach,
        teamCategory: backendCategory,
        mainStadium: team.mainField,
        secondaryStadium: team.secondaryField?.trim() || undefined,
        teamPlayers: team.players.map(p => ({
          name: p.name,
          age: p.age || 18,
          playerPosition: p.position,
          shirtNumber: p.dorsalNumber
        }))
      };

      console.log('📤 Payload enviado:', payload);
      console.log('🎯 Endpoint:', `/${idTournament}/teams`);
      
      const res = await tournamentsApiClient.post(`/${idTournament}/teams`, payload);
      
      console.log('✅ Equipo creado exitosamente:', res.data);
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en createTeam:', error);
      console.groupEnd();
      throw error;
    }
  }

  // UPDATE team - CORREGIDO CON DEBUG MEJORADO
  async updateTeam(idTournament: number, idTeam: number, data: UpdateTeamRequest) {
    try {
      console.group(`✏️ UPDATE Team - Tournament ${idTournament}, Team ${idTeam}`);
      
      // 🔹 DEBUG ESPECIAL PARA INVESTIGAR ERROR 401
      console.log('🔐 TOKEN VERIFICATION FOR PUT:');
      const currentToken = getToken() || localStorage.getItem("token");
      console.log('   Token disponible:', currentToken ? 'SI' : 'NO');
      if (currentToken) {
        const cleanToken = currentToken.replace(/^"(.*)"$/, '$1').replace('Bearer ', '');
        console.log('   Longitud token:', cleanToken.length);
        console.log('   Preview token:', cleanToken.substring(0, 30) + '...');
      }
      
      // Mapear categoría frontend → backend
      const backendCategory = categoryMapping[data.teamCategory] || data.teamCategory;
      
      // 🔹 CORRECCIÓN: Asegurar que secondaryStadium no sea undefined
      const payload = {
        name: data.name,
        coach: data.coach,
        teamCategory: backendCategory,
        mainStadium: data.mainStadium,
        secondaryStadium: data.secondaryStadium?.trim() || ""
      };

      console.log('📤 Payload de actualización:', payload);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      console.log('🔍 Datos originales:', data);
      
      const res = await tournamentsApiClient.put(`/${idTournament}/teams/${idTeam}`, payload);
      
      console.log('✅ Equipo actualizado exitosamente:', res.data);
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en updateTeam:', error);
      console.groupEnd();
      throw error;
    }
  }

  // DELETE team - CORREGIDO CON MEJOR MANEJO DE RESPUESTA
  async deleteTeam(idTournament: number, idTeam: number) {
    try {
      console.group(`🗑️ DELETE Team - Tournament ${idTournament}, Team ${idTeam}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      
      const res = await tournamentsApiClient.delete(`/${idTournament}/teams/${idTeam}`);
      
      console.log('✅ Respuesta de eliminación:', res.data);
      console.log('   • Elemento eliminado ID:', res.data?.elementId);
      console.log('   • Nombre del elemento:', res.data?.elementName);
      console.groupEnd();
      
      return {
        success: true,
        deletedId: res.data?.elementId,
        deletedName: res.data?.elementName,
        deletionDate: res.data?.deletionElementDate
      };
    } catch (error: any) {
      console.error('❌ Error en deleteTeam:', error);
      console.groupEnd();
      throw error;
    }
  }

  // =======================
  // 🔹 MÉTODOS DE JUGADORES
  // =======================

  // GET players by team
  async getPlayers(idTournament: number, idTeam: number): Promise<Player[]> {
    try {
      console.group(`👥 GET Players - Tournament ${idTournament}, Team ${idTeam}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      
      const res = await playersApiClient.get(`/${idTournament}/teams/${idTeam}`);
      console.log('📦 Respuesta de jugadores:', res.data);
      
      if (!Array.isArray(res.data)) {
        console.warn('⚠️ Los jugadores no son un array:', res.data);
        console.groupEnd();
        return [];
      }

      const mappedPlayers = res.data.map((backendPlayer: BackendPlayer) => ({
        id: backendPlayer.idPlayer,
        name: backendPlayer.name,
        position: backendPlayer.position,
        dorsalNumber: backendPlayer.shirtNumber,
        starter: backendPlayer.starter || false,
        goals: backendPlayer.goals || 0,
        yellowCards: backendPlayer.yellowCards || 0,
        redCards: backendPlayer.redCards || 0,
        status: backendPlayer.status || 'ACTIVE'
      }));

      console.log('✅ Jugadores mapeados:', mappedPlayers.length);
      console.groupEnd();
      return mappedPlayers;
    } catch (error: any) {
      console.error('❌ Error en getPlayers:', error);
      console.groupEnd();
      throw error;
    }
  }

  // GET complete team with players
  async getCompleteTeam(idTournament: number, idTeam: number): Promise<Team> {
    try {
      console.group(`🔍 GET Complete Team - Tournament ${idTournament}, Team ${idTeam}`);
      
      // Obtener información del equipo
      const teamPromise = this.getTeam(idTournament, idTeam);
      // Obtener jugadores del equipo
      const playersPromise = this.getPlayers(idTournament, idTeam);
      
      const [team, players] = await Promise.all([teamPromise, playersPromise]);
      
      const completeTeam = {
        ...team,
        players: players
      };
      
      console.log('✅ Equipo completo obtenido:', {
        id: completeTeam.id,
        name: completeTeam.name,
        jugadores: completeTeam.players.length
      });
      console.groupEnd();
      return completeTeam;
    } catch (error: any) {
      console.error('❌ Error en getCompleteTeam:', error);
      console.groupEnd();
      throw error;
    }
  }

  // UPDATE player
  async updatePlayer(idTournament: number, idTeam: number, playerData: UpdatePlayerRequest) {
    try {
      console.group(`✏️ UPDATE Player - Tournament ${idTournament}, Team ${idTeam}, Player ${playerData.idPlayer}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      
      const payload = {
        idPlayer: playerData.idPlayer,
        name: playerData.name,
        position: playerData.position,
        starter: playerData.starter || false,
        shirtNumber: playerData.shirtNumber,
        status: playerData.status || 'ACTIVE'
      };

      console.log('📤 Payload para actualizar jugador:', payload);
      
      const res = await playersApiClient.put(`/${idTournament}/teams/${idTeam}`, payload);
      
      console.log('✅ Jugador actualizado exitosamente:', res.data);
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en updatePlayer:', error);
      console.groupEnd();
      throw error;
    }
  }

  // CREATE player (asumiendo que es el mismo endpoint que UPDATE basado en presencia de idPlayer)
  async createPlayer(idTournament: number, idTeam: number, playerData: Omit<UpdatePlayerRequest, 'idPlayer'>) {
    try {
      console.group(`➕ CREATE Player - Tournament ${idTournament}, Team ${idTeam}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      
      // Para crear, enviamos sin idPlayer (el backend lo asignará)
      const payload = {
        name: playerData.name,
        position: playerData.position,
        starter: playerData.starter || false,
        shirtNumber: playerData.shirtNumber,
        status: playerData.status || 'ACTIVE'
      };

      console.log('📤 Payload para crear jugador:', payload);
      
      const res = await playersApiClient.put(`/${idTournament}/teams/${idTeam}`, payload);
      
      console.log('✅ Jugador creado exitosamente:', res.data);
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en createPlayer:', error);
      console.groupEnd();
      throw error;
    }
  }

  // DELETE player (basado en la documentación, parece ser el mismo endpoint PUT)
  async deletePlayer(idTournament: number, idTeam: number, playerId: number) {
    try {
      console.group(`🗑️ DELETE Player - Tournament ${idTournament}, Team ${idTeam}, Player ${playerId}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      
      // Para eliminar, enviamos con status INACTIVE
      const payload = {
        idPlayer: playerId,
        status: 'INACTIVE'
      };

      console.log('📤 Payload para desactivar jugador:', payload);
      
      const res = await playersApiClient.put(`/${idTournament}/teams/${idTeam}`, payload);
      
      console.log('✅ Jugador marcado como INACTIVE:', res.data);
      console.groupEnd();
      
      return {
        success: true,
        playerId: playerId,
        status: 'INACTIVE'
      };
    } catch (error: any) {
      console.error('❌ Error en deletePlayer:', error);
      console.groupEnd();
      throw error;
    }
  }

  // 🔍 MÉTODO DE DIAGNÓSTICO - Verificar token actual
  async diagnoseToken() {
    console.group('🔍 DIAGNÓSTICO DE TOKEN');
    const tokenFromGetToken = getToken();
    const tokenFromLocalStorage = localStorage.getItem("token");
    
    console.log('📋 Fuentes de token:');
    console.log('   • getToken():', tokenFromGetToken ? 'PRESENTE' : 'AUSENTE');
    console.log('   • localStorage:', tokenFromLocalStorage ? 'PRESENTE' : 'AUSENTE');
    
    if (tokenFromGetToken) {
      const cleanToken = tokenFromGetToken.replace(/^"(.*)"$/, '$1').replace('Bearer ', '');
      console.log('   • Longitud getToken():', cleanToken.length);
      console.log('   • Preview getToken():', cleanToken.substring(0, 30) + '...');
    }
    
    if (tokenFromLocalStorage) {
      const cleanToken = tokenFromLocalStorage.replace(/^"(.*)"$/, '$1').replace('Bearer ', '');
      console.log('   • Longitud localStorage:', cleanToken.length);
      console.log('   • Preview localStorage:', cleanToken.substring(0, 30) + '...');
    }
    
    console.groupEnd();
    
    return {
      fromGetToken: tokenFromGetToken ? tokenFromGetToken.substring(0, 50) + '...' : null,
      fromLocalStorage: tokenFromLocalStorage ? tokenFromLocalStorage.substring(0, 50) + '...' : null,
      bothAvailable: !!tokenFromGetToken && !!tokenFromLocalStorage,
      sameToken: tokenFromGetToken === tokenFromLocalStorage
    };
  }
}

export default new TeamService();