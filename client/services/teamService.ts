import axios from "axios";
import { getToken } from "./authService";

const API_TOURNAMENTS = "http://localhost:8085/api/tournaments";
const API_PLAYERS = "http://localhost:8085/api/players";

// ============================================================
// 🔹 INTERFACES DEL FRONTEND
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
// 🔹 INTERFACES DEL BACKEND
// ============================================================

interface BackendTeam {
  teamId: number;
  name: string;
  coach: string;
  category: string;
  mainStadium: string;
  secondaryStadium: string;
  dateCreated: string;
}

interface BackendTeamSimple {
  teamId: number;
  name: string;
  coach?: string;
  category?: string;
  mainStadium?: string;
  secondaryStadium?: string;
}

interface BackendPlayer {
  idPlayer: number;
  name: string;
  position: string;
  starter: boolean;
  shirtNumber: number;
  goals?: number;
  yellowCards?: number;
  redCards?: number;
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
  idPlayer: number;
  name: string;
  position: string;
  starter: boolean;
  shirtNumber: number;
  status: "ACTIVE" | "SUSPENDED" | "INJURED";
}

interface DeleteTeamResponse {
  elementId: number;
  elementName: string;
  deletionElementDate: string;
}

// ============================================================
// 🔹 MAPEO BACKEND → FRONTEND (CORREGIDO)
// ============================================================

function mapBackendPlayer(p: BackendPlayer): Player {
  console.log("🔍 Mapeando jugador backend:", p);
  
  // 🔹 CORRECCIÓN: Conversión explícita de tipos
  const role: "Titular" | "Suplente" = p.starter ? "Titular" : "Suplente";
  const status: "Activo" | "Suspendido" | "Lesionado" = 
    p.status === "ACTIVE" ? "Activo" : 
    p.status === "SUSPENDED" ? "Suspendido" : "Lesionado";
  
  const mappedPlayer: Player = {
    id: String(p.idPlayer),
    name: p.name,
    position: p.position,
    role: role, // ✅ Ahora es explícitamente del tipo correcto
    dorsalNumber: p.shirtNumber,
    goals: p.goals ?? 0,
    yellowCards: p.yellowCards ?? 0,
    redCards: p.redCards ?? 0,
    status: status, // ✅ Ahora es explícitamente del tipo correcto
  };
  
  console.log("✅ Jugador mapeado:", mappedPlayer);
  return mappedPlayer;
}

function mapBackendTeam(t: BackendTeam, players: Player[]): Team {
  console.log("🔍 Mapeando equipo backend:", t);
  console.log("📋 Jugadores para el equipo:", players);
  
  const mappedTeam: Team = {
    id: String(t.teamId),
    name: t.name,
    coach: t.coach,
    category: t.category,
    mainField: t.mainStadium,
    secondaryField: t.secondaryStadium,
    players,
  };
  
  console.log("✅ Equipo mapeado:", mappedTeam);
  return mappedTeam;
}

function mapBackendTeamSimple(t: BackendTeamSimple): Team {
  console.log("🔍 Mapeando equipo simple backend:", t);
  
  const mappedTeam: Team = {
    id: String(t.teamId),
    name: t.name,
    coach: t.coach || "No especificado",
    category: t.category || "No especificado",
    mainField: t.mainStadium || "No especificado",
    secondaryField: t.secondaryStadium,
    players: [], // Array vacío inicialmente
  };
  
  console.log("✅ Equipo simple mapeado:", mappedTeam);
  return mappedTeam;
}

// ============================================================
// 🔹 MAPEO FRONTEND → BACKEND (CORREGIDO)
// ============================================================

function mapFrontendPlayerToBackend(p: Player): UpdatePlayerDTO {
  // 🔹 CORRECCIÓN: Conversión explícita de tipos
  const status: "ACTIVE" | "SUSPENDED" | "INJURED" = 
    p.status === "Activo" ? "ACTIVE" : 
    p.status === "Suspendido" ? "SUSPENDED" : "INJURED";
  
  return {
    idPlayer: Number(p.id),
    name: p.name,
    position: p.position,
    starter: p.role === "Titular",
    shirtNumber: p.dorsalNumber,
    status: status, // ✅ Ahora es explícitamente del tipo correcto
  };
}

