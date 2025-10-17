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

  // 🔹 Cálculo del estado del torneo (en el front)
  const status =
    new Date(t.endDate) < new Date()
      ? "Finalizado"
      : new Date(t.startDate) > new Date()
      ? "Pendiente"
      : "En curso";

  return { ...t, status };
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

  return data.map((match: any) => ({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    goalsHomeTeam: match.goalsHomeTeam,
    goalsAwayTeam: match.goalsAwayTeam,
    matchDateTime: match.matchDateTime,
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

  return data.map((match: any) => ({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    matchDateTime: match.matchDateTime,
    stadium: match.stadium,
  }));
}

// ==================== 🔹 EXPORTACIÓN ====================
export default {
  getTournament,
  getStandings,
  getTopScorers,
  getTopYellowCards,
  getRecentMatches,
  getUpcomingMatches,
};
