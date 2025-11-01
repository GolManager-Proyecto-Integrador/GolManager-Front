import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Settings, Info, Users, Zap } from "lucide-react";

interface MatchGenerated {
  id: string;
  fecha: string;
  hora: string;
  equipo1: string;
  equipo2: string;
  fase?: string;
}

// Datos de ejemplo para los diferentes formatos
const equiposEjemplo = [
  "Los Tigres FC", "Águilas Doradas", "Leones del Norte", "Cougars United",
  "Dragones FC", "Panteras Negras", "Halcones Rojos", "Lobos Grises"
];

const partidosLiga: MatchGenerated[] = [
  { id: "1", fecha: "2024-01-15", hora: "15:00", equipo1: "Los Tigres FC", equipo2: "Águilas Doradas" },
  { id: "2", fecha: "2024-01-15", hora: "17:30", equipo1: "Leones del Norte", equipo2: "Cougars United" },
  { id: "3", fecha: "2024-01-16", hora: "14:00", equipo1: "Dragones FC", equipo2: "Panteras Negras" },
  { id: "4", fecha: "2024-01-16", hora: "16:30", equipo1: "Halcones Rojos", equipo2: "Lobos Grises" },
  { id: "5", fecha: "2024-01-17", hora: "15:30", equipo1: "Los Tigres FC", equipo2: "Leones del Norte" },
  { id: "6", fecha: "2024-01-17", hora: "18:00", equipo1: "Águilas Doradas", equipo2: "Cougars United" }
];

const partidosEliminacion: MatchGenerated[] = [
  { id: "1", fecha: "2024-01-20", hora: "15:00", equipo1: "Los Tigres FC", equipo2: "Águilas Doradas", fase: "Cuartos de Final" },
  { id: "2", fecha: "2024-01-20", hora: "17:30", equipo1: "Leones del Norte", equipo2: "Cougars United", fase: "Cuartos de Final" },
  { id: "3", fecha: "2024-01-21", hora: "15:00", equipo1: "Dragones FC", equipo2: "Panteras Negras", fase: "Cuartos de Final" },
  { id: "4", fecha: "2024-01-21", hora: "17:30", equipo1: "Halcones Rojos", equipo2: "Lobos Grises", fase: "Cuartos de Final" },
  { id: "5", fecha: "2024-01-25", hora: "16:00", equipo1: "Ganador 1", equipo2: "Ganador 2", fase: "Semifinal" },
  { id: "6", fecha: "2024-01-25", hora: "18:30", equipo1: "Ganador 3", equipo2: "Ganador 4", fase: "Semifinal" },
  { id: "7", fecha: "2024-01-28", hora: "17:00", equipo1: "Finalista 1", equipo2: "Finalista 2", fase: "Final" }
];

const partidosRepechaje: MatchGenerated[] = [
  { id: "1", fecha: "2024-01-18", hora: "14:00", equipo1: "Tercer lugar Grupo A", equipo2: "Segundo lugar Grupo B", fase: "Repechaje" },
  { id: "2", fecha: "2024-01-18", hora: "16:30", equipo1: "Tercer lugar Grupo B", equipo2: "Segundo lugar Grupo A", fase: "Repechaje" }
];

export default function GeneracionAutomatica() {
  const [generacionActiva, setGeneracionActiva] = useState(false);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<"liga" | "eliminacion" | "repechaje">("liga");

  const generarCalendario = () => {
    setGeneracionActiva(true);
    // Simular proceso de generación
    setTimeout(() => {
      // La generación se mantiene activa para mostrar resultados
    }, 1000);
  };

  const obtenerPartidosPorFormato = () => {
    switch (formatoSeleccionado) {
      case "liga":
        return partidosLiga;
      case "eliminacion":
        return partidosEliminacion;
      case "repechaje":
        return [...partidosLiga.slice(0, 3), ...partidosRepechaje];
      default:
        return partidosLiga;
    }
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
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-auto"
              >
                <Zap className="w-5 h-5 mr-2" />
                Generar calendario automático
              </Button>
              
              {generacionActiva && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    Calendario generado exitosamente
                  </div>
                </div>
              )}
            </div>

            {/* Format Selection */}
            {generacionActiva && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Formato del Torneo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={formatoSeleccionado === "liga" ? "default" : "outline"}
                    onClick={() => setFormatoSeleccionado("liga")}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Users className="w-6 h-6" />
                    <span className="font-medium">Liga</span>
                    <span className="text-xs opacity-70">Todos contra todos</span>
                  </Button>
                  
                  <Button
                    variant={formatoSeleccionado === "eliminacion" ? "default" : "outline"}
                    onClick={() => setFormatoSeleccionado("eliminacion")}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Trophy className="w-6 h-6" />
                    <span className="font-medium">Eliminación Directa</span>
                    <span className="text-xs opacity-70">Cuartos, semis y final</span>
                  </Button>
                  
                  <Button
                    variant={formatoSeleccionado === "repechaje" ? "default" : "outline"}
                    onClick={() => setFormatoSeleccionado("repechaje")}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="font-medium">Con Repechaje</span>
                    <span className="text-xs opacity-70">Incluye partidos adicionales</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Format Description */}
            {generacionActiva && (
              <div className="mb-8">
                {formatoSeleccionado === "liga" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Formato Liga - Todos contra todos</h4>
                    <p className="text-blue-800 text-sm">
                      Cada equipo se enfrentará una vez contra todos los demás equipos. 
                      Se generan {equiposEjemplo.length * (equiposEjemplo.length - 1) / 2} partidos en total.
                    </p>
                  </div>
                )}
                
                {formatoSeleccionado === "eliminacion" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Formato Eliminación Directa</h4>
                    <p className="text-green-800 text-sm">
                      Sistema de llaves con cuartos de final, semifinales y final. 
                      Los equipos perdedores son eliminados del torneo.
                    </p>
                  </div>
                )}
                
                {formatoSeleccionado === "repechaje" && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">Torneo con Repechaje</h4>
                    <p className="text-orange-800 text-sm">
                      Incluye partidos adicionales de repechaje para equipos que no clasificaron directamente. 
                      Segunda oportunidad para los equipos eliminados.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Generated Calendar */}
            {generacionActiva && (
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
                      {/* Fecha */}
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(partido.fecha)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(partido.fecha).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      {/* Hora */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{partido.hora}</span>
                      </div>

                      {/* Equipo 1 */}
                      <div className="text-center md:text-left">
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                          {partido.equipo1}
                        </div>
                      </div>

                      {/* VS y Equipo 2 */}
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
