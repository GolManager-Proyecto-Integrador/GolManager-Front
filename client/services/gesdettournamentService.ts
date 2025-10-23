//ReglasTorneo.tsx
//GestionDetallesTorneo.tsx

import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/tournaments";



// ==================== 🔹 Tipos ====================
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
  status: string; // 🔹 Ya no es opcional, se calcula automáticamente
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

export default {
  getTournament,
  getStandings,
  getTopScorers,
  getTopYellowCards,
  getRecentMatches,
  getUpcomingMatches,
  getSuspendedPlayers, 
};

