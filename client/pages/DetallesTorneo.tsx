import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Calendar,
  Trophy,
  Clock,
  AlertTriangle,
  Target,
  Users,
} from "lucide-react";

import dettournamentService, {
  Tournament,
  Match,
  TeamPosition,
} from "@/services/dettournamentService";

// Utility functions
const getStatusColor = (status: "pendiente" | "en_curso" | "finalizado") => {
  switch (status) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "en_curso":
      return "bg-green-100 text-green-800 border-green-200";
    case "finalizado":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusText = (status: "pendiente" | "en_curso" | "finalizado") => {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "en_curso":
      return "En curso";
    case "finalizado":
      return "Finalizado";
    default:
      return "Desconocido";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatMatchDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function DetallesTorneo() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("calendario");

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<TeamPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        dettournamentService.getTournamentDetails(id),
        dettournamentService.getMatches(id),
        dettournamentService.getStandings(id),
      ])
        .then(([tData, mData, sData]) => {
          setTournament(tData);
          setMatches(mData);
          setStandings(sData);
        })
        .catch((error) => {
          console.error("Error cargando datos del torneo:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <p className="text-gray-600">Cargando detalles del torneo...</p>
      </div>
    );
  }

  // 404 Not Found Component
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: "#007BFF" }} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Torneo no encontrado</h2>
            <p className="text-gray-600 mb-6">
              El torneo que buscas no existe o ha sido eliminado.
            </p>
            <Link to="/lista-torneos">
              <Button
                className="text-white font-semibold hover:opacity-90 transition-opacity rounded-lg px-6 py-3"
                style={{ backgroundColor: "#007BFF" }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la lista de torneos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calendar Tab Content
  const CalendarContent = () => (
    <div className="space-y-6">
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ⚠️ Aún no hay partidos definidos
          </h3>
          <p className="text-gray-600">
            Los partidos serán programados próximamente.
          </p>
        </div>
      ) : (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "#007BFF" }} />
              Calendario de Partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Hora</TableHead>
                    <TableHead className="font-semibold">Equipo A</TableHead>
                    <TableHead className="font-semibold">Equipo B</TableHead>
                    <TableHead className="font-semibold">Fase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match, index) => (
                    <TableRow
                      key={match.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <TableCell className="font-medium">
                        {formatMatchDate(match.date)}
                      </TableCell>
                      <TableCell className="font-semibold">{match.time}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {match.teamA}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {match.teamB}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: "#E3F2FD",
                            color: "#007BFF",
                            borderColor: "#007BFF",
                          }}
                        >
                          {match.phase}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Results Tab Content
  const ResultsContent = () => {
    const finishedMatches = matches.filter((match) => match.result);

    return (
      <div className="space-y-6">
        {finishedMatches.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚠️ Aún no se han registrado resultados
            </h3>
            <p className="text-gray-600">
              Los resultados aparecerán aquí una vez que se completen los partidos.
            </p>
          </div>
        ) : (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: "#007BFF" }} />
                Resultados de Partidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Partido</TableHead>
                      <TableHead className="font-semibold text-center">
                        Marcador
                      </TableHead>
                      <TableHead className="font-semibold">Ganador</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finishedMatches.map((match, index) => (
                      <TableRow
                        key={match.id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              {match.teamA} vs {match.teamB}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatMatchDate(match.date)} • {match.phase}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={`font-bold text-lg ${
                                match.result?.winner === match.teamA
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {match.result?.scoreA}
                            </span>
                            <span className="text-gray-400 font-bold">-</span>
                            <span
                              className={`font-bold text-lg ${
                                match.result?.winner === match.teamB
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {match.result?.scoreB}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-green-600">
                              {match.result?.winner}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Standings Tab Content
  const StandingsContent = () => (
    <div className="space-y-6">
      {standings.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ⚠️ Aún no hay tabla de posiciones disponible
          </h3>
          <p className="text-gray-600">
            La tabla se generará automáticamente cuando se registren los primeros
            resultados.
          </p>
        </div>
      ) : (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: "#007BFF" }} />
              Tabla de Posiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold w-16">Pos</TableHead>
                    <TableHead className="font-semibold">Equipo</TableHead>
                    <TableHead className="font-semibold text-center">Pts</TableHead>
                    <TableHead className="font-semibold text-center">PJ</TableHead>
                    <TableHead className="font-semibold text-center">PG</TableHead>
                    <TableHead className="font-semibold text-center">PE</TableHead>
                    <TableHead className="font-semibold text-center">PP</TableHead>
                    <TableHead className="font-semibold text-center">GF</TableHead>
                    <TableHead className="font-semibold text-center">GC</TableHead>
                    <TableHead className="font-semibold text-center">DG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team, index) => (
                    <TableRow
                      key={team.position}
                      className={`hover:bg-blue-50 transition-colors ${
                        team.isQualified
                          ? "bg-green-50 border-l-4 border-green-500"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }`}
                    >
                      <TableCell className="font-bold text-center text-lg">
                        {team.position}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {team.team}
                          </span>
                          {team.isQualified && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                              Clasificado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-center font-bold text-lg"
                        style={{ color: "#007BFF" }}
                      >
                        {team.points}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {team.played}
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {team.won}
                      </TableCell>
                      <TableCell className="text-center font-medium text-yellow-600">
                        {team.drawn}
                      </TableCell>
                      <TableCell className="text-center font-medium text-red-600">
                        {team.lost}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {team.goalsFor}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {team.goalsAgainst}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        <span
                          className={
                            team.goalDifference >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {team.goalDifference >= 0 ? "+" : ""}
                          {team.goalDifference}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Leyenda:</h4>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <span>
                  <strong>Pts:</strong> Puntos
                </span>
                <span>
                  <strong>PJ:</strong> Partidos Jugados
                </span>
                <span>
                  <strong>PG:</strong> Partidos Ganados
                </span>
                <span>
                  <strong>PE:</strong> Partidos Empatados
                </span>
                <span>
                  <strong>PP:</strong> Partidos Perdidos
                </span>
                <span>
                  <strong>GF:</strong> Goles a Favor
                </span>
                <span>
                  <strong>GC:</strong> Goles en Contra
                </span>
                <span>
                  <strong>DG:</strong> Diferencia de Goles
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border-l-4 border-green-500"></div>
                  <span className="text-xs text-gray-600">
                    Equipos clasificados a la siguiente fase
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/lista-torneos">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la lista de torneos
            </Button>
          </Link>

          {/* Tournament Title and Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {tournament.name}
                </h1>
              </div>
              <Badge
                className={`${getStatusColor(
                  tournament.status
                )} border text-sm px-3 py-1`}
                variant="outline"
              >
                {getStatusText(tournament.status)}
              </Badge>
            </div>

            {/* Tournament Dates and Status */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Inicio: {formatDate(tournament.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Fin: {formatDate(tournament.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Internal Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-12 bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-1 sm:gap-0">
              <TabsTrigger
                value="calendario"
                className="data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200 hover:bg-gray-100 data-[state=active]:hover:bg-opacity-90 py-3 sm:py-2"
                style={{
                  backgroundColor: activeTab === 'calendario' ? '#007BFF' : 'transparent'
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendario
              </TabsTrigger>
              <TabsTrigger
                value="resultados"
                className="data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200 hover:bg-gray-100 data-[state=active]:hover:bg-opacity-90 py-3 sm:py-2"
                style={{
                  backgroundColor: activeTab === 'resultados' ? '#007BFF' : 'transparent'
                }}
              >
                <Target className="w-4 h-4 mr-2" />
                Resultados
              </TabsTrigger>
              <TabsTrigger
                value="posiciones"
                className="data-[state=active]:text-white rounded-lg font-semibold transition-all duration-200 hover:bg-gray-100 data-[state=active]:hover:bg-opacity-90 py-3 sm:py-2"
                style={{
                  backgroundColor: activeTab === 'posiciones' ? '#007BFF' : 'transparent'
                }}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Tabla de Posiciones
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="calendario" className="space-y-6">
            <CalendarContent />
          </TabsContent>
          
          <TabsContent value="resultados" className="space-y-6">
            <ResultsContent />
          </TabsContent>
          
          <TabsContent value="posiciones" className="space-y-6">
            <StandingsContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
