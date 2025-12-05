import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Users, Trophy, Search, Plus, Edit, Trash2, 
  User, MapPin, Award, Loader2 
} from "lucide-react";

import teamService, { Team } from "@/services/teamService";

export default function Teams() {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = `Equipos Inscritos`;
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [updatingTeamId, setUpdatingTeamId] = useState<string | null>(null);

  // Estados para modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedCoach, setEditedCoach] = useState("");

  const location = useLocation();
  const { idTournament: idFromParams } = useParams<{ idTournament: string }>();
  const idTournament = location.state?.idTournament || idFromParams;

  // Cargar equipos desde backend
  const fetchTeams = async () => {
    if (!idTournament) {
      console.error("❌ No hay ID de torneo");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`📥 Cargando equipos del torneo: ${idTournament}`);
      
      const data = await teamService.getTeams(idTournament);
      console.log(`✅ ${data.length} equipos cargados`);
      
      // Cargar jugadores para equipos que tienen ID válido
      const teamsWithPlayers = await Promise.all(
        data.map(async (team) => {
          // Si el equipo ya tiene jugadores, mantenerlo
          if (team.players && team.players.length > 0) {
            return team;
          }
          
          // Si no tiene jugadores, intentar cargarlos
          try {
            if (team.id && team.id !== "undefined" && team.id !== "0") {
              const fullTeam = await teamService.getTeamDetails(idTournament, team.id);
              console.log(`✅ Jugadores cargados para equipo: ${team.name}`);
              return fullTeam;
            }
          } catch (error) {
            console.warn(`⚠️ No se pudieron cargar jugadores para ${team.name}:`, error);
          }
          
          return team;
        })
      );
      
      setTeams(teamsWithPlayers);
      
    } catch (error) {
      console.error("❌ Error cargando equipos:", error);
      alert("Error al cargar los equipos. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idTournament) {
      fetchTeams();
    } else {
      console.error("❌ No se pudo obtener el ID del torneo");
      alert("No se pudo identificar el torneo. Redirigiendo...");
      navigate("/tournaments");
    }
  }, [idTournament]);

  // Filtrado mejorado
  const filteredTeams = teams.filter((team) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Buscar en nombre del equipo
    if (team.name.toLowerCase().includes(searchLower)) return true;
    
    // Buscar en entrenador
    if (team.coach.toLowerCase().includes(searchLower)) return true;
    
    // Buscar en jugadores (solo si hay jugadores cargados)
    if (team.players && team.players.length > 0) {
      return team.players.some((player) =>
        player.name.toLowerCase().includes(searchLower)
      );
    }
    
    return false;
  });

  // Eliminar equipo
  const handleDeleteTeam = async (teamId: string) => {
    if (!idTournament || !teamId) {
      alert("Datos incompletos para eliminar el equipo");
      return;
    }
    
    if (!confirm(`¿Estás seguro de que deseas eliminar este equipo?\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      setDeletingTeamId(teamId);
      await teamService.deleteTeam(idTournament, teamId);
      await fetchTeams();
      alert("✅ Equipo eliminado exitosamente");
    } catch (error: any) {
      console.error("❌ Error eliminando equipo:", error);
      
      if (error.response?.status === 404) {
        alert("El equipo no fue encontrado o ya fue eliminado");
      } else if (error.response?.status === 403) {
        alert("No tienes permisos para eliminar este equipo");
      } else {
        alert("No se pudo eliminar el equipo. Por favor, intenta nuevamente.");
      }
    } finally {
      setDeletingTeamId(null);
    }
  };

  // Abrir modal de edición
  const openEditModal = (team: Team) => {
    if (!team.id) {
      alert("No se puede editar este equipo (ID inválido)");
      return;
    }
    
    setSelectedTeam(team);
    setEditedName(team.name);
    setEditedCoach(team.coach);
    setEditModalOpen(true);
  };

  // Guardar cambios
  const handleSaveEdit = async () => {
    if (!selectedTeam || !selectedTeam.id || !idTournament) {
      alert("Datos incompletos para editar el equipo");
      return;
    }
    
    if (!editedName.trim() || !editedCoach.trim()) {
      alert("El nombre y el entrenador son obligatorios");
      return;
    }
    
    try {
      setUpdatingTeamId(selectedTeam.id);
      
      await teamService.updateTeam(idTournament, selectedTeam.id, {
        name: editedName,
        coach: editedCoach,
      });
      
      setEditModalOpen(false);
      await fetchTeams();
      alert("✅ Equipo actualizado exitosamente");
      
    } catch (error: any) {
      console.error("❌ Error actualizando equipo:", error);
      
      if (error.response?.status === 404) {
        alert("El equipo no fue encontrado");
      } else if (error.response?.status === 400) {
        alert("Datos inválidos para actualizar el equipo");
      } else {
        alert("No se pudo actualizar el equipo. Por favor, intenta nuevamente.");
      }
    } finally {
      setUpdatingTeamId(null);
    }
  };

  // Ver detalles del equipo
  const handleViewTeamDetails = (teamId: string) => {
    if (idTournament && teamId) {
      navigate(`/team/${teamId}`, { 
        state: { idTournament } 
      });
    }
  };

  // Componente de carga
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-gray-100 rounded w-2/3"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <div className="h-9 bg-gray-200 rounded w-20"></div>
            <div className="h-9 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
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
          <p className="text-gray-600">Consulta y gestión de equipos inscritos</p>
        </div>

        {/* Teams List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="w-6 h-6" />
                Equipos Inscritos
                {teams.length > 0 && (
                  <span className="text-sm font-normal bg-white/20 px-2 py-1 rounded-full">
                    {teams.length} equipo{teams.length !== 1 ? 's' : ''}
                  </span>
                )}
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link to="/teams-manage" state={{ idTournament }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Equipo
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchTeams}
                  disabled={loading}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Actualizar"
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-8">
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
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg h-12 pl-10 pr-4"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Mostrando {filteredTeams.length} de {teams.length} equipos
                </p>
              )}
            </div>

            {/* Teams Table/List */}
            {loading ? (
              <LoadingSkeleton />
            ) : filteredTeams.length > 0 ? (
              <div className="space-y-4">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                      {/* Team Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 
                              className="font-semibold text-lg text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                              onClick={() => handleViewTeamDetails(team.id!)}
                            >
                              {team.name}
                            </h3>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">ID:</span> #{team.id}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{team.category}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              <span className="font-medium">Entrenador:</span> {team.coach}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              <span className="font-medium">Cancha:</span> {team.mainField}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Players List */}
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center justify-between">
                          <span>Jugadores ({team.players.length})</span>
                          {team.players.length === 0 && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              Sin jugadores cargados
                            </span>
                          )}
                        </h4>
                        {team.players.length > 0 ? (
                          <div className="max-h-32 overflow-y-auto pr-2">
                            <ul className="space-y-1 text-sm">
                              {team.players.slice(0, 8).map((player) => (
                                <li key={player.id} className="text-gray-700 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      player.role === "Titular" ? "bg-green-500" : "bg-blue-500"
                                    }`}></div>
                                    <span className="font-medium">{player.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {player.dorsalNumber > 0 && (
                                      <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        #{player.dorsalNumber}
                                      </span>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      player.status === "Activo" 
                                        ? "bg-green-100 text-green-800" 
                                        : player.status === "Suspendido"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {player.status.charAt(0)}
                                    </span>
                                  </div>
                                </li>
                              ))}
                              {team.players.length > 8 && (
                                <li className="text-gray-500 text-xs italic">
                                  +{team.players.length - 8} jugadores más...
                                </li>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400">
                            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No hay jugadores registrados</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-blue-600 hover:text-blue-700"
                              onClick={() => handleViewTeamDetails(team.id!)}
                            >
                              Agregar jugadores
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-600 hover:text-white transition-colors flex-1"
                        onClick={() => openEditModal(team)}
                        disabled={!team.id}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-600 hover:text-white transition-colors flex-1"
                        onClick={() => handleDeleteTeam(team.id!)}
                        disabled={!team.id || deletingTeamId === team.id}
                      >
                        {deletingTeamId === team.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        {deletingTeamId === team.id ? "Eliminando..." : "Eliminar"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-100 transition-colors flex-1"
                        onClick={() => handleViewTeamDetails(team.id!)}
                        disabled={!team.id}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aún no hay equipos registrados
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Cuando se registren equipos en el torneo, aparecerán aquí para que puedas consultarlos.
                </p>
                <Link to="/teams-manage" state={{ idTournament }}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar primer equipo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron equipos
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  No hay equipos que coincidan con "{searchTerm}". Intenta con otros términos de búsqueda.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edición */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Editar Equipo {selectedTeam?.name && `"${selectedTeam.name}"`}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="teamName" className="text-sm font-medium">
                  Nombre del equipo *
                </Label>
                <Input
                  id="teamName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Ej: Los Leones FC"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="coach" className="text-sm font-medium">
                  Entrenador *
                </Label>
                <Input
                  id="coach"
                  value={editedCoach}
                  onChange={(e) => setEditedCoach(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1"
                />
              </div>
              {selectedTeam && (
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                  <p><strong>ID:</strong> {selectedTeam.id}</p>
                  <p><strong>Categoría:</strong> {selectedTeam.category}</p>
                  <p><strong>Cancha principal:</strong> {selectedTeam.mainField}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={!editedName.trim() || !editedCoach.trim() || updatingTeamId === selectedTeam?.id}
                className="flex-1"
              >
                {updatingTeamId === selectedTeam?.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Sistema de Gestión de Torneos de Fútbol v1.0</p>
          <p className="mt-1">Torneo ID: {idTournament || "No identificado"}</p>
        </div>
      </div>
    </div>
  );
}