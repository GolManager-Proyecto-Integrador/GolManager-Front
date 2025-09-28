import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Search, Plus } from "lucide-react";

import teamService, { Team } from "@/services/teamService";

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Obtenemos el idTournament desde URL o state
  const location = useLocation();
  const { idTournament: idFromParams } = useParams<{ idTournament: string }>();
  const idTournament = location.state?.idTournament || idFromParams;

  // 🔹 Cargar equipos desde el backend
  const fetchTeams = async () => {
    if (!idTournament) return;
    try {
      setLoading(true);
      const data = await teamService.getTeams(idTournament);
      setTeams(data);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [idTournament]);

  // 🔎 Filtrar equipos por búsqueda
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.coach.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.players.some(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Gestión de Torneos
            </h1>
          </div>
          <p className="text-gray-600">Consulta de equipos y participantes</p>
        </div>

        {/* Teams List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="w-6 h-6" />
                Equipos Inscritos
              </CardTitle>
              <Link to="/teams-manage" state={{ idTournament }}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Equipo
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Search Field */}
            <div className="mb-6">
              <Label htmlFor="search" className="text-sm font-semibold text-gray-700 mb-2 block">
                Buscar Equipos
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busca por nombre del equipo, entrenador o jugador..."
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg h-12 pl-10"
                />
              </div>
            </div>

            {/* Teams Table/List */}
            {loading ? (
              <p className="text-center text-gray-600 py-12">Cargando equipos...</p>
            ) : filteredTeams.length > 0 ? (
              <div className="space-y-6">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Team Name */}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {team.name}
                        </h3>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Equipo ID:</span> #{team.id}
                        </div>
                      </div>

                      {/* Coach */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Entrenador</h4>
                        <p className="text-gray-900 font-medium">{team.coach}</p>
                      </div>

                      {/* Players List */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Lista de Jugadores ({team.players.length})
                        </h4>
                        <div className="max-h-32 overflow-y-auto">
                          <ul className="space-y-1 text-sm">
                            {team.players.map((player) => (
                              <li key={player.id} className="text-gray-700">
                                <span className="font-medium">{player.name}</span>
                                {player.dorsalNumber && (
                                  <span className="text-gray-500 ml-2">#{player.dorsalNumber}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Teams Message */
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No se encontraron equipos" : "Aún no hay equipos registrados"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `No hay equipos que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                    : "Cuando se registren equipos en el torneo, aparecerán aquí para que puedas consultarlos."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Sistema de Gestión de Torneos de Fútbol v1.0</p>
        </div>
      </div>
    </div>
  );
}