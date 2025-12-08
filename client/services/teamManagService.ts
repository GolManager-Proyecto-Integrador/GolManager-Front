import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/tournaments";

// Interfaces FRONTEND (lo que usa tu componente)
export interface Player {
  id?: string;              // opcional, lo genera backend
  name: string;
  position: string;         // código del enum (ej: "PO")
  dorsalNumber: number;
  age?: number;             // según el swagger también lo pide
}

export interface Team {
  id?: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField?: string;
  players: Player[];
}

// Tipo auxiliar para creación de equipos (sin id)
export type NewTeamData = Omit<Team, "id">;

// 🔹 Posiciones según enum PlayerPosition.java
export const positions = [
  { label: "Portero", value: "PO" },
  { label: "Defensa izquierdo", value: "DFI" },
  { label: "Defensa central", value: "DFC" },
  { label: "Defensa derecho", value: "DFD" },
  { label: "Mediocampista defensivo", value: "MCD" },
  { label: "Mediocampista central", value: "MC" },
  { label: "Mediocampista ofensivo", value: "MCO" },
  { label: "Extremo izquierdo", value: "EI" },
  { label: "Delantero centro", value: "DC" },
  { label: "Extremo derecho", value: "ED" },
];

// 🔹 Mapeo de categorías frontend → backend
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

// 🔹 Interfaces para el BACKEND (lo que realmente devuelve)
interface BackendPlayer {
  id?: number;
  name: string;
  playerPosition?: string;    // El backend usa playerPosition
  position?: string;          // O también position
  shirtNumber?: number;       // El backend usa shirtNumber
  dorsalNumber?: number;      // O también dorsalNumber
  age?: number;
}

interface BackendTeam {
  id?: number;
  teamId?: number;
  teamName?: string;          // El backend usa teamName
  name?: string;              // O también name
  coachName?: string;         // El backend usa coachName
  coach?: string;             // O también coach
  teamCategory?: string;      // El backend usa teamCategory
  category?: string;          // O también category
  mainStadium?: string;       // El backend usa mainStadium
  mainField?: string;         // O también mainField
  secondaryStadium?: string;
  secondaryField?: string;
  teamPlayers?: BackendPlayer[]; // El backend usa teamPlayers
  players?: BackendPlayer[];
}

// 🔹 Función para generar IDs únicos
function generateUniqueId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 🔹 Mapeo de datos del backend al frontend (CORREGIDO)
function mapBackendTeamToFrontend(backendTeam: BackendTeam, index: number = 0): Team {
  // Extraer ID
  // DESPUÉS (usa index + 1 que empieza en 1):
  const id = (backendTeam.teamId || backendTeam.id || (index + 1)).toString();

  // Mapear nombre (backend usa teamName, frontend usa name)
  const name = backendTeam.teamName || backendTeam.name || `Equipo ${index + 1}`;

  // Mapear coach (backend usa coachName, frontend usa coach)
  const coach = backendTeam.coachName || backendTeam.coach || 'Sin DT';

  // Mapear categoría (backend usa teamCategory, frontend usa category)
  const backendCategory = backendTeam.teamCategory || backendTeam.category || 'LIBRE';
  const category = reverseCategoryMapping[backendCategory] || 'libre';

  // Mapear cancha principal (backend usa mainStadium, frontend usa mainField)
  const mainField = backendTeam.mainStadium || backendTeam.mainField || 'Sin cancha';

  // Mapear cancha secundaria
  const secondaryField = backendTeam.secondaryStadium || backendTeam.secondaryField || '';

  // Mapear jugadores (backend usa teamPlayers, frontend usa players)
  const backendPlayers = backendTeam.teamPlayers || backendTeam.players || [];

  // 🔥 CORRECCIÓN: Generar IDs únicos para cada jugador
  const players: Player[] = backendPlayers.map((backendPlayer: BackendPlayer, playerIndex: number) => {
    // Usar el ID del backend si existe, o generar uno único
    const playerId = backendPlayer.id
      ? `backend-player-${backendPlayer.id}`
      : `team-${id}-player-${playerIndex}-${generateUniqueId()}`;

    return {
      id: playerId,
      name: backendPlayer.name || `Jugador ${playerIndex + 1}`,
      position: backendPlayer.playerPosition || backendPlayer.position || 'DF',
      dorsalNumber: backendPlayer.shirtNumber || backendPlayer.dorsalNumber || playerIndex + 1,
      age: backendPlayer.age || 18
    };
  });

  return {
    id: id,
    name,
    coach,
    category,
    mainField,
    secondaryField,
    players
  };
}

// 🔹 Mapeo de datos del frontend al backend (para crear/actualizar)
function mapFrontendTeamToBackend(team: NewTeamData): any {
  const backendCategory = categoryMapping[team.category] || 'LIBRE';

  // 🔥 CORRECCIÓN: Filtrar IDs temporales y mantener solo los campos necesarios
  return {
    teamName: team.name,
    coachName: team.coach,
    teamCategory: backendCategory,
    mainStadium: team.mainField,
    secondaryStadium: team.secondaryField || undefined,
    teamPlayers: team.players.map(player => ({
      name: player.name,
      age: player.age || 18,
      playerPosition: player.position,
      shirtNumber: player.dorsalNumber
      // No enviamos ID si es temporal, el backend generará uno nuevo
    }))
  };
}

