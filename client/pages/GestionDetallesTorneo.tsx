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
} from "lucide-react";
import gesdettournamentService, {
  TournamentData,
  TeamStanding,
  Match,
} from "@/services/gesdettournamentService";

const getStatusColor = (status: TournamentData["status"]) => {
  switch (status) {
    case "En curso":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Finalizado":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    case "Pendiente":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
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

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const t = await gesdettournamentService.getTournament(id);
        setTournament(t);

        const s = await gesdettournamentService.getStandings(id);
        setStandings(s);

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
    navigate("/team/1"); // TODO: ajustar al ID real de equipo cuando backend lo devuelva
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {tournament.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gestión completa del torneo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Sección 1: Estado General */}
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
                  Estado
                </label>
                <div className="mt-1">
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Equipos Participantes
                </label>
                <div className="flex items-center mt-1">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-lg font-semibold text-gray-900">
                    {tournament.teams}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
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
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Tabla de Posiciones */}
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
                  {standings.map((team) => (
                    <TableRow
                      key={team.position}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            team.position <= 3
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {team.position}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleTeamClick(team.team)}
                          className="text-primary hover:text-primary/80 hover:underline cursor-pointer"
                        >
                          {team.team}
                        </button>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {team.points}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.played}
                      </TableCell>
                      <TableCell className="text-center">{team.won}</TableCell>
                      <TableCell className="text-center">
                        {team.drawn}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.lost}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.goalsFor}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.goalsAgainst}
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

        {/* Sección 3: Partidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resultados Recientes */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Timer className="w-5 h-5 mr-2 text-primary" />
                Resultados Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {match.teamA}
                      </span>
                      <div className="mx-4 text-lg font-bold text-primary">
                        {match.scoreA} - {match.scoreB}
                      </div>
                      <span className="font-medium text-gray-900">
                        {match.teamB}
                      </span>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      {formatShortDate(match.date)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Próximos Partidos */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Próximos Partidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {match.teamA}
                      </span>
                      <div className="mx-4 text-lg font-bold text-gray-400">
                        VS
                      </div>
                      <span className="font-medium text-gray-900">
                        {match.teamB}
                      </span>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-1">
                      {formatShortDate(match.date)} - {match.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sección 4: Acciones del Organizador */}
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
                onClick={() => {
                  navigate("/generacion-automatica");
                  console.log("Ir a generador de llaves");
                }}
              >
                <Trophy className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Generar llaves</div>
                  <div className="text-xs opacity-90">Competencia automática</div>
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

