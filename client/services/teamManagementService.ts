import axios from "axios";
import { getToken } from "./authService";

const API_BASE = "/api/tournaments";

// =======================
// 🔹 CONFIGURACIÓN AXIOS
// =======================
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor 
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
  id: number; // 🔹 HACER OBLIGATORIO EL ID
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
// 🔹 REQUESTS BACKEND
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
  secondaryStadium: string;
  teamPlayers: CreatePlayerRequest[];
}

export interface UpdateTeamRequest {
  name: string;
  coach: string;
  teamCategory: string;
  mainStadium: string;
  secondaryStadium: string;
}

// =======================
// 🔹 SERVICE METHODS CORREGIDOS
// =======================
class TeamService {

  // GET all teams - CORREGIDO
  async getTeams(idTournament: number): Promise<Team[]> {
    try {
      const res = await apiClient.get(`/${idTournament}/teams`);
      console.log('📦 Respuesta completa del backend:', res.data);
      
      // 🔹 CORRECCIÓN PRINCIPAL: El backend devuelve un array directo o una propiedad específica
      let teamsData = res.data;
      
      // Si es un objeto con propiedad 'teams' o 'referees' (según tu ejemplo)
      if (teamsData && typeof teamsData === 'object' && !Array.isArray(teamsData)) {
        // Buscar la propiedad que contiene los equipos
        if (teamsData.teams && Array.isArray(teamsData.teams)) {
          teamsData = teamsData.teams;
        } else if (teamsData.referees && Array.isArray(teamsData.referees)) {
          // Esto parece un error del backend, pero lo manejamos
          console.warn('⚠️ El backend está devolviendo referees en lugar de teams');
          teamsData = teamsData.referees;
        } else {
          // Si no encontramos la propiedad correcta, usar valores directos
          teamsData = Object.values(teamsData).find(val => Array.isArray(val)) || [];
        }
      }

      // 🔹 MAPEO CORREGIDO - Asegurar que tenemos el ID
      const mappedTeams = teamsData.map((backendTeam: any, index: number) => {
        // Usar teamId si existe, sino id, sino generar uno temporal
        const teamId = backendTeam.teamId || backendTeam.id || index + 1;
        
        console.log(`🔍 Mapeando equipo:`, {
          original: backendTeam,
          id: teamId,
          name: backendTeam.teamName || backendTeam.name,
          coach: backendTeam.coachName || backendTeam.coach
        });

        return {
          id: teamId, // 🔹 ESTO ES CRÍTICO PARA LA NAVEGACIÓN
          name: backendTeam.teamName || backendTeam.name || `Equipo ${teamId}`,
          coach: backendTeam.coachName || backendTeam.coach || 'Sin DT',
          category: backendTeam.teamCategory || backendTeam.category || 'SIN_CATEGORIA',
          mainField: backendTeam.mainStadium || backendTeam.mainField || 'Sin cancha',
          secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField,
          players: backendTeam.teamPlayers ? backendTeam.teamPlayers.map((p: any) => ({
            id: p.id || Date.now() + Math.random(),
            name: p.name || 'Jugador sin nombre',
            position: p.playerPosition || p.position || 'DF',
            dorsalNumber: p.shirtNumber || p.dorsalNumber || 0,
            age: p.age || 18
          })) : []
        };
      });

      console.log('✅ Equipos mapeados:', mappedTeams);
      return mappedTeams;

    } catch (error) {
      console.error('❌ Error en getTeams:', error);
      throw error;
    }
  }

  // GET team by id - CORREGIDO
  async getTeam(idTournament: number, idTeam: number): Promise<Team> {
    const res = await apiClient.get(`/${idTournament}/teams/${idTeam}`);
    const backendTeam = res.data;

    console.log('📦 Respuesta de equipo individual:', backendTeam);

    return {
      id: backendTeam.teamId || backendTeam.id || idTeam,
      name: backendTeam.teamName || backendTeam.name,
      coach: backendTeam.coachName || backendTeam.coach,
      category: backendTeam.teamCategory || backendTeam.category,
      mainField: backendTeam.mainStadium || backendTeam.mainField,
      secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField,
      players: backendTeam.teamPlayers ? backendTeam.teamPlayers.map((p: any) => ({
        id: p.id,
        name: p.name,
        position: p.playerPosition || p.position,
        dorsalNumber: p.shirtNumber || p.dorsalNumber,
        age: p.age
      })) : []
    };
  }

  // CREATE team - MANTENER igual
  async createTeam(idTournament: number, team: Omit<Team, "id">) {
    const payload: CreateTeamRequest = {
      teamName: team.name,
      coachName: team.coach,
      teamCategory: team.category,
      mainStadium: team.mainField,
      secondaryStadium: team.secondaryField || "",
      teamPlayers: team.players.map(p => ({
        name: p.name,
        age: p.age || 18,
        playerPosition: p.position,
        shirtNumber: p.dorsalNumber
      }))
    };

    console.log('📤 Enviando equipo al backend:', payload);
    const res = await apiClient.post(`/${idTournament}/teams`, payload);
    return res.data;
  }

  // UPDATE team - MANTENER igual
  async updateTeam(idTournament: number, idTeam: number, data: UpdateTeamRequest) {
    const res = await apiClient.put(`/${idTournament}/teams/${idTeam}`, data);
    return res.data;
  }

  // DELETE team - MANTENER igual
  async deleteTeam(idTournament: number, idTeam: number) {
    const res = await apiClient.delete(`/${idTournament}/teams/${idTeam}`);
    return res.data;
  }
}

export default new TeamService();