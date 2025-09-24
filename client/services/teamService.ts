import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/teams";

// Interfaces
export interface Player {
  id: string;
  name: string;
  position: string;   // código del enum (ej: "PO")
  dorsalNumber: number;
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField: string;
  players: Player[];
}

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

// Servicios API
async function getTeams(): Promise<Team[]> {
  const token = getToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

async function createTeam(team: Omit<Team, "id">): Promise<Team> {
  const token = getToken();
  const response = await axios.post(`${API_URL}/create`, team, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${id}`, team, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

async function deleteTeam(id: string): Promise<void> {
  const token = getToken();
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};
