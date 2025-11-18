import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Settings, Info, Users, Zap } from "lucide-react";
import { generarLlavesEnfrentamientos } from "@/services/matchGeneratorService";

interface MatchGenerated {
  id: string;
  fecha: string;
  hora: string;
  equipo1: string;
  equipo2: string;
  fase?: string;
}

export default function GeneracionAutomatica() {
  const [generacionActiva, setGeneracionActiva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<"liga" | "eliminacion" | "repechaje">("liga");
  const [partidosBackend, setPartidosBackend] = useState<MatchGenerated[] | null>(null);

  // ============================
  // MAPPER BACKEND → MATCHGENERATED
  // ============================
  const mapBackendMatches = (matches: any[]): MatchGenerated[] => {
    return matches.map((m) => {
      const fechaCompleta = new Date(m.matchDateTime);
      const fecha = fechaCompleta.toISOString().split("T")[0];
      const hora = fechaCompleta.toTimeString().substring(0, 5);

      return {
        id: String(m.idMatch),
        fecha,
        hora,
        equipo1: m.homeTeam,
        equipo2: m.awayTeam,
        fase: m.round || undefined,
      };
    });
  };

  // ============================
  // LLAMADA AL BACKEND
  // ============================
  const generarCalendario = async () => {
    try {
      setLoading(true);
      setGeneracionActiva(true);

      const tournamentId = 1; // <-- Reemplaza con ID real

      const data = await generarLlavesEnfrentamientos(tournamentId);

      const partidosMapeados = mapBackendMatches(data);
      setPartidosBackend(partidosMapeados);
    } catch (error) {
      console.error("Error generando partidos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // OBTENER LISTA DE PARTIDOS
  // ============================
  const obtenerPartidosPorFormato = () => {
    if (partidosBackend) {
      return partidosBackend;
    }
    return [];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Programación Automática de Partidos
            </h1>
          </div>
          <p className="text-gray-600">Genera automáticamente el calendario de tu torneo</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Generación Automática
              </CardTitle>
              <Link to="/calendario">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendario
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Generate Button Section */}
            <div className="text-center mb-8">
              <Button
                onClick={generarCalendario}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-auto flex items-center gap-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                {loading ? "Generando..." : "Generar calendario automático"}
              </Button>
              
              {generacionActiva && !loading && partidosBackend && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    Calendario generado exitosamente
                  </div>
                </div>
              )}
            </div>

            {/* SPINNER GRANDE MIENTRAS LLEGA EL BACKEND */}
            {generacionActiva && loading && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-blue-700 font-medium">Generando partidos...</p>
              </div>
            )}

            {/* Generated Calendar */}
            {generacionActiva && !loading && partidosBackend && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Calendario Generado</h3>

                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
                  <div className="text-sm font-semibold text-gray-700">Fecha</div>
                  <div className="text-sm font-semibold text-gray-700">Hora</div>
                  <div className="text-sm font-semibold text-gray-700">Equipo 1</div>
                  <div className="text-sm font-semibold text-gray-700">Equipo 2</div>
                </div>

                {/* Matches Rows */}
                {obtenerPartidosPorFormato().map((partido) => (
                  <div key={partido.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                    {partido.fase && (
                      <div className="mb-2">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          {partido.fase}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(partido.fecha)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(partido.fecha).toLocaleDateString("es-ES")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{partido.hora}</span>
                      </div>

                      <div className="text-center md:text-left">
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                          {partido.equipo1}
                        </div>
                      </div>

                      <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <span className="text-gray-500 font-medium">VS</span>
                          <div className="font-semibold text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                            {partido.equipo2}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Message */}
            <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Información del Sistema</h4>
                  <p className="text-gray-700 text-sm">
                    El sistema genera automáticamente el formato de torneo según el número de equipos inscritos. 
                    Los horarios y fechas se asignan optimizando la disponibilidad de campos y evitando conflictos.
                  </p>
                </div>
              </div>
            </div>
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

