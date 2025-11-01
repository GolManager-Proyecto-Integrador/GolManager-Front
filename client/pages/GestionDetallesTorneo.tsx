import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Target,
  Calendar,
  Users,
  Timer,
  Star,
  AlertTriangle,
} from "lucide-react";
import gesdettournamentService, {
  TournamentData,
  TeamStanding,
  Match,
  PlayerStat,
} from "@/services/gesdettournamentService";

// ✅ Calcula el estado actual del torneo según las fechas
const getTournamentStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "Pendiente";
  if (now > end) return "Finalizado";
  return "En curso";
};

// ✅ Define el color del Badge según el estado
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pendiente":
      return "bg-gray-200 text-gray-800";
    case "En curso":
      return "bg-green-200 text-green-800";
    case "Finalizado":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });
};

export default function GestionDetallesTorneo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [topScorers, setTopScorers] = useState<PlayerStat[]>([]);
  const [topYellows, setTopYellows] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const tournamentData = await gesdettournamentService.getTournament(id);
        setTournament(tournamentData);

        const standingsData = await gesdettournamentService.getStandings(id);
        setStandings(standingsData);

        const scorers = await gesdettournamentService.getTopScorers(id);
        setTopScorers(scorers);

        const yellows = await gesdettournamentService.getTopYellowCards(id);
        setTopYellows(yellows);

        const recent = await gesdettournamentService.getRecentMatches(id);
        setRecentMatches(recent);

        const upcoming = await gesdettournamentService.getUpcomingMatches(id);
        setUpcomingMatches(upcoming);
      } catch (error) {
        console.error("Error cargando datos del torneo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTeamClick = (team: string) => {
    navigate("/team/1"); // TODO: Reemplazar cuando backend devuelva el ID real
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Cargando datos del torneo...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        No se encontró el torneo
      </div>
    );
  }

  const tournamentStatus = getTournamentStatus(
    tournament.startDate,
    tournament.endDate
  );

  return (
    <div className="min-h-screen bg-gray-50">
{/* 🔹 Header */}
<div className="bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      {/* 🔸 Izquierda: título y subtítulo */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {tournament.name}
          </h1>
          <p className="text-sm text-gray-500">Gestión completa del torneo</p>
        </div>
      </div>

      {/* 🔸 Derecha: botón alineado */}

      <Button
  onClick={() => navigate("/dashboard-organizador")}
  variant="outline"
  className="text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900 shadow-lg"
  size="lg"
>
  <ArrowLeft className="w-5 h-5 mr-2" />
  Volver al panel
</Button>


      <Button
        variant="outline"
        size="sm"
        className="text-primary border-primary hover:bg-primary hover:text-white transition"
        onClick={() => navigate(`/tournament/${id}/teams-manage`)}
      >
        <Users className="w-4 h-4 mr-2" />
        Ver equipos del torneo
      </Button>
    </div>
  </div>
</div>


      {/* 🔹 Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 🏆 Información General */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Trophy className="w-5 h-5 mr-2 text-primary" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre del Torneo
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {tournament.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Formato
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {tournament.format}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Equipos Participantes
                </label>
                <div className="flex items-center mt-1">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-lg font-semibold text-gray-900">
                    {tournament.numberOfTeams}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Inicio
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-gray-900">
                    {formatDate(tournament.startDate)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Finalización
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-gray-900">
                    {formatDate(tournament.endDate)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <div className="mt-1">
                  <Badge className={getStatusColor(tournamentStatus)}>
                    {tournamentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🔹 Tabla de Posiciones */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Tabla de Posiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Pos</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">Pts</TableHead>
                    <TableHead className="text-center">PJ</TableHead>
                    <TableHead className="text-center">PG</TableHead>
                    <TableHead className="text-center">PE</TableHead>
                    <TableHead className="text-center">PP</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GC</TableHead>
                    <TableHead className="text-center">DG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index < 3
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleTeamClick(team.teamName)}
                          className="text-primary hover:underline"
                        >
                          {team.teamName}
                        </button>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {team.points}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.gamesPlayed}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.gamesWon}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.gamesTied}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.gamesLost}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.goalsScored}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.goalsConceded}
                      </TableCell>
                      <TableCell
                        className={`text-center font-medium ${
                          team.goalDifference > 0
                            ? "text-green-600"
                            : team.goalDifference < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {team.goalDifference > 0 ? "+" : ""}
                        {team.goalDifference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 🔹 Goleadores y Amarillas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Máximos Goleadores */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Máximos Goleadores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topScorers.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">
                    {p.playerName} ({p.team})
                  </span>
                  <span className="font-semibold text-primary">
                    ⚽ {p.goalScore}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Más Amarillas */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Más Tarjetas Amarillas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topYellows.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">
                    {p.playerName} ({p.team})
                  </span>
                  <span className="font-semibold text-yellow-600">
                    🟨 {p.yellowCards}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recientes */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Timer className="w-5 h-5 mr-2 text-primary" />
                Resultados Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {match.homeTeam}
                      </span>
                      <div className="mx-4 text-lg font-bold text-primary">
                        {match.goalsHomeTeam} - {match.goalsAwayTeam}
                      </div>
                      <span className="font-medium text-gray-900">
                        {match.awayTeam}
                      </span>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      {formatShortDate(match.matchDateTime)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Próximos */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Próximos Partidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {match.homeTeam}
                      </span>
                      <div className="mx-4 text-lg font-bold text-gray-400">
                        VS
                      </div>
                      <span className="font-medium text-gray-900">
                        {match.awayTeam}
                      </span>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      {formatShortDate(match.matchDateTime)} — {match.stadium}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Acciones */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Acciones del Organizador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                onClick={() => navigate(`/tournament/${id}/reglas-competencias`)}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Reglas del torneo</div>
                  <div className="text-xs opacity-90">Gestionar normativas</div>
                </div>
              </Button>

              <Button
                className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                onClick={() => navigate("/generacion-automatica")}
              >
                <Trophy className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Generar llaves</div>
                  <div className="text-xs opacity-90">
                    Competencia automática
                  </div>
                </div>
              </Button>

              <Button
                className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                onClick={() => navigate("/actualizar-partido/1")}
              >
                <Target className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Gestión de partidos</div>
                  <div className="text-xs opacity-90">
                    Programar y resultados
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