// ============================================================
// 🔹 GET: Obtener todos los equipos de un torneo
// ============================================================

export async function getTeams(idTournament: string): Promise<Team[]> {
  const token = getToken();
  
  console.log(`🔗 Obteniendo equipos del torneo ${idTournament}`);

  try {
    const response = await axios.get<BackendTeamSimple[]>(
      `${API_TOURNAMENTS}/${idTournament}/teams`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      }
    );
    
    console.log("✅ Respuesta de equipos:", response.data);
    console.log(`📊 Cantidad de equipos recibidos: ${response.data.length}`);

    // Mapear equipos simples
    const teams: Team[] = response.data.map(mapBackendTeamSimple);
    
    console.log(`✅ ${teams.length} equipos mapeados correctamente`);
    return teams;

  } catch (error: any) {
    console.error("💥 ERROR en getTeams:", error);
    console.error("📌 URL intentada:", error.config?.url);
    console.error("📌 Status:", error.response?.status);
    console.error("📌 Data:", error.response?.data);
    
    // Si es un 404 (no hay equipos), devolver array vacío
    if (error.response?.status === 404) {
      console.log("⚠️ No hay equipos registrados en este torneo");
      return [];
    }
    
    throw error;
  }
}

// ============================================================
// 🔹 GET: Obtener detalles del equipo + jugadores
// ============================================================

export async function getTeamDetails(
  idTournament: string,
  idTeam: string
): Promise<Team> {
  const token = getToken();
  
  console.log(`🔗 Obteniendo equipo ${idTeam} del torneo ${idTournament}`);

  try {
    // 1️⃣ GET team
    console.log(`📞 Llamando a: ${API_TOURNAMENTS}/${idTournament}/teams/${idTeam}`);
    const teamResponse = await axios.get<BackendTeam>(
      `${API_TOURNAMENTS}/${idTournament}/teams/${idTeam}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("✅ Respuesta del equipo:", teamResponse.data);

    // 2️⃣ GET players - AGREGAR DEBUGGING DETALLADO
    console.log(`📞 Llamando a jugadores: ${API_PLAYERS}/${idTournament}/teams/${idTeam}`);
    
    let playersResponse;
    try {
      playersResponse = await axios.get<BackendPlayer[]>(
        `${API_PLAYERS}/${idTournament}/teams/${idTeam}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 segundos timeout
        }
      );
      console.log("✅ Respuesta de jugadores:", playersResponse.data);
      console.log(`📊 Cantidad de jugadores recibidos: ${playersResponse.data.length}`);
    } catch (playersError: any) {
      console.error("❌ ERROR al obtener jugadores:", playersError);
      console.error("📌 Status:", playersError.response?.status);
      console.error("📌 Data:", playersError.response?.data);
      
      // Si falla, devolver array vacío pero continuar
      playersResponse = { data: [] };
    }

    const backendTeam = teamResponse.data;
    const backendPlayers = playersResponse.data;

    console.log(`🎯 Procesando ${backendPlayers.length} jugadores`);
    
    const players = backendPlayers.map(mapBackendPlayer);
    console.log(`✅ ${players.length} jugadores mapeados correctamente`);

    const finalTeam = mapBackendTeam(backendTeam, players);
    console.log("🏁 Equipo final preparado:", finalTeam);
    
    return finalTeam;

  } catch (error: any) {
    console.error("💥 ERROR CRÍTICO en getTeamDetails:", error);
    console.error("📌 URL intentada:", error.config?.url);
    console.error("📌 Status:", error.response?.status);
    console.error("📌 Data:", error.response?.data);
    throw error;
  }
}

// ============================================================
// 🔹 PUT: Actualizar datos del equipo
// ============================================================

