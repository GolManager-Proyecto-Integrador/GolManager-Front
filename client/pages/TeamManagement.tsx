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
import { ArrowLeft, Edit3, Users, MapPin, User, Save } from "lucide-react";

// 🔹 Importar servicio actualizado
import {
  getTeamDetails,
  updateTeamDetails,
  updatePlayerDetails,
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
  const { idTournament, teamId } = useParams<{
    idTournament: string;
    teamId: string;
  }>();

  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  // 🔹 Cargar datos del backend
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!idTournament || !teamId) return;
        const data = await getTeamDetails(idTournament, teamId);
        setTeam(data);
        setPlayers(data.players || []);
      } catch (error) {
        console.error("Error al cargar los detalles del equipo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [idTournament, teamId]);

  // 🔹 Actualizar rol del jugador - guarda inmediatamente
  const handlePlayerRoleChange = async (playerId: string, newRole: string) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player || !idTournament || !teamId) return;

      const updatedPlayer = { ...player, role: newRole as "Titular" | "Suplente" };
      
      // ✅ Guardar inmediatamente en el backend
      const savedPlayer = await updatePlayerDetails(idTournament, teamId, updatedPlayer);
      
      // ✅ Actualizar estado local con la respuesta del backend
      setPlayers(prev =>
        prev.map(p => p.id === playerId ? savedPlayer : p)
      );
      
      setSaveMessage("Rol actualizado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar rol del jugador:", error);
      setSaveMessage("Error al actualizar el rol");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // 🔹 Actualizar estado del jugador - guarda inmediatamente
  const handlePlayerStatusChange = async (playerId: string, newStatus: string) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player || !idTournament || !teamId) return;

      const updatedPlayer = { 
        ...player, 
        status: newStatus as Player["status"] 
      };
      
      // ✅ Guardar inmediatamente en el backend
      const savedPlayer = await updatePlayerDetails(idTournament, teamId, updatedPlayer);
      
      // ✅ Actualizar estado local
      setPlayers(prev =>
        prev.map(p => p.id === playerId ? savedPlayer : p)
      );
      
      setSaveMessage("Estado actualizado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar estado del jugador:", error);
      setSaveMessage("Error al actualizar el estado");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // 🔹 Actualizar datos del equipo (sin jugadores)
  const handleEditTeam = async () => {
    if (!idTournament || !teamId || !team) return;
    
    setSaving(true);
    try {
      const updated = await updateTeamDetails(idTournament, teamId, team);
      setTeam(updated);
      setSaveMessage("Datos del equipo actualizados correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error al actualizar el equipo:", error);
      setSaveMessage("Error al actualizar los datos del equipo");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToTournament = () => {
    if (!idTournament) return;
    navigate(`/tournament/${idTournament}/teams-manage`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando equipo...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No se encontró el equipo</h2>
          <Button onClick={handleBackToTournament}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a equipos
          </Button>
        </div>
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
                onClick={handleBackToTournament}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a equipos
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {team.name}
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
        {/* Mensaje de guardado */}
        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.includes("Error") 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Team Information Card */}
        <Card className="bg-white shadow-lg border-0 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Users className="w-5 h-5 mr-3 text-primary" />
              Información del Equipo
            </CardTitle>
            <Button
              onClick={handleEditTeam}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
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
                        {players.filter(p => p.role === "Titular").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Activos:</span>
                      <span className="font-semibold ml-1">
                        {players.filter(p => p.status === "Activo").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-800">Suspendidos:</span>
                      <span className="font-semibold ml-1">
                        {players.filter(p => p.status === "Suspendido").length}
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
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No hay jugadores registrados</p>
                <p className="text-gray-400 text-sm">Los jugadores aparecerán aquí cuando sean agregados al sistema</p>
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
                              value={player.role}
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
                              value={player.status}
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
                    Información sobre las actualizaciones
                  </h4>
                  <p className="text-sm text-gray-600">
                    • Los cambios en "Titular/Suplente" y "Estado" se guardan automáticamente<br/>
                    • Los valores de goles y tarjetas son de solo lectura<br/>
                    • No es posible agregar o eliminar jugadores en esta vista
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
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al torneo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}