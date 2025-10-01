import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, CalendarDays } from 'lucide-react';
import { CreateTournamentModal } from '@/components/CreateTournamentModal';
import gcompetenciaService, { Tournament } from '@/services/gcompetenciaService';

const getStatusColor = (status: "En curso" | "Finalizado" | "Pendiente") => {
  switch (status) {
    case 'En curso':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'Finalizado':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// 🔹 Mapa para traducir los formatos del backend
const formatLabels: Record<string, string> = {
  LEAGUE: 'Liga',
  DIRECT_ELIMINATION: 'Eliminatoria',
  PLAY_OFF: 'Repechaje',
};

// 🔹 Función para calcular estatus basado en fechas
function getTournamentStatus(startDate: string, endDate: string): "Pendiente" | "En curso" | "Finalizado" {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (today < start) return "Pendiente";
  if (today > end) return "Finalizado";
  return "En curso";
}

export default function GestionCompetencias() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para recargar lista
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await gcompetenciaService.getTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error cargando competencias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Competencias - Panel de Gestión
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra y gestiona todos los torneos de fútbol
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate('/calendario')}
                variant="outline"
                className="text-primary border-primary hover:bg-primary hover:text-white shadow-lg"
                size="lg"
              >
                <CalendarDays className="w-5 h-5 mr-2" />
                Ver calendario
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear nueva competencia
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Cargando competencias...</div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => {
              const status = getTournamentStatus(tournament.startDate, tournament.endDate);
              return (
                <Card
                  key={tournament.id}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0 rounded-xl"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {tournament.name}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 flex-shrink-0 ${getStatusColor(status)}`}
                      >
                        {status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span>
                        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        <span>{tournament.numberOfTeams} equipos</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatLabels[tournament.format] || tournament.format}
                      </Badge>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                      //onClick={() => navigate(`/detalles-torneo/${tournament.id}`)}
                      onClick={() => navigate(`tournament/${tournament.id}/teams-manage`)}
                    >
                      Ver detalles
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay competencias creadas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza creando tu primera competencia de fútbol
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear primera competencia
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateTournamentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={fetchTournaments}  // refresca desde el backend
      />
    </div>
  );
}

