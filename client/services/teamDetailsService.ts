// TeamDetails.tsx
import axios from "axios";
import { getToken } from "./authService";

// =========================
//   URL BASES SEGÚN BACKEND
// =========================
const API_TOURNAMENTS = "/api/tournaments";
const API_PLAYERS = "/api/players";

// ============================================================
// 🔹 INTERFACES DEL FRONTEND (LO QUE LA VISTA NECESITA)
// ============================================================

export interface Player {
  id: string;
  name: string;
  position: string;
  role: "Titular" | "Suplente";        // Vista lo usa
  dorsalNumber: number;
  goals?: number;
  yellowCards?: number;
  redCards?: number;

  // Vista usa estas variantes:
  status: "Activo" | "Suspendido" | "Lesionado";
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField?: string;
  players: Player[]; // NECESARIO PARA LA VISTA
}

// ============================================================
// 🔹 INTERFACES DEL BACKEND (JSON REAL)
// ============================================================

interface BackendTeam {
  teamId: number;
  name: string;
  coach: string;
  category: string;
  mainStadium: string;
  secondaryStadium: string;
  dataCreated: string;
}

interface BackendPlayer {
  idPlayer: string;
  name: string;
  position: string;
  starter: "TRUE" | "FALSE";
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
  starter: "TRUE" | "FALSE";
  shirtNumber: string;
  status: "ACTIVE" | "SUSPENDED" | "INJURED";
}

// ============================================================
// 🔹 MAPEO BACKEND → FRONTEND
// ============================================================

function mapBackendPlayer(p: BackendPlayer): Player {
  return {
    id: p.idPlayer,
    name: p.name,
    position: p.position,
    role: p.starter === "TRUE" ? "Titular" : "Suplente",
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

function mapBackendTeam(t: BackendTeam, players: Player[]): Team {
  return {
    id: String(t.teamId),
    name: t.name,
    coach: t.coach,
    category: t.category,
    mainField: t.mainStadium,
    secondaryField: t.secondaryStadium,
    players,
  };
}

// ============================================================
// 🔹 MAPEO FRONTEND → BACKEND (solo para PUT)
// ============================================================

function mapFrontendPlayerToBackend(p: Player): UpdatePlayerDTO {
  return {
    idPlayer: p.id,
    name: p.name,
    position: p.position,
    starter: p.role === "Titular" ? "TRUE" : "FALSE",
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
// 🔹 GET: Obtener detalles del equipo + jugadores
// ============================================================

export async function getTeamDetails(
  idTournament: string,
  idTeam: string
): Promise<Team> {
  const token = getToken();

  // 1️⃣ GET team
  const teamResponse = await axios.get<BackendTeam>(
    `${API_TOURNAMENTS}/${idTournament}/teams/${idTeam}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // 2️⃣ GET players
  const playersResponse = await axios.get<BackendPlayer[]>(
    `${API_PLAYERS}/${idTournament}/teams/${idTeam}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const backendTeam = teamResponse.data;
  const backendPlayers = playersResponse.data;

  const players = backendPlayers.map(mapBackendPlayer);

  return mapBackendTeam(backendTeam, players);
}

// ============================================================
// 🔹 PUT: Actualizar solo datos del equipo
// ============================================================

export async function updateTeamDetails(
  idTournament: string,
  idTeam: string,
  team: Team
): Promise<Team> {
  const token = getToken();

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