export async function updateTeamDetails(
  idTournament: string,
  idTeam: string,
  team: Team
): Promise<Team> {
  const token = getToken();

  console.log(`🔄 Actualizando equipo ${idTeam} del torneo ${idTournament}`, team);

  const body: UpdateTeamDTO = {
    name: team.name,
    coach: team.coach,
    teamCategory: team.category,
    mainStadium: team.mainField,
    secondaryStadium: team.secondaryField ?? "",
  };

  const response = await axios.put<BackendTeam>(
    `${API_TOURNAMENTS}/${idTournament}/teams/${idTeam}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return mapBackendTeam(response.data, team.players);
}

// ============================================================
// 🔹 PUT: Actualizar equipo (versión simplificada para edición básica)
// ============================================================

export async function updateTeam(
  idTournament: string, 
  idTeam: string, 
  updates: { name: string; coach: string }
): Promise<Team> {
  console.log(`📝 Actualizando equipo básico ${idTeam}`, updates);
  
  try {
    // Obtener el equipo existente para mantener los otros campos
    const existingTeam = await getTeamDetails(idTournament, idTeam);
    
    // Crear equipo actualizado
    const updatedTeam: Team = {
      ...existingTeam,
      name: updates.name,
      coach: updates.coach
    };
    
    // Usar la función de actualización completa
    return await updateTeamDetails(idTournament, idTeam, updatedTeam);
    
  } catch (error) {
    console.error("💥 ERROR en updateTeam:", error);
    throw error;
  }
}

// ============================================================
// 🔹 PUT: Actualizar un jugador
// ============================================================

export async function updatePlayerDetails(
  idTournament: string,
  idTeam: string,
  player: Player
): Promise<Player> {
  const token = getToken();

  console.log(`🔄 Actualizando jugador ${player.id} del equipo ${idTeam}`, player);

  const body: UpdatePlayerDTO = mapFrontendPlayerToBackend(player);

  const response = await axios.put<BackendPlayer>(
    `${API_PLAYERS}/${idTournament}/teams/${idTeam}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return mapBackendPlayer(response.data);
}

// ============================================================
// 🔹 DELETE: Eliminar un equipo
// ============================================================

export async function deleteTeam(idTournament: string, idTeam: string): Promise<DeleteTeamResponse> {
  const token = getToken();

  console.log(`🗑️ Eliminando equipo ${idTeam} del torneo ${idTournament}`);

  try {
    const response = await axios.delete<DeleteTeamResponse>(
      `${API_TOURNAMENTS}/${idTournament}/teams/${idTeam}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("✅ Equipo eliminado exitosamente:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("💥 ERROR en deleteTeam:", error);
    console.error("📌 Status:", error.response?.status);
    console.error("📌 Data:", error.response?.data);
    throw error;
  }
}

// ============================================================
// 🔹 Función de depuración para ver estructura real
// ============================================================

export async function debugTeamsEndpoint(idTournament: string): Promise<any> {
  const token = getToken();
  
  try {
    console.log(`🔍 DEBUG: Llamando a ${API_TOURNAMENTS}/${idTournament}/teams`);
    
    const response = await axios.get(
      `${API_TOURNAMENTS}/${idTournament}/teams`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      }
    );
    
    console.log("🔍 DEBUG - Estructura completa de respuesta:", response.data);
    console.log("🔍 DEBUG - Tipo de respuesta:", typeof response.data);
    console.log("🔍 DEBUG - Es array?:", Array.isArray(response.data));
    
    if (typeof response.data === 'object' && !Array.isArray(response.data)) {
      console.log("🔍 DEBUG - Keys del objeto:", Object.keys(response.data));
    }
    
    return response.data;
    
  } catch (error: any) {
    console.error("❌ DEBUG Error:", error);
    console.error("📌 Status:", error.response?.status);
    console.error("📌 Data:", error.response?.data);
    throw error;
  }
}

// ============================================================
// 🔹 Exportar todos los métodos
// ============================================================

export default {
  // Métodos principales
  getTeams,
  getTeamDetails,
  deleteTeam,
  updateTeam,
  updateTeamDetails,
  updatePlayerDetails,
  
  // Utilidades y debug
  debugTeamsEndpoint,
};