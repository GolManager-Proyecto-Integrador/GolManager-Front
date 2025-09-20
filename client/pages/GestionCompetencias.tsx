import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, CalendarDays } from 'lucide-react';


interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'En curso' | 'Finalizado' | 'Pendiente';
  teams: number;
  format: string;
}

const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Liga Nacional de Fútbol 2025',
    startDate: '2025-03-15',
    endDate: '2025-11-30',
    status: 'En curso',
    teams: 20,
    format: 'Liga'
  },
  {
    id: '2',
    name: 'Copa Ciudad Primavera',
    startDate: '2025-04-01',
    endDate: '2025-05-15',
    status: 'Pendiente',
    teams: 16,
    format: 'Eliminatoria'
  },
  {
    id: '3',
    name: 'Torneo de Verano 2025',
    startDate: '2025-12-01',
    endDate: '2025-02-28',
    status: 'Finalizado',
    teams: 12,
    format: 'Liga'
  },
  {
    id: '4',
    name: 'Copa Regional Norte',
    startDate: '2025-06-01',
    endDate: '2025-08-15',
    status: 'Pendiente',
    teams: 8,
    format: 'Eliminatoria'
  },
  {
    id: '5',
    name: 'Liga Juvenil 2025',
    startDate: '2025-02-01',
    endDate: '2025-10-30',
    status: 'En curso',
    teams: 14,
    format: 'Liga'
  },
  {
    id: '6',
    name: 'Torneo Relámpago',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    status: 'Finalizado',
    teams: 6,
    format: 'Repechaje'
  }
];

const getStatusColor = (status: Tournament['status']) => {
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

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {tournament.name}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 flex-shrink-0 ${getStatusColor(tournament.status)}`}
                  >
                    {tournament.status}
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
                    <span>{tournament.teams} equipos</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {tournament.format}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  className="w-full text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                  onClick={() => navigate(`/detalles-torneo/${tournament.id}`)}
                >
                  Ver detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty state if no tournaments */}
        {mockTournaments.length === 0 && (
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

      
    </div>
  );
}
