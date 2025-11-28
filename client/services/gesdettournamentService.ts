//ReglasTorneo.tsx
//GestionDetallesTorneo.tsx

import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/tournaments";


export interface TournamentData {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  format: string;
  homeAndAway: boolean;
  numberOfTeams: number;
  yellowCardsSuspension: number;
  refereeIds: number[];
  status: string; // 🔹 Se calcula automáticamente
}

export interface TeamStanding {
  teamName: string;
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesTied: number;
  gamesLost: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
}

export interface Match {
  homeTeam: string;
  awayTeam: string;
  goalsHomeTeam?: number;
  goalsAwayTeam?: number;
  matchDateTime: string;
  stadium?: string;
}

export interface PlayerStat {
  playerName: string;
  team: string;
  goalScore?: number;
  yellowCards?: number;
}

export interface Team {
  id: number;
  name: string;
}

// ==================== 🔹 PETICIONES ====================

// 1️⃣ Obtener información general del torneo
async function getTournament(idTournament: string): Promise<TournamentData> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const t = response.data;

  // 🔹 Ajustar fechas a horario colombiano
  const startDate = adjustToColombianTime(t.startDate);
  const endDate = adjustToColombianTime(t.endDate);

  // 🔹 Cálculo del estado del torneo (en el front)
  const status =
    new Date(t.endDate) < new Date()
      ? "Finalizado"
      : new Date(t.startDate) > new Date()
      ? "Pendiente"
      : "En curso";

  return { ...t, startDate, endDate, status };
}

// 2️⃣ Obtener tabla de posiciones
async function getStandings(idTournament: string): Promise<TeamStanding[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/positions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = response.data.positions || [];

  return data.map((team: any) => ({
    teamName: team.teamName,
    points: team.points,
    gamesPlayed: team.gamesPlayed,
    gamesWon: team.gamesWon,
    gamesTied: team.gamesTied,
    gamesLost: team.gamesLost,
    goalsScored: team.goalsScored,
    goalsConceded: team.goalsConceded,
    goalDifference: team.goalDifference,
  }));
}

// 3️⃣ Obtener goleadores
async function getTopScorers(idTournament: string): Promise<PlayerStat[]> {
  const token = getToken();
  const response = await axios.get(`${API_URL}/${idTournament}/top-scorer`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = response.data.players || [];
  return data.map((player: any) => ({
    playerName: player.playerName,
    team: player.team,
    goalScore: player.goalScore,
  }));
}

// 4️⃣ Obtener jugadores con más amarillas
async function getTopYellowCards(idTournament: string): Promise<PlayerStat[]> {
  const token = getToken();
  const response = await axios.get(
    `${API_URL}/${idTournament}/top-yellowcards`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = response.data.players || [];
  return data.map((player: any) => ({
    playerName: player.playerName,
    team: player.team,
    yellowCards: player.yellowCards,
  }));
}

// 🔹 Función para ajustar hora UTC a hora local de Colombia
function adjustToColombianTime(dateString: string): string {
  const utcDate = new Date(dateString);
  const colombiaTime = new Date(utcDate.getTime() - 5 * 60 * 60 * 1000);
  return colombiaTime.toISOString();
}

// 5️⃣ Obtener los últimos 3 partidos
async function getRecentMatches(idTournament: string): Promise<Match[]> {
  const token = getToken();
  const response = await axios.get(
    `${API_URL}/${idTournament}/matches/played`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { searchsize: 3 },
    }
  );

  const data = response.data.matches || [];

  // 🔸 Ajustar hora al horario colombiano
  return data.map((match: any) => ({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    goalsHomeTeam: match.goalsHomeTeam,
    goalsAwayTeam: match.goalsAwayTeam,
    matchDateTime: adjustToColombianTime(match.matchDateTime),
  }));
}

// 6️⃣ Obtener los próximos 3 partidos
async function getUpcomingMatches(idTournament: string): Promise<Match[]> {
  const token = getToken();
  const response = await axios.get(
    `${API_URL}/${idTournament}/matches/upcoming`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { searchsize: 3 },
    }
  );

  const data = response.data.matches || [];

  // 🔸 Ajustar hora al horario colombiano
  return data.map((match: any) => ({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    matchDateTime: adjustToColombianTime(match.matchDateTime),
    stadium: match.stadium,
  }));
}

// 7️⃣ Obtener jugadores suspendidos
async function getSuspendedPlayers(idTournament: string): Promise<any[]> {
  const token = getToken();
  const response = await axios.get(`http://localhost:8085/api/players/${idTournament}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { status: "SUSPENDED" },
  });

  return response.data.players || [];
}

// 8️⃣ Obtener todos los equipos del torneo con sus IDs
async function getTournamentTeams(idTournament: string): Promise<Team[]> {
  const token = getToken();
  
  try {
    const response = await axios.get(`${API_URL}/${idTournament}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('🔍 Respuesta completa de teams endpoint:', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data
    });

    // Manejar diferentes estructuras de respuesta
    let teamsArray: any[] = [];

    if (response.data && Array.isArray(response.data)) {
      teamsArray = response.data;
    } else if (response.data && response.data.teams && Array.isArray(response.data.teams)) {
      teamsArray = response.data.teams;
    } else if (response.data && response.data.referees) {
      console.error('❌ ERROR: El endpoint devolvió árbitros en lugar de equipos');
      return [];
    } else {
      console.warn('⚠️ Estructura inesperada, devolviendo array vacío');
      return [];
    }

    // Mapear a la estructura esperada
    const mappedTeams = teamsArray.map(item => ({
      id: item.id || item.teamId || 0,
      name: item.name || item.teamName || 'Equipo sin nombre'
    })).filter(team => team.id > 0 && team.name); // Filtrar equipos con ID y nombre válidos

    console.log(`✅ ${mappedTeams.length} equipos mapeados:`, mappedTeams);
    return mappedTeams;

  } catch (error: any) {
    console.error('❌ Error obteniendo equipos:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 404) {
      console.log('📭 El torneo no tiene equipos registrados');
      return [];
    }
    
    return [];
  }
}

// 9️⃣ Obtener detalles de un equipo específico (por si acaso)
async function getTeamDetails(idTournament: string, idTeam: string): Promise<Team | null> {
  const token = getToken();
  
  try {
    const response = await axios.get(`${API_URL}/${idTournament}/teams/${idTeam}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const teamData = response.data;
    return {
      id: teamData.id || parseInt(idTeam),
      name: teamData.name || teamData.teamName || 'Equipo sin nombre'
    };
  } catch (error) {
    console.error(`Error obteniendo detalles del equipo ${idTeam}:`, error);
    return null;
  }
}

export default {
  getTournament,
  getStandings,
  getTopScorers,
  getTopYellowCards,
  getRecentMatches,
  getUpcomingMatches,
  getSuspendedPlayers,
  getTournamentTeams, // ✅ NUEVA FUNCIÓN
  getTeamDetails,      // ✅ FUNCIÓN ADICIONAL
};