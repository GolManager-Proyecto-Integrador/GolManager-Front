import axios from "axios";
import { getToken } from "./authService";

// =========================
//   URL BASES SEGÚN BACKEND
// =========================
const API_TOURNAMENTS = "http://localhost:8085/api/tournaments";
const API_PLAYERS = "http://localhost:8085/api/players";

// =======================
// 🔹 CONFIGURACIÓN AXIOS
// =======================
const apiClient = axios.create({
  baseURL: API_TOURNAMENTS,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para token
apiClient.interceptors.request.use(
  (config) => {
    let token = getToken();
    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      let cleanToken = token.replace(/^"(.*)"$/, '$1');
      if (cleanToken.startsWith("Bearer ")) {
        cleanToken = cleanToken.slice(7).trim();
      }
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 🔹 INTERFACES DEL FRONTEND (LO QUE LA VISTA NECESITA)
// ============================================================

export interface Player {
  id: string;
  name: string;
  position: string;
  role: "Titular" | "Suplente";
  dorsalNumber: number;
  goals?: number;
  yellowCards?: number;
  redCards?: number;
  status: "Activo" | "Suspendido" | "Lesionado";
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField?: string;
  players: Player[];
}

// ============================================================
// 🔹 INTERFACES DEL BACKEND (JSON REAL) - CORREGIDAS
// ============================================================

interface BackendTeam {
  teamId: number;
  teamName: string;
  coachName: string;
  teamCategory: string;
  mainStadium: string;
  secondaryStadium: string;
  dataCreated: string;
  teamPlayers?: any[];
}

interface BackendPlayer {
  idPlayer: string;
  name: string;
  position: string;
  starter: boolean; // ✅ CORREGIDO: de string a boolean
  shirtNumber: string;
  goals?: string;
  yellowCards?: string;
  redCards?: string;
  status: "ACTIVE" | "SUSPENDED" | "INJURED";
}

interface UpdateTeamDTO {
  name: string;
  coach: string;
  teamCategory: string;
  mainStadium: string;
  secondaryStadium: string;
}

interface UpdatePlayerDTO {
  idPlayer: string;
  name: string;
  position: string;
  starter: boolean; // ✅ CORREGIDO: de string a boolean
  shirtNumber: string;
  status: "ACTIVE" | "SUSPENDED" | "INJURED";
}

// ============================================================
// 🔹 FUNCIONES AUXILIARES
// ============================================================

function decodeToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
}

function debugUserInfo(token: string | null) {
  console.group('👤 INFORMACIÓN DEL USUARIO AUTENTICADO');
  if (token) {
    const payload = decodeToken(token);
    if (payload) {
      console.log('📧 Email:', payload.sub);
      console.log('🎭 Rol:', payload.role);
      console.log('⏰ Token emitido:', new Date(payload.iat * 1000).toLocaleString());
      console.log('⏰ Token expira:', new Date(payload.exp * 1000).toLocaleString());
    } else {
      console.log('❌ Token inválido o no se pudo decodificar');
    }
  } else {
    console.log('❌ No hay token disponible - Usuario no autenticado');
  }
  console.groupEnd();
}

// ============================================================
// 🔹 FUNCIÓN PARA NORMALIZAR EQUIPOS (BASADA EN TeamService)
// ============================================================

function normalizeTeamsData(teamsData: any[]): any[] {
  console.log('🔍 NORMALIZANDO EQUIPOS - Datos recibidos:', teamsData);
  
  if (teamsData.length === 0) {
    console.log('📭 No hay equipos para normalizar');
    return [];
  }

  // Mostrar estructura del primer equipo
  const firstTeam = teamsData[0];
  console.log('📋 ESTRUCTURA DEL PRIMER EQUIPO:', Object.keys(firstTeam));
  console.log('📊 VALORES DEL PRIMER EQUIPO:', firstTeam);

  const normalizedTeams = teamsData.map((backendTeam: any, index: number) => {
    // 🔹 EXACTAMENTE IGUAL QUE EN TeamService
    const teamId = backendTeam.teamId || backendTeam.id || index + 1;
    
    console.log(`🔍 Mapeando equipo:`, {
      original: backendTeam,
      id: teamId,
      name: backendTeam.teamName || backendTeam.name,
      coach: backendTeam.coachName || backendTeam.coach
    });

    return {
      // Campos normalizados (igual que TeamService)
      id: teamId,
      teamId: teamId,
      name: backendTeam.teamName || backendTeam.name || `Equipo ${teamId}`,
      coach: backendTeam.coachName || backendTeam.coach || 'Sin DT',
      category: backendTeam.teamCategory || backendTeam.category || 'SIN_CATEGORIA',
      mainStadium: backendTeam.mainStadium || backendTeam.mainField || 'Sin cancha',
      secondaryStadium: backendTeam.secondaryStadium || backendTeam.secondaryField,
      dataCreated: backendTeam.dataCreated || '',
      
      // Para compatibilidad
      mainField: backendTeam.mainStadium || backendTeam.mainField || 'Sin cancha',
      secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField,
      
      // Datos originales
      _raw: backendTeam,
      _index: index
    };
  });

  console.log('✅ EQUIPOS NORMALIZADOS:', normalizedTeams.map(t => ({
    name: t.name,
    teamId: t.teamId,
    id: t.id,
    coach: t.coach
  })));

  return normalizedTeams;
}

// ============================================================
// 🔹 MAPEO BACKEND → FRONTEND (CORREGIDO)
// ============================================================

function mapBackendPlayer(p: BackendPlayer): Player {
  return {
    id: p.idPlayer,
    name: p.name,
    position: p.position,
    role: p.starter === true ? "Titular" : "Suplente", // ✅ CORREGIDO: boolean comparison
    dorsalNumber: Number(p.shirtNumber),
    goals: Number(p.goals ?? 0),
    yellowCards: Number(p.yellowCards ?? 0),
    redCards: Number(p.redCards ?? 0),
    status:
      p.status === "ACTIVE"
        ? "Activo"
        : p.status === "SUSPENDED"
        ? "Suspendido"
        : "Lesionado",
  };
}

function mapBackendTeam(t: any, players: Player[]): Team {
  return {
    id: String(t.teamId || t.id),
    name: t.name,
    coach: t.coach,
    category: t.category,
    mainField: t.mainStadium || t.mainField,
    secondaryField: t.secondaryStadium || t.secondaryField,
    players,
  };
}

// ============================================================
// 🔹 MAPEO FRONTEND → BACKEND (CORREGIDO)
// ============================================================

function mapFrontendPlayerToBackend(p: Player): UpdatePlayerDTO {
  return {
    idPlayer: p.id,
    name: p.name,
    position: p.position,
    starter: p.role === "Titular", // ✅ CORREGIDO: directamente a boolean
    shirtNumber: String(p.dorsalNumber),
    status:
      p.status === "Activo"
        ? "ACTIVE"
        : p.status === "Suspendido"
        ? "SUSPENDED"
        : "INJURED",
  };
}

// ============================================================
// 🔹 FUNCIÓN PARA LISTAR EQUIPOS DEL TORNEO (CORREGIDA)
// ============================================================

export async function getTournamentTeams(idTournament: string): Promise<any[]> {
  try {
    console.log(`🔗 Obteniendo equipos del torneo ${idTournament}`);
    
    const res = await apiClient.get(`/${idTournament}/teams`);
    console.log('📦 Respuesta completa del backend:', res.data);
    
    // 🔹 EXACTAMENTE IGUAL QUE EN TeamService
    let teamsData = res.data;
    
    // Si es un objeto con propiedad 'teams' o 'referees'
    if (teamsData && typeof teamsData === 'object' && !Array.isArray(teamsData)) {
      if (teamsData.teams && Array.isArray(teamsData.teams)) {
        teamsData = teamsData.teams;
      } else if (teamsData.referees && Array.isArray(teamsData.referees)) {
        console.warn('⚠️ El backend está devolviendo referees en lugar de teams');
        teamsData = teamsData.referees;
      } else {
        teamsData = Object.values(teamsData).find(val => Array.isArray(val)) || [];
      }
    }

    // Normalizar los datos
    const normalizedTeams = normalizeTeamsData(teamsData);
    
    console.log(`📋 EQUIPOS NORMALIZADOS (${normalizedTeams.length} equipos):`, 
      normalizedTeams.map(t => `${t.name} (ID: ${t.teamId})`));
    
    return normalizedTeams;
  } catch (error) {
    console.error('❌ Error obteniendo equipos del torneo:', error);
    throw error;
  }
}

// ============================================================
// 🔹 GET: Obtener detalles del equipo + jugadores (VERSIÓN FINAL CORREGIDA)
// ============================================================

export async function getTeamDetails(
  idTournament: string,
  idTeam: string
): Promise<Team> {
  console.group(`🏁 INICIANDO getTeamDetails - TORNEO ${idTournament}, EQUIPO ${idTeam}`);
  
  const token = getToken();
  debugUserInfo(token);

  try {
    console.log('\n🎯 ESTRATEGIA: Usar lista de equipos normalizada + endpoint de jugadores');
    
    // 1️⃣ OBTENER Y NORMALIZAR LISTA DE EQUIPOS (EXACTA ESTRATEGIA DE TeamService)
    const normalizedTeams = await getTournamentTeams(idTournament);
    
    console.log('✅ Lista de equipos normalizada. Cantidad:', normalizedTeams.length);

    // 2️⃣ BUSCAR EQUIPO CON ESTRATEGIAS IDÉNTICAS A TeamService
    console.log(`🔍 Buscando equipo "${idTeam}" entre ${normalizedTeams.length} equipos...`);
    
    // Convertir idTeam a número para comparaciones (igual que en TeamService)
    const numericIdTeam = Number(idTeam);
    
    let teamFromList = normalizedTeams.find((team: any) => 
      team.teamId === numericIdTeam
    );

    if (!teamFromList) {
      teamFromList = normalizedTeams.find((team: any) => 
        team.id === numericIdTeam
      );
    }

    if (!teamFromList) {
      teamFromList = normalizedTeams.find((team: any) => 
        team.teamId == idTeam
      );
    }

    if (!teamFromList) {
      teamFromList = normalizedTeams.find((team: any) => 
        team.id == idTeam
      );
    }

    if (!teamFromList) {
      const availableTeamsInfo = normalizedTeams.map((t: any) => 
        `${t.name} (ID: ${t.teamId})`
      ).join(', ');
      
      console.log('❌ Equipo no encontrado. Equipos disponibles:', availableTeamsInfo);
      throw new Error(`EQUIPO_NO_ENCONTRADO:El equipo ${idTeam} no existe en el torneo ${idTournament}. Equipos disponibles: ${availableTeamsInfo}`);
    }

    console.log('✅ Equipo encontrado:', teamFromList.name, '(ID:', teamFromList.teamId + ')');

    // 3️⃣ OBTENER JUGADORES DEL ENDPOINT ESPECÍFICO
    console.log('🔗 Obteniendo jugadores del equipo...');
    const playersUrl = `${API_PLAYERS}/${idTournament}/teams/${idTeam}`;
    
    const playersResponse = await apiClient.get<BackendPlayer[]>(playersUrl);
    
    console.log('✅ Players data recibido. Cantidad:', playersResponse.data.length);
    console.log('📦 Datos de jugadores:', playersResponse.data);

    const backendPlayers = playersResponse.data;
    const players = backendPlayers.map(mapBackendPlayer);

    // 4️⃣ CONSTRUIR RESULTADO FINAL
    const result = mapBackendTeam(teamFromList, players);
    
    console.log('🎉 Resultado final - Equipo:', result.name, 'Jugadores:', result.players.length);
    console.log('✅ CARGA COMPLETADA EXITOSAMENTE');
    console.groupEnd();
    
    return result;

  } catch (error: any) {
    console.group('💥 ERROR en getTeamDetails');
    
    console.log('🎯 Tournament ID:', idTournament);
    console.log('🎯 Team ID:', idTeam);
    
    if (error.message.includes('EQUIPO_NO_ENCONTRADO')) {
      console.log('🔍 Equipo no encontrado en la lista');
    } else if (axios.isAxiosError(error)) {
      console.log('🚨 Error Axios - Status:', error.response?.status);
      console.log('🚨 Error Axios - Data:', error.response?.data);
      console.log('🚨 Error Axios - URL:', error.config?.url);
    } else {
      console.log('❌ Error:', error.message);
    }
    
    console.groupEnd();
    throw error;
  }
}

// ============================================================
// 🔹 FUNCIÓN ALTERNATIVA MÁS ROBUSTA (CORREGIDA)
// ============================================================

export async function getTeamDetailsRobust(
  idTournament: string,
  idTeam: string
): Promise<Team> {
  console.log('🔄 Usando método robusto...');
  
  try {
    // 1️⃣ Obtener y normalizar lista de equipos
    const normalizedTeams = await getTournamentTeams(idTournament);
    
    console.log('🔍 Buscando equipo', idTeam, 'en:', normalizedTeams.map((t: any) => ({
      name: t.name,
      teamId: t.teamId,
      id: t.id
    })));
    
    // Convertir idTeam a número para comparaciones
    const numericIdTeam = Number(idTeam);
    
    // Múltiples estrategias de búsqueda (idénticas a getTeamDetails)
    let teamData = normalizedTeams.find((team: any) => team.teamId === numericIdTeam);
    if (!teamData) teamData = normalizedTeams.find((team: any) => team.id === numericIdTeam);
    if (!teamData) teamData = normalizedTeams.find((team: any) => team.teamId == idTeam);
    if (!teamData) teamData = normalizedTeams.find((team: any) => team.id == idTeam);
    
    if (!teamData) {
      const availableTeams = normalizedTeams.map((t: any) => 
        `${t.name} (ID: ${t.teamId})`
      );
      throw new Error(`Equipo ${idTeam} no encontrado. Equipos disponibles en torneo ${idTournament}: ${availableTeams.join(', ')}`);
    }
    
    // 2️⃣ Obtener jugadores
    const playersUrl = `${API_PLAYERS}/${idTournament}/teams/${idTeam}`;
    const playersResponse = await apiClient.get<BackendPlayer[]>(playersUrl);
    
    const players = playersResponse.data.map(mapBackendPlayer);
    
    console.log('✅ Método robusto funcionó - Equipo:', teamData.name, 'Jugadores:', players.length);
    return mapBackendTeam(teamData, players);
    
  } catch (error) {
    console.error('❌ Error en getTeamDetailsRobust:', error);
    throw error;
  }
}

// ============================================================
// 🔹 PUT: Actualizar solo datos del equipo
// ============================================================

export async function updateTeamDetails(
  idTournament: string,
  idTeam: string,
  team: Team
): Promise<Team> {
  try {
    const url = `/${idTournament}/teams/${idTeam}`;

    const body: UpdateTeamDTO = {
      name: team.name,
      coach: team.coach,
      teamCategory: team.category,
      mainStadium: team.mainField,
      secondaryStadium: team.secondaryField ?? "",
    };

    const response = await apiClient.put(url, body);
    console.log('✅ Update successful');

    // Para el PUT, asumimos que el backend devuelve el equipo actualizado
    // pero sin jugadores, así que mantenemos los jugadores existentes
    return mapBackendTeam(response.data, team.players);

  } catch (error) {
    console.error('Error en updateTeamDetails:', error);
    throw error;
  }
}

// ============================================================
// 🔹 PUT: Actualizar un jugador (CORREGIDO)
// ============================================================

export async function updatePlayerDetails(
  idTournament: string,
  idTeam: string,
  player: Player
): Promise<Player> {
  try {
    const url = `${API_PLAYERS}/${idTournament}/teams/${idTeam}`;

    const body: UpdatePlayerDTO = mapFrontendPlayerToBackend(player);

    console.log('🔍 DEBUG updatePlayerDetails - Body enviado:', body);
    console.log('🔍 DEBUG - starter value:', body.starter, 'type:', typeof body.starter);

    const response = await apiClient.put<BackendPlayer>(url, body);
    console.log('✅ Player update successful');
    console.log('🔍 DEBUG - Respuesta del backend:', response.data);

    return mapBackendPlayer(response.data);

  } catch (error) {
    console.error('Error en updatePlayerDetails:', error);
    if (axios.isAxiosError(error)) {
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
    }
    throw error;
  }
}

// ============================================================
// 🔹 PUT: Actualizar múltiples jugadores (NUEVA FUNCIÓN)
// ============================================================

export async function updateTeamPlayers(
  idTournament: string,
  idTeam: string,
  players: Player[]
): Promise<Player[]> {
  try {
    console.log(`🔄 Actualizando ${players.length} jugadores para equipo ${idTeam}`);
    
    const updatePromises = players.map(player => 
      updatePlayerDetails(idTournament, idTeam, player)
    );
    
    const updatedPlayers = await Promise.all(updatePromises);
    console.log('✅ Todos los jugadores actualizados exitosamente');
    
    return updatedPlayers;
  } catch (error) {
    console.error('❌ Error actualizando jugadores:', error);
    throw error;
  }
}

// ============================================================
// 🔹 FUNCIÓN PARA GUARDAR TODOS LOS CAMBIOS (NUEVA FUNCIÓN)
// ============================================================

export async function saveAllTeamChanges(
  idTournament: string,
  idTeam: string,
  team: Team,
  players: Player[]
): Promise<{ team: Team; players: Player[] }> {
  try {
    console.log('💾 Guardando todos los cambios del equipo...');
    
    // 1. Actualizar datos del equipo
    const updatedTeam = await updateTeamDetails(idTournament, idTeam, {
      ...team,
      players,
    });
    
    // 2. Actualizar jugadores
    const updatedPlayers = await updateTeamPlayers(idTournament, idTeam, players);
    
    console.log('✅ Todos los cambios guardados exitosamente');
    
    return {
      team: updatedTeam,
      players: updatedPlayers
    };
    
  } catch (error) {
    console.error('❌ Error guardando cambios del equipo:', error);
    throw error;
  }
}

// ============================================================
// 🔹 FUNCIÓN PARA OBTENER INFO BÁSICA DEL EQUIPO
// ============================================================

export async function getTeamBasicInfo(
  idTournament: string,
  idTeam: string
): Promise<Team> {
  try {
    const normalizedTeams = await getTournamentTeams(idTournament);
    
    const numericIdTeam = Number(idTeam);
    const teamData = normalizedTeams.find((team: any) => 
      team.teamId === numericIdTeam || team.id === numericIdTeam
    );
    
    if (!teamData) {
      throw new Error(`Equipo ${idTeam} no encontrado`);
    }
    
    return mapBackendTeam(teamData, []);
    
  } catch (error) {
    console.error('Error en getTeamBasicInfo:', error);
    throw error;
  }
}

export default {
  getTeamDetails,
  getTeamDetailsRobust,
  getTeamBasicInfo,
  getTournamentTeams,
  updateTeamDetails,
  updatePlayerDetails,
  updateTeamPlayers, // ✅ Nueva función exportada
  saveAllTeamChanges, // ✅ Nueva función exportada
};