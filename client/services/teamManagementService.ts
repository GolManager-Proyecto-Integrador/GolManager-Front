import axios from "axios";
import { getToken } from "./authService";

const API_BASE = "http://localhost:8085/api/tournaments";

// =======================
// 🔹 CONFIGURACIÓN AXIOS CON DEBUG EXTENDIDO
// =======================
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request CON DEBUG COMPLETO
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
      console.group(`🔐 Request Interceptor - ${config.method?.toUpperCase()} ${config.url}`);
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
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta CON DEBUG MEJORADO
apiClient.interceptors.response.use(
  (response) => {
    console.group(`✅ Response Success - ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📊 Status:', response.status);
    console.log('📦 Data preview:', response.data ? 'DATA_RECIBIDA' : 'SIN_DATA');
    if (response.config.method?.toUpperCase() === 'GET') {
      console.log('🔢 Cantidad de elementos:', Array.isArray(response.data) ? response.data.length : 'N/A');
    }
    console.groupEnd();
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method;
    
    console.group(`❌ Response Error - ${method?.toUpperCase()} ${url}`);
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

// =======================
// 🔹 MODELOS FRONTEND
// =======================
export interface Player {
  id?: number;
  name: string;
  position: string;
  dorsalNumber: number;
  age?: number;
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
  { value: "DFC", label: "Defensa" },
  { value: "MC", label: "Mediocampista" },
  { value: "DC", label: "Delantero" },
];

// =======================
// 🔹 MAPEO DE CATEGORÍAS
// =======================
const categoryMapping: { [key: string]: string } = {
  'sub-13': 'SUB13',
  'sub-14': 'SUB14',
  'sub-15': 'SUB15',
  'sub-16': 'SUB16',
  'sub-17': 'SUB17',
  'sub-19': 'SUB19',
  'sub-20': 'SUB20',
  'sub-21': 'SUB21',
  'professional': 'PROFESSIONAL',
  'veteran': 'VETERAN'
};

const reverseCategoryMapping: { [key: string]: string } = {
  'SUB13': 'sub-13',
  'SUB14': 'sub-14',
  'SUB15': 'sub-15',
  'SUB16': 'sub-16',
  'SUB17': 'sub-17',
  'SUB19': 'sub-19',
  'SUB20': 'sub-20',
  'SUB21': 'sub-21',
  'PROFESSIONAL': 'professional',
  'VETERAN': 'veteran'
};

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
// 🔹 SERVICE METHODS CON DEBUG COMPLETO
// =======================
class TeamService {

  // GET all teams - CON DEBUG MEJORADO
  async getTeams(idTournament: number): Promise<Team[]> {
    try {
      console.group(`🔄 GET Teams - Tournament ${idTournament}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams`);
      
      const res = await apiClient.get(`/${idTournament}/teams`);
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
          const frontendCategory = reverseCategoryMapping[backendCategory] || 'professional';

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
              position: p.playerPosition || p.position || 'DFC',
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

  // GET team by id
  async getTeam(idTournament: number, idTeam: number): Promise<Team> {
    try {
      console.group(`🔍 GET Team - Tournament ${idTournament}, Team ${idTeam}`);
      const res = await apiClient.get(`/${idTournament}/teams/${idTeam}`);
      const backendTeam = res.data;

      console.log('📦 Respuesta de equipo individual:', backendTeam);

      const backendCategory = backendTeam.teamCategory || backendTeam.category;
      const frontendCategory = reverseCategoryMapping[backendCategory] || 'professional';

      const result = {
        id: backendTeam.teamId || backendTeam.id || idTeam,
        name: backendTeam.teamName || backendTeam.name,
        coach: backendTeam.coachName || backendTeam.coach,
        category: frontendCategory,
        mainField: backendTeam.mainStadium || backendTeam.mainField,
        secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField || '',
        players: backendTeam.teamPlayers ? backendTeam.teamPlayers.map((p: any) => ({
          id: p.id,
          name: p.name,
          position: p.playerPosition || p.position,
          dorsalNumber: p.shirtNumber || p.dorsalNumber,
          age: p.age
        })) : []
      };
      
      console.log('✅ Equipo mapeado:', result);
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
      
      const res = await apiClient.post(`/${idTournament}/teams`, payload);
      
      console.log('✅ Equipo creado exitosamente:', res.data);
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en createTeam:', error);
      console.groupEnd();
      throw error;
    }
  }

  // UPDATE team - CON DEBUG COMPLETO PARA IDENTIFICAR 401
  async updateTeam(idTournament: number, idTeam: number, data: UpdateTeamRequest) {
    console.log(this.getTeams(idTournament))
    try {
      console.group(`✏️ UPDATE Team - Tournament ${idTournament}, Team ${idTeam}`);
      
      const backendCategory = categoryMapping[data.teamCategory] || data.teamCategory;
      
      const payload = {
        name: data.name,
        coach: data.coach,
        teamCategory: backendCategory,
        mainStadium: data.mainStadium,
        secondaryStadium: data.secondaryStadium?.trim() || undefined
      };

      console.log('📤 Payload de actualización:', payload);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      console.log('🔍 Datos originales:', data);
      console.log('🔄 Categoría mapeada:', { frontend: data.teamCategory, backend: backendCategory });
      
      // 🔍 DEBUG ESPECIAL PARA UPDATE
      console.log('🔐 Verificación pre-request:');
      const currentToken = getToken() || localStorage.getItem("token");
      console.log('   Token disponible:', currentToken ? 'SI' : 'NO');
      if (currentToken) {
        const cleanToken = currentToken.replace(/^"(.*)"$/, '$1').replace('Bearer ', '');
        console.log('   Longitud token:', cleanToken.length);
      }
      
      const res = await apiClient.put(`/${idTournament}/teams/${idTeam}`, payload);
      
      console.log('✅ Equipo actualizado exitosamente:', res.data);
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en updateTeam:', error);
      
      // 🔍 ANÁLISIS ESPECÍFICO DEL ERROR 401
      if (error.response?.status === 401) {
        console.error('🔍 INVESTIGACIÓN ERROR 401:');
        console.log('   • Endpoint:', error.config?.url);
        console.log('   • Método:', error.config?.method);
        console.log('   • Headers enviados:', error.config?.headers);
        console.log('   • Payload enviado:', error.config?.data);
        console.log('   • Respuesta del servidor:', error.response?.data);
        
        // Verificar si hay diferencias entre GET y PUT
        console.log('🔍 COMPARACIÓN CON GET (que funciona):');
        console.log('   • Mismo token usado en ambos casos');
        console.log('   • Posible diferencia en permisos del endpoint');
        console.log('   • Posible problema de CORS para métodos PUT');
      }
      
      console.groupEnd();
      throw error;
    }
  }

  // DELETE team
  async deleteTeam(idTournament: number, idTeam: number) {
    try {
      console.group(`🗑️ DELETE Team - Tournament ${idTournament}, Team ${idTeam}`);
      console.log('🎯 Endpoint:', `/${idTournament}/teams/${idTeam}`);
      
      const res = await apiClient.delete(`/${idTournament}/teams/${idTeam}`);
      
      console.log('✅ Equipo eliminado exitosamente');
      console.groupEnd();
      return res.data;
    } catch (error: any) {
      console.error('❌ Error en deleteTeam:', error);
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
      console.log('   • Preview getToken():', cleanToken.substring(0, 20) + '...');
    }
    
    if (tokenFromLocalStorage) {
      const cleanToken = tokenFromLocalStorage.replace(/^"(.*)"$/, '$1').replace('Bearer ', '');
      console.log('   • Longitud localStorage:', cleanToken.length);
      console.log('   • Preview localStorage:', cleanToken.substring(0, 20) + '...');
    }
    
    console.groupEnd();
  }
}

export default new TeamService();