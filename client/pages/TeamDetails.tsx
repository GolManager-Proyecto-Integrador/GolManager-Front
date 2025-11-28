import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit3, Users, MapPin, User, Home, AlertCircle, Save, Loader2 } from "lucide-react";

// Importar servicio ACTUALIZADO con las nuevas funciones
import {
  getTeamDetails,
  getTeamDetailsRobust,
  getTournamentTeams,
  updateTeamDetails,
  updateTeamPlayers,
  saveAllTeamChanges,
  Team,
  Player,
} from "@/services/teamDetailsService";

const roles = ["Titular", "Suplente"];
const statuses = ["Activo", "Suspendido", "Lesionado"];

const getStatusColor = (status?: Player["status"]) => {
  switch (status) {
    case "Activo":
      return "text-green-700 bg-green-50 border-green-200";
    case "Suspendido":
      return "text-red-700 bg-red-50 border-red-200";
    case "Lesionado":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

export default function TeamDetails() {
  useEffect(() => {
    document.title = `Detalles del Equipo`;
  }, []);

  // Ahora obtenemos ambos ids desde la URL
  const { idTournament, teamId } = useParams<{
    idTournament: string;
    teamId: string;
  }>();

  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Cargar datos del backend - VERSIÓN CORREGIDA
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!idTournament || !teamId) {
          setError("Faltan parámetros en la URL");
          setLoading(false);
          return;
        }
        
        setError(null);
        setLoading(true);
        console.log(`🔍 Intentando cargar equipo ${teamId} del torneo ${idTournament}`);
        
        // PRIMERO: Listar equipos disponibles para debug y mostrar opciones
        try {
          const teams = await getTournamentTeams(idTournament);
          setAvailableTeams(teams);
          console.log('📋 Equipos disponibles en torneo:', teams);
        } catch (teamsError) {
          console.log('⚠️ No se pudieron cargar los equipos disponibles:', teamsError);
        }

        // INTENTAR MÉTODO ROBUSTO PRIMERO
        try {
          console.log('🔄 Intentando método robusto...');
          const data = await getTeamDetailsRobust(idTournament, teamId);
          setTeam(data);
          setPlayers(data.players || []);
          console.log('✅ Equipo cargado exitosamente con método robusto');
          return;
        } catch (robustError: any) {
          console.log('❌ Método robusto falló:', robustError.message);
          
          // INTENTAR MÉTODO NORMAL COMO FALLBACK
          try {
            console.log('🔄 Intentando método normal...');
            const data = await getTeamDetails(idTournament, teamId);
            setTeam(data);
            setPlayers(data.players || []);
            console.log('✅ Equipo cargado exitosamente con método normal');
          } catch (normalError: any) {
            // AMBOS MÉTODOS FALLARON - MANEJO DE ERROR ESPECÍFICO
            console.log('❌ Ambos métodos fallaron:', normalError.message);
            
            if (normalError.message.includes('EQUIPO_NO_ENCONTRADO') || 
                robustError.message.includes('no encontrado') ||
                normalError.message.includes('No se encontró')) {
              
              const availableIds = availableTeams.map(t => t.teamId || t.id).join(', ');
              const availableTeamNames = availableTeams.map(t => `${t.name} (ID: ${t.teamId || t.id})`).join(', ');
              
              setError(`El equipo con ID "${teamId}" no existe en el torneo ${idTournament}. 
                Equipos disponibles: ${availableTeamNames || availableIds}`);
              
            } else if (normalError.response?.status === 401 || robustError.response?.status === 401) {
              setError('No tienes permisos para ver este equipo. Contacta al administrador.');
            } else {
              setError('Error al cargar los detalles del equipo. Por favor, intenta nuevamente.');
            }
          }
        }
        
      } catch (finalError: any) {
        console.error("Error inesperado:", finalError);
        setError('Error inesperado al cargar el equipo: ' + (finalError.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [idTournament, teamId]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handlePlayerRoleChange = (playerId: string, newRole: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, role: newRole as any } : player
      )
    );
  };

  const handlePlayerStatusChange = (playerId: string, newStatus: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId
          ? { ...player, status: newStatus as Player["status"] }
          : player
      )
    );
  };

  // 🔹 FUNCIÓN CORREGIDA: Guarda tanto el equipo como los jugadores
  const handleSaveChanges = async () => {
    if (!idTournament || !teamId || !team) return;
    
    try {
      setSaving(true);
      setSaveMessage(null);
      
      console.log('💾 Iniciando guardado de cambios...');
      
      // Opción 1: Usar la función completa que guarda todo
      const result = await saveAllTeamChanges(idTournament, teamId, team, players);
      
      // Actualizar estado con los datos frescos del backend
      setTeam(result.team);
      setPlayers(result.players);
      
      console.log("✅ Todos los cambios guardados exitosamente");
      setSaveMessage({ 
        type: 'success', 
        message: 'Todos los cambios se guardaron correctamente' 
      });
      
    } catch (error) {
      console.error("❌ Error al guardar los cambios:", error);
      setSaveMessage({ 
        type: 'error', 
        message: 'Error al guardar los cambios. Por favor, intenta nuevamente.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // 🔹 FUNCIÓN ALTERNATIVA: Guardar por separado
  const handleSaveChangesSeparate = async () => {
    if (!idTournament || !teamId || !team) return;
    
    try {
      setSaving(true);
      setSaveMessage(null);
      
      console.log('💾 Guardando cambios por separado...');
      
      // 1. Guardar datos del equipo
      const updatedTeam = await updateTeamDetails(idTournament, teamId, {
        ...team,
        players,
      });
      
      // 2. Guardar jugadores
      const updatedPlayers = await updateTeamPlayers(idTournament, teamId, players);
      
      // Actualizar estado
      setTeam(updatedTeam);
      setPlayers(updatedPlayers);
      
      console.log("✅ Todos los cambios guardados exitosamente");
      setSaveMessage({ 
        type: 'success', 
        message: 'Todos los cambios se guardaron correctamente' 
      });
      
    } catch (error) {
      console.error("❌ Error al guardar los cambios:", error);
      setSaveMessage({ 
        type: 'error', 
        message: 'Error al guardar los cambios. Por favor, intenta nuevamente.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // 🔹 FUNCIÓN SIMPLE: Recargar página después de guardar
  const handleSaveAndReload = async () => {
    if (!idTournament || !teamId || !team) return;
    
    try {
      setSaving(true);
      
      // Guardar todo
      await saveAllTeamChanges(idTournament, teamId, team, players);
      
      console.log("✅ Cambios guardados, recargando página...");
      
      // Recargar la página para ver los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("❌ Error al guardar los cambios:", error);
      setSaveMessage({ 
        type: 'error', 
        message: 'Error al guardar los cambios. Por favor, intenta nuevamente.' 
      });
      setSaving(false);
    }
  };

  const handleBackToTournament = () => {
    if (!idTournament) return;
    navigate(`/tournament/${idTournament}/teams-manage`);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Recargar la página es la forma más simple de reintentar
    window.location.reload();
  };

  // ESTADOS DE CARGA Y ERROR - MEJORADOS
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del equipo...</p>
          <p className="text-sm text-gray-500 mt-2">
            Torneo: {idTournament} • Equipo: {teamId}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Error al cargar el equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 whitespace-pre-line">{error}</p>
            
            {availableTeams.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  📋 Equipos disponibles en el torneo {idTournament}:
                </p>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="text-sm text-gray-600 space-y-1">
                    {availableTeams.map(team => (
                      <li key={team.teamId || team.id} className="flex justify-between">
                        <span>• {team.name}</span>
                        <span className="text-gray-500">ID: {team.teamId || team.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="flex-1"
              >
                Reintentar
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Volver atrás
              </Button>
              {idTournament && (
                <Button 
                  onClick={() => navigate(`/tournament/${idTournament}/teams-manage`)}
                  className="flex-1"
                >
                  Ver todos los equipos
                </Button>
              )}
              <Button 
                onClick={() => navigate('/dashboard-organizador')}
                variant="secondary"
                className="flex-1"
              >
                Ir al dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-gray-600">Equipo no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">No se pudo cargar la información del equipo.</p>
            <Button onClick={handleBackToTournament} className="w-full">
              Volver a la lista de equipos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDERIZADO NORMAL - EQUIPO CARGADO EXITOSAMENTE
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
                onClick={handleBackToTournament}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard-organizador')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al panel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {team.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Torneo {idTournament} • {players.length} jugadores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Mensaje de guardado */}
        {saveMessage && (
          <div className={`p-4 rounded-lg border ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <Save className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="font-medium">{saveMessage.message}</span>
            </div>
          </div>
        )}

        {/* Team Information Card */}
        <Card className="bg-white shadow-lg border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Users className="w-5 h-5 mr-3 text-primary" />
              Información del Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre del Equipo
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {team.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Director Técnico
                  </label>
                  <div className="flex items-center mt-1">
                    <User className="w-4 h-4 mr-2 text-primary" />
                    <p className="text-lg font-semibold text-gray-900">
                      {team.coach}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Categoría
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {team.category}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cancha Local Principal
                  </label>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <p className="text-lg font-semibold text-gray-900">
                      {team.mainField}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cancha Secundaria
                  </label>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">
                      {team.secondaryField || "No registrada"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Estadísticas del Equipo
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-800">Total Jugadores:</span>
                      <span className="font-semibold ml-1">
                        {players.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Titulares:</span>
                      <span className="font-semibold ml-1">
                        {players.filter((p) => p.role === "Titular").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Activos:</span>
                      <span className="font-semibold ml-1">
                        {players.filter((p) => p.status === "Activo").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Suspendidos:</span>
                      <span className="font-semibold ml-1">
                        {players.filter((p) => p.status === "Suspendido").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Section */}
        <Card className="bg-white shadow-lg border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Users className="w-5 h-5 mr-3 text-primary" />
              Jugadores Registrados ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay jugadores registrados en este equipo</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre del Jugador</TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead>Titular/Suplente</TableHead>
                        <TableHead className="text-center">Dorsal</TableHead>
                        <TableHead className="text-center">Goles</TableHead>
                        <TableHead className="text-center">🟨</TableHead>
                        <TableHead className="text-center">🟥</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.map((player, index) => (
                        <TableRow
                          key={player.id}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <TableCell className="font-medium">
                            {player.name}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {player.position}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={player.role || "Titular"}
                              onValueChange={(value) =>
                                handlePlayerRoleChange(player.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                              {player.dorsalNumber}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-green-600">
                              {player.goals ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-yellow-600">
                              {player.yellowCards ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-red-600">
                              {player.redCards ?? 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={player.status || "Activo"}
                              onValueChange={(value) =>
                                handlePlayerStatusChange(player.id, value)
                              }
                            >
                              <SelectTrigger
                                className={`w-32 ${getStatusColor(player.status)}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Nota sobre las estadísticas
                  </h4>
                  <p className="text-sm text-gray-600">
                    Los valores de goles y tarjetas se actualizan automáticamente
                    desde los registros de partidos. Solo los campos
                    "Titular/Suplente" y "Estado" son editables por el organizador.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBackToTournament}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                disabled={saving}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al torneo
              </Button>
              
              {/* Botón principal para guardar cambios */}
              <Button
                size="lg"
                onClick={handleSaveChanges} // Usar la función corregida
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                style={{ backgroundColor: "#2563eb" }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>

              {/* Botón alternativo para recargar después de guardar */}
              {/* <Button
                size="lg"
                onClick={handleSaveAndReload}
                disabled={saving}
                variant="secondary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar y recargar
                  </>
                )}
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}