// Servicios API con debugging y mapeo CORREGIDO
async function getTeams(idTournament: string): Promise<Team[]> {
  console.log("🔍 [DEBUG getTeams] Iniciando con idTournament:", idTournament);

  if (!idTournament) {
    console.error("❌ [DEBUG getTeams] ERROR: idTournament es null/undefined");
    throw new Error("El idTournament es requerido");
  }

  const token = getToken();
  console.log("🔍 [DEBUG getTeams] Token disponible:", token ? "Sí" : "No");

  const url = `${API_URL}/${idTournament}/teams`;
  console.log("🔍 [DEBUG getTeams] URL completa:", url);

  try {
    console.log("🔍 [DEBUG getTeams] Realizando petición GET...");
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log("✅ [DEBUG getTeams] Respuesta recibida:");
    console.log("   Status:", response.status);
    console.log("   Data cruda:", response.data);
    console.log("   Tipo de data:", typeof response.data);
    console.log("   Es array?:", Array.isArray(response.data));

    if (!response.data) {
      console.warn("⚠️ [DEBUG getTeams] Respuesta vacía");
      return [];
    }

    let backendTeams: BackendTeam[] = [];

    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response.data)) {
      backendTeams = response.data;
      console.log("📊 Datos son array directo, cantidad:", backendTeams.length);
    } else if (response.data.teams && Array.isArray(response.data.teams)) {
      backendTeams = response.data.teams;
      console.log("📊 Datos en propiedad 'teams', cantidad:", backendTeams.length);
    } else if (typeof response.data === 'object') {
      // Intentar encontrar cualquier array en el objeto
      const arrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (arrays.length > 0) {
        backendTeams = arrays[0];
        console.log("📊 Datos encontrados en valores del objeto, cantidad:", backendTeams.length);
      }
    }

    if (!Array.isArray(backendTeams)) {
      console.warn("⚠️ [DEBUG getTeams] Los datos no son un array:", backendTeams);
      return [];
    }

    // 🔥 DEBUG CRÍTICO: Mostrar estructura del primer equipo
    if (backendTeams.length > 0) {
      console.log("🔥 [DEBUG] Primer equipo CRUDO del backend:", JSON.stringify(backendTeams[0], null, 2));
      console.log("🔥 [DEBUG] Propiedades del primer equipo:", Object.keys(backendTeams[0]));
    }

    // 🔥 CORRECCIÓN: Pasar el índice a la función de mapeo
    const mappedTeams = backendTeams.map((team, index) => mapBackendTeamToFrontend(team, index));

    console.log(`✅ [DEBUG getTeams] ${mappedTeams.length} equipos mapeados exitosamente`);

    // 🔥 DEBUG: Verificar que todos los IDs sean únicos
    const teamIds = mappedTeams.map(team => team.id);
    const uniqueTeamIds = new Set(teamIds);
    if (teamIds.length !== uniqueTeamIds.size) {
      console.warn("⚠️ [DEBUG getTeams] ADVERTENCIA: Hay IDs de equipo duplicados!");
    }

    // Verificar IDs únicos de jugadores
    mappedTeams.forEach((team, teamIndex) => {
      const playerIds = team.players.map(player => player.id);
      const uniquePlayerIds = new Set(playerIds);
      if (playerIds.length !== uniquePlayerIds.size) {
        console.warn(`⚠️ [DEBUG getTeams] Equipo ${teamIndex} (${team.name}): IDs de jugadores duplicados!`);
        // 🔥 CORRECCIÓN: Regenerar IDs duplicados
        team.players.forEach((player, playerIndex) => {
          if (playerIds.indexOf(player.id!) !== playerIndex) {
            player.id = `team-${team.id}-player-${playerIndex}-${generateUniqueId()}`;
          }
        });
      }
    });

    // 🔥 DEBUG: Mostrar cómo quedó el primer equipo mapeado
    if (mappedTeams.length > 0) {
      const firstTeam = mappedTeams[0];
      console.log("🔥 [DEBUG] Primer equipo MAPEADO:", {
        id: firstTeam.id,
        name: firstTeam.name,
        coach: firstTeam.coach,
        category: firstTeam.category,
        mainField: firstTeam.mainField,
        playersCount: firstTeam.players.length,
        playerIds: firstTeam.players.map(p => p.id).slice(0, 3) // Mostrar primeros 3 IDs
      });
    }

    return mappedTeams;

  } catch (error: any) {
    console.error("❌ [DEBUG getTeams] Error en la petición:");
    console.error("   Mensaje:", error.message);
    console.error("   Response status:", error.response?.status);
    console.error("   Response data:", error.response?.data);
    console.error("   Response headers:", error.response?.headers);
    console.error("   Request URL:", error.config?.url);
    console.error("   Request method:", error.config?.method);

    throw error;
  }
}

