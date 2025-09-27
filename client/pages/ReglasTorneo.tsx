import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit3, ClipboardList, RotateCcw, AlertTriangle } from 'lucide-react';

interface CompetitionFormatData {
  id: string;
  tournamentName: string;
  format: string;
  roundTrip: boolean;
  yellowCardLimit: number;
  suspensionMatches: number;
}

// Mock data
const mockFormat: CompetitionFormatData = {
  id: '1',
  tournamentName: 'Liga Nacional de Fútbol 2025',
  format: 'Liga todos contra todos',
  roundTrip: true,
  yellowCardLimit: 3,
  suspensionMatches: 1
};

export default function CompetitionFormat() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you'd fetch the competition format data using the id
  const format = mockFormat;

  const handleEditFormat = () => {
    console.log('Editar formato de competencia');
    // Navigate to edit format page
  };

  const handleBackToTournament = () => {
    navigate(`/tournament/${id || '1'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Formato de la Competencia
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Información sobre las reglas y condiciones del torneo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Format Card */}
        <Card className="bg-white shadow-lg border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <ClipboardList className="w-5 h-5 mr-3 text-primary" />
              Configuración del Formato
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {format.tournamentName}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Format Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-xl">📋</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">
                      Formato del torneo
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {format.format}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Cada equipo jugará contra todos los demás equipos participantes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">
                      Ida y vuelta
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {format.roundTrip ? 'Sí' : 'No'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format.roundTrip 
                        ? 'Los equipos se enfrentarán dos veces: una vez de local y otra de visitante'
                        : 'Los equipos se enfrentarán una sola vez'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-xl">🟨</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">
                      Tarjetas amarillas para suspensión
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {format.yellowCardLimit} amarillas = suspensión {format.suspensionMatches} partido{format.suspensionMatches > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Un jugador será suspendido automáticamente al alcanzar este límite
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Información adicional
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Las tarjetas se acumulan durante todo el torneo</li>
                    <li>• Una tarjeta roja equivale a suspensión inmediata</li>
                    <li>• Las suspensiones no se transfieren entre torneos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alert Section */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 font-medium">
                El jugador <strong>Juan Pérez</strong> ha alcanzado el límite de tarjetas amarillas y está suspendido para el próximo partido.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button 
                onClick={handleEditFormat}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                style={{ backgroundColor: '#2563eb' }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar formato
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleBackToTournament}
                className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al torneo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card className="bg-white shadow-sm border-0 rounded-xl mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <RotateCcw className="w-5 h-5 mr-3 text-primary" />
              Resumen de Reglas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Sistema de Puntuación</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Victoria: 3 puntos</li>
                  <li>• Empate: 1 punto</li>
                  <li>• Derrota: 0 puntos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Criterios de Desempate</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>1. Puntos totales</li>
                  <li>2. Diferencia de goles</li>
                  <li>3. Goles a favor</li>
                  <li>4. Enfrentamiento directo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
