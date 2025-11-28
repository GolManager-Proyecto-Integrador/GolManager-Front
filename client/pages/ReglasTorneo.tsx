import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Edit3, ClipboardList, RotateCcw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";


import tournamentService, { TournamentData } from "@/services/gesdettournamentService";



export default function ReglasTorneo() {

  useEffect(() => {
  document.title = `Reglas del Torneo`;
}, );

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [suspendedPlayers, setSuspendedPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    format: "",
    homeAndAway: false,
    yellowCardsSuspension: 3,
  });

  // Cargar datos del torneo y jugadores suspendidos
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const [tournamentData, suspendedData] = await Promise.all([
          tournamentService.getTournament(id),
          tournamentService.getSuspendedPlayers(id),
        ]);

        setTournament(tournamentData);
        setSuspendedPlayers(suspendedData);

        setForm({
          format: tournamentData.format,
          homeAndAway: tournamentData.homeAndAway,
          yellowCardsSuspension: tournamentData.yellowCardsSuspension,
        });
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEditFormat = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleBack = () => navigate(-1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (checked: boolean) => {
    setForm({ ...form, homeAndAway: checked });
  };

  const handleSave = () => {
    alert("⚙️ Función de actualización aún no implementada.");
    setOpenModal(false);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Cargando reglas del torneo...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-10 text-red-500">No se encontró el torneo.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/dashboard-organizador"
            className="flex items-center text-gray-600 hover:text-gray-900 gap-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reglas del Torneo</h1>
        </div>
      </div>


      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {tournament.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* FORMATO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Formato del torneo</h4>
                  <p className="text-gray-700">{tournament.format}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Ida y vuelta</h4>
                  <p className="text-gray-700">{tournament.homeAndAway ? "Sí" : "No"}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Regla de suspensión</h4>
                  <p className="text-gray-700">
                    {tournament.yellowCardsSuspension} tarjetas amarillas = suspensión
                  </p>
                </div>
              </div>
            </div>

            {/* ⚠️ ALERTA DINÁMICA DE SUSPENSIÓN */}
            {suspendedPlayers.length > 0 ? (
              <Alert className="bg-yellow-50 border-yellow-200 mt-4">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 font-medium">
                  {suspendedPlayers.length === 1 ? (
                    <>
                      ⚠️ El jugador <b>{suspendedPlayers[0].name}</b> ha alcanzado el límite de tarjetas
                      y está suspendido para el próximo partido.
                    </>
                  ) : (
                    <>
                      ⚠️ Los siguientes jugadores están suspendidos:
                      <ul className="mt-2 list-disc list-inside text-yellow-700 text-sm">
                        {suspendedPlayers.map((p) => (
                          <li key={p.id}>
                            <b>{p.name}</b> — {p.team} ({p.numYellowCards} amarillas)
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-200 mt-4">
                <AlertDescription className="text-green-800">
                  ✅ No hay jugadores suspendidos actualmente.
                </AlertDescription>
              </Alert>
            )}

            {/* ℹ️ INFORMACIÓN ADICIONAL */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-1">Información adicional</h3>
              <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                <li>Las tarjetas se acumulan durante todo el torneo.</li>
                <li>Una tarjeta roja equivale a suspensión inmediata.</li>
                <li>Las suspensiones no se transfieren entre torneos.</li>
              </ul>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button onClick={handleBack} variant="outline">
                ← Volver al torneo
              </Button>
              <Button onClick={handleEditFormat} className="bg-blue-600 text-white hover:bg-blue-700">
                <Edit3 className="w-4 h-4 mr-2" />
                Editar reglas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* REGLAS ADICIONALES */}
        <Card className="bg-white shadow-sm border-0 rounded-xl mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <RotateCcw className="w-5 h-5 mr-3 text-primary" />
              Criterios Generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>• Victoria: 3 puntos</li>
              <li>• Empate: 1 punto</li>
              <li>• Derrota: 0 puntos</li>
              <li>• Desempate: diferencia de goles, goles a favor.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 🧩 MODAL PARA EDITAR */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Reglas del Torneo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="format">Formato</Label>
              <Input
                id="format"
                name="format"
                value={form.format}
                onChange={handleChange}
                placeholder="Ej: Liga todos contra todos"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="homeAndAway">Ida y vuelta</Label>
              <Switch
                id="homeAndAway"
                checked={form.homeAndAway}
                onCheckedChange={handleToggle}
              />
            </div>

            <div>
              <Label htmlFor="yellowCardsSuspension">Tarjetas amarillas para suspensión</Label>
              <Input
                type="number"
                id="yellowCardsSuspension"
                name="yellowCardsSuspension"
                value={form.yellowCardsSuspension}
                onChange={handleChange}
                min={1}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
