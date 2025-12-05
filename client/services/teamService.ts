// services/teamDetailsService.ts

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
      console.error("📌 Headers:", playersError.response?.headers);
      
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

export default {
  getTeamDetails,
  updateTeamDetails,
  updatePlayerDetails,
};