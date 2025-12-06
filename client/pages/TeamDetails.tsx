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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Edit3, Users, MapPin, User, CheckCircle, XCircle } from "lucide-react";

// 🔹 Importar servicio
import {
  getTeamDetails,
  updateTeamDetails,
  updatePlayerDetails,
  Team,
  Player,
} from "@/services/teamDetService";

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
  const { idTournament, teamId } = useParams<{
    idTournament: string;
    teamId: string;
  }>();

  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [changedPlayers, setChangedPlayers] = useState<Set<string>>(new Set());

  // 🔹 Cargar datos del backend
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!idTournament || !teamId) return;
        const data = await getTeamDetails(idTournament, teamId);
        setTeam(data);
        setPlayers(data.players || []);
        setChangedPlayers(new Set()); // Resetear cambios al cargar
      } catch (error) {
        console.error("Error al cargar los detalles del equipo:", error);
        setMessage({ type: 'error', text: 'Error al cargar los datos del equipo' });
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [idTournament, teamId]);

  const handlePlayerRoleChange = (playerId: string, newRole: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, role: newRole as any } : player
      )
    );
    // Marcar jugador como modificado
    setChangedPlayers(prev => new Set(prev).add(playerId));
  };

  const handlePlayerStatusChange = (playerId: string, newStatus: string) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId
          ? { ...player, status: newStatus as Player["status"] }
          : player
      )
    );
    // Marcar jugador como modificado
    setChangedPlayers(prev => new Set(prev).add(playerId));
  };

  const handleEditTeam = async () => {
    if (!idTournament || !teamId || !team) {
      setMessage({ type: 'error', text: 'Datos incompletos para guardar' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      // 🔹 PASO 1: Actualizar jugadores modificados individualmente
      if (changedPlayers.size > 0) {
        console.log(`🔄 Actualizando ${changedPlayers.size} jugador(es) modificado(s)...`);
        
        for (const playerId of changedPlayers) {
          const player = players.find(p => p.id === playerId);
          if (player) {
            try {
              await updatePlayerDetails(idTournament, teamId, player);
              successCount++;
              console.log(`✅ Jugador "${player.name}" actualizado`);
            } catch (error) {
              errorCount++;
              console.error(`❌ Error actualizando jugador "${player.name}":`, error);
            }
          }
        }
      }

      // 🔹 PASO 2: Actualizar datos generales del equipo (si hay cambios)
      if (team) {
        try {
          const updatedTeam = await updateTeamDetails(idTournament, teamId, {
            ...team,
            players // Incluir jugadores actualizados
          });
          setTeam(updatedTeam);
          successCount++;
          console.log('✅ Datos del equipo actualizados');
        } catch (error) {
          errorCount++;
          console.error('❌ Error actualizando datos del equipo:', error);
        }
      }

      // 🔹 PASO 3: Mostrar mensaje de resultado
      if (successCount > 0 && errorCount === 0) {
        setMessage({ 
          type: 'success', 
          text: `¡Cambios guardados exitosamente! (${successCount} actualización${successCount > 1 ? 'es' : ''})` 
        });
        // Limpiar lista de jugadores modificados
        setChangedPlayers(new Set());
        
        // Recargar datos para verificar cambios
        setTimeout(() => {
          const fetchUpdatedData = async () => {
            try {
              const data = await getTeamDetails(idTournament, teamId);
              setPlayers(data.players || []);
            } catch (error) {
              console.error('Error recargando datos:', error);
            }
          };
          fetchUpdatedData();
        }, 1000);
        
      } else if (errorCount > 0) {
        setMessage({ 
          type: 'error', 
          text: `Se guardaron ${successCount} cambios, pero hubo ${errorCount} error(es)` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'No se detectaron cambios para guardar' 
        });
      }

    } catch (error) {
      console.error("Error general al guardar cambios:", error);
      setMessage({ type: 'error', text: 'Error al guardar los cambios. Intente nuevamente.' });
    } finally {
      setSaving(false);
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  const handleBackToTournament = () => {
    if (!idTournament) return;
    navigate(`/tournament/${idTournament}/teams-manage`);
  };

  // 🔹 Verificar si hay cambios pendientes
  const hasUnsavedChanges = changedPlayers.size > 0;

  if (loading) {
    return <div className="p-6 text-center">Cargando equipo...</div>;
  }

  if (!team) {
    return <div className="p-6 text-center">No se encontró el equipo</div>;
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
                onClick={handleBackToTournament}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard-organizador")}
                className="text-gray-600 hover:text-gray-900 border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al panel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Detalles del Equipo
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Información general y jugadores registrados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Mensaje de estado */}
        {message && (
          <Alert className={message.type === 'success' 
            ? "border-green-200 bg-green-50" 
            : message.type === 'error' 
            ? "border-red-200 bg-red-50" 
            : "border-blue-200 bg-blue-50"
          }>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : message.type === 'error' ? (
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
              ) : (
                <Users className="w-5 h-5 mr-2 text-blue-600" />
              )}
              <AlertDescription className={
                message.type === 'success' 
                  ? "text-green-700" 
                  : message.type === 'error' 
                  ? "text-red-700" 
                  : "text-blue-700"
              }>
                {message.text}
                {hasUnsavedChanges && message.type === 'success' && (
                  <div className="text-sm mt-1 text-green-600">
                    Los cambios se verán reflejados al recargar la página.
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
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
                        {players.filter((p: any) => p.role === "Titular").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Activos:</span>
                      <span className="font-semibold ml-1">
                        {
                          players.filter(
                            (p: any) => p.status === "Activo"
                          ).length
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Suspendidos:</span>
                      <span className="font-semibold ml-1">
                        {
                          players.filter(
                            (p: any) => p.status === "Suspendido"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                  {hasUnsavedChanges && (
                    <div className="mt-2 text-sm text-yellow-600 font-medium">
                      ⚠️ Tienes {changedPlayers.size} cambio(s) pendiente(s) por guardar
                    </div>
                  )}
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
              Jugadores Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {player.name}
                          {changedPlayers.has(player.id) && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Sin guardar
                            </span>
                          )}
                        </div>
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
                          <SelectTrigger className={`w-32 ${changedPlayers.has(player.id) ? 'border-yellow-400' : ''}`}>
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
                            className={`w-32 ${getStatusColor(player.status)} ${changedPlayers.has(player.id) ? 'border-yellow-400' : ''}`}
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
              {hasUnsavedChanges && (
                <div className="mt-3 text-sm text-yellow-700 font-medium p-2 bg-yellow-50 rounded border border-yellow-200">
                  💡 Recuerda hacer clic en "Guardar cambios" para aplicar las modificaciones al servidor.
                </div>
              )}
            </div>
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
              <Button
                size="lg"
                onClick={handleEditTeam}
                disabled={saving || !hasUnsavedChanges}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    {hasUnsavedChanges ? `Guardar cambios (${changedPlayers.size})` : 'Guardar cambios'}
                  </>
                )}
              </Button>
            </div>
            {hasUnsavedChanges && !saving && (
              <div className="mt-3 text-sm text-gray-500 text-center">
                Tienes {changedPlayers.size} cambio(s) pendiente(s) por guardar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}