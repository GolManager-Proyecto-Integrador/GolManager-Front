import axios from "axios";
import { getToken } from "./authService";

// Ajusta al puerto y ruta de tu backend
const API_URL = "http://localhost:8085/api/dashboard";

export interface DashboardStats {
  totalTournaments: number;
  activeTournaments: number;
  upcomingMatches: number;
  registeredTeams: number;
}

export interface OrganizerInfo {
  id: string;
  name: string;
  email: string;
}

// 🔹 Obtener estadísticas principales del dashboard
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 🔹 Obtener info del organizador
export async function fetchOrganizerInfo(): Promise<OrganizerInfo> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/organizer`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
