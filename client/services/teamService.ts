import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/tournaments";

// Interfaces
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

//
// 🔹 Mapeos entre API y Frontend
//
function mapTeamFromApi(apiTeam: any): Team {
  return {
    id: apiTeam.id,
    name: apiTeam.teamName,      
    coach: apiTeam.coachName,    
    category: apiTeam.teamCategory,
    mainField: apiTeam.mainStadium,
    secondaryField: apiTeam.secondaryStadium || "",
    players: (apiTeam.teamPlayers || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      position: p.playerPosition,
      dorsalNumber: p.shirtNumber,
      age: p.age,
    })),
  };
}

function mapTeamToApi(team: Partial<Team>) {
  return {
    id: team.id,
    teamName: team.name,      
    coachName: team.coach,
    teamCategory: team.category,
    mainStadium: team.mainField,
    secondaryStadium: team.secondaryField,
    teamPlayers: team.players?.map(p => ({
      id: p.id,
      name: p.name,
      playerPosition: p.position,
      shirtNumber: p.dorsalNumber,
      age: p.age || 0, // por si no lo captura el form
    })),
  };
}

//
// 🔹 Servicios API
//
async function getTeams(idTournament: string): Promise<Team[]> {
  if (!idTournament) throw new Error("El idTournament es requerido");
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.map((t: any) => mapTeamFromApi(t));
}

async function createTeam(idTournament: string, team: NewTeamData): Promise<Team> {
  if (!idTournament) throw new Error("El idTournament es requerido");
  const token = getToken();
  const response = await axios.post(
    `${API_URL}/${idTournament}/teams`,
    mapTeamToApi(team),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return mapTeamFromApi(response.data);
}

async function updateTeam(idTournament: string, teamId: string, team: Partial<Team>): Promise<Team> {
  if (!idTournament || !teamId) throw new Error("idTournament y teamId son requeridos");
  const token = getToken();
  const response = await axios.put(
    `${API_URL}/${idTournament}/teams/${teamId}`,
    mapTeamToApi(team),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return mapTeamFromApi(response.data);
}

async function deleteTeam(idTournament: string, teamId: string): Promise<void> {
  if (!idTournament || !teamId) throw new Error("idTournament y teamId son requeridos");
  const token = getToken();
  await axios.delete(`${API_URL}/${idTournament}/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};