async function createTeam(idTournament: string, team: NewTeamData): Promise<Team> {
  console.log("🔍 [DEBUG createTeam] Iniciando creación de equipo");
  console.log("   idTournament:", idTournament);
  console.log("   Datos del equipo (frontend):", JSON.stringify(team, null, 2));
  console.log("   Cantidad de jugadores:", team.players?.length || 0);

  if (!idTournament) {
    console.error("❌ [DEBUG createTeam] ERROR: idTournament es null/undefined");
    throw new Error("El idTournament es requerido");
  }

  const token = getToken();
  console.log("🔍 [DEBUG createTeam] Token disponible:", token ? "Sí" : "No");

  const url = `${API_URL}/${idTournament}/teams`;
  console.log("🔍 [DEBUG createTeam] URL completa:", url);

  // Mapear datos del frontend al backend
  const backendPayload = mapFrontendTeamToBackend(team);
  console.log("📤 [DEBUG createTeam] Payload para backend:", JSON.stringify(backendPayload, null, 2));

  try {
    console.log("🔍 [DEBUG createTeam] Realizando petición POST...");
    const response = await axios.post(url, backendPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log("✅ [DEBUG createTeam] Equipo creado exitosamente:");
    console.log("   Status:", response.status);
    console.log("   Data:", response.data);

    // Mapear la respuesta del backend al frontend
    const createdTeam = mapBackendTeamToFrontend(response.data);
    console.log("✅ [DEBUG createTeam] Equipo mapeado (frontend):", createdTeam);

    return createdTeam;

  } catch (error: any) {
    console.error("❌ [DEBUG createTeam] Error en la petición:");
    console.error("   Mensaje:", error.message);
    console.error("   Response status:", error.response?.status);
    console.error("   Response data:", error.response?.data);
    console.error("   Request data enviada:", error.config?.data);

    // Si hay error de validación del backend
    if (error.response?.data?.errors) {
      console.error("   Errores de validación:");
      error.response.data.errors.forEach((err: any) => {
        console.error(`     - ${err.field}: ${err.defaultMessage}`);
      });
    }

    throw error;
  }
}

async function updateTeam(idTournament: string, teamId: string, team: Partial<Team>): Promise<Team> {
  console.log("🔍 [DEBUG updateTeam] Iniciando actualización");
  console.log("   idTournament:", idTournament);
  console.log("   teamId:", teamId);
  console.log("   Datos a actualizar:", team);

  if (!idTournament || !teamId) {
    console.error("❌ [DEBUG updateTeam] ERROR: Parámetros requeridos faltantes");
    throw new Error("idTournament y teamId son requeridos");
  }

  // Crear un objeto completo para el mapeo
  const fullTeam: Team = {
    id: teamId,
    name: team.name || '',
    coach: team.coach || '',
    category: team.category || '',
    mainField: team.mainField || '',
    secondaryField: team.secondaryField,
    players: team.players || []
  };

  const backendPayload = mapFrontendTeamToBackend(fullTeam);

  const token = getToken();
  const response = await axios.put(`${API_URL}/${idTournament}/teams/${teamId}`, backendPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("✅ [DEBUG updateTeam] Equipo actualizado:", response.data);
  return mapBackendTeamToFrontend(response.data);
}

async function deleteTeam(idTournament: string, teamId: string): Promise<void> {
  console.log("🔍 [DEBUG deleteTeam] Iniciando eliminación");
  console.log("   idTournament:", idTournament);
  console.log("   teamId:", teamId);

  if (!idTournament || !teamId) {
    console.error("❌ [DEBUG deleteTeam] ERROR: Parámetros requeridos faltantes");
    throw new Error("idTournament y teamId son requeridos");
  }

  const token = getToken();
  await axios.delete(`${API_URL}/${idTournament}/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("✅ [DEBUG deleteTeam] Equipo eliminado exitosamente");
}

// Función de debugging para verificar conexión
export async function testConnection(): Promise<boolean> {
  console.log("🔍 [DEBUG testConnection] Probando conexión con backend...");

  try {
    const token = getToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log("✅ [DEBUG testConnection] Conexión exitosa");
    console.log("   Status:", response.status);
    console.log("   Backend disponible");

    return true;
  } catch (error: any) {
    console.error("❌ [DEBUG testConnection] Error de conexión:");
    console.error("   Mensaje:", error.message);
    console.error("   Código:", error.code);
    console.error("   URL:", API_URL);

    if (error.response) {
      console.error("   Response status:", error.response.status);
    } else if (error.request) {
      console.error("   No se recibió respuesta del servidor");
    }

    return false;
  }
}

// 🔥 FUNCIÓN NUEVA: Para generar IDs únicos en el componente
export function generatePlayerId(): string {
  return generateUniqueId('player-');
}

export default {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  testConnection,
  generatePlayerId,
};