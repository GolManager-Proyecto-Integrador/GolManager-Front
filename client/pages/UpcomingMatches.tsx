import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Home,
  Calendar,
  Search,
  MapPin,
  Clock,
  Shield,
  Edit,
  Trash2,
} from 'lucide-react';

interface UpcomingMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

interface EditFormData {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
}

const mockUpcomingMatches: UpcomingMatch[] = [
  {
    id: '1',
    homeTeam: 'Real Madrid CF',
    awayTeam: 'FC Barcelona',
    date: '2024-12-20',
    time: '16:00',
    stadium: 'Santiago Bernabéu'
  },
  {
    id: '2',
    homeTeam: 'Atlético Madrid',
    awayTeam: 'Valencia CF',
    date: '2024-12-22',
    time: '18:30',
    stadium: 'Wanda Metropolitano'
  },
  {
    id: '3',
    homeTeam: 'Sevilla FC',
    awayTeam: 'Real Betis',
    date: '2024-12-24',
    time: '20:00',
    stadium: 'Ramón Sánchez-Pizjuán'
  },
  {
    id: '4',
    homeTeam: 'Athletic Bilbao',
    awayTeam: 'Real Sociedad',
    date: '2024-12-26',
    time: '17:15',
    stadium: 'San Mamés'
  },
  {
    id: '5',
    homeTeam: 'Villarreal CF',
    awayTeam: 'Celta de Vigo',
    date: '2024-12-28',
    time: '19:00',
    stadium: 'Estadio de la Cerámica'
  },
  {
    id: '6',
    homeTeam: 'Getafe CF',
    awayTeam: 'Rayo Vallecano',
    date: '2024-12-30',
    time: '16:30',
    stadium: 'Coliseum Alfonso Pérez'
  }
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function UpcomingMatches() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<UpcomingMatch[]>(mockUpcomingMatches);
  const [editingMatch, setEditingMatch] = useState<UpcomingMatch | null>(null);
  const [deleteConfirmMatch, setDeleteConfirmMatch] = useState<UpcomingMatch | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    stadium: ''
  });

  const filteredMatches = matches.filter(match =>
    match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatDate(match.date).includes(searchTerm) ||
    match.stadium.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMatchClick = (matchId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/match/${matchId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard-organizador');
  };

  const handleEditClick = (match: UpcomingMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMatch(match);
    setEditFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      date: match.date,
      time: match.time,
      stadium: match.stadium
    });
  };

  const handleDeleteClick = (match: UpcomingMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmMatch(match);
  };

  const handleSaveEdit = () => {
    if (editingMatch) {
      setMatches(matches.map(m =>
        m.id === editingMatch.id
          ? {
              ...m,
              homeTeam: editFormData.homeTeam,
              awayTeam: editFormData.awayTeam,
              date: editFormData.date,
              time: editFormData.time,
              stadium: editFormData.stadium
            }
          : m
      ));
      setEditingMatch(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmMatch) {
      setMatches(matches.filter(m => m.id !== deleteConfirmMatch.id));
      setDeleteConfirmMatch(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmMatch(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDashboardClick}
                className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 rounded-lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al panel
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-blue-600" />
              Próximos Partidos
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Consulta los próximos encuentros programados en la competencia seleccionada.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <Card className="bg-white shadow-md border border-gray-200 rounded-2xl mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre de equipo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <Input
                type="date"
                placeholder="Filtrar por fecha"
                className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600 w-40"
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        <Card className="bg-white shadow-md border border-gray-200 rounded-2xl">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Calendar className="w-5 h-5 mr-3 text-blue-600" />
              Partidos Programados ({filteredMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredMatches.length > 0 ? (
              <div className="space-y-4">
                {filteredMatches.map(match => (
                  <Card
                    key={match.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 rounded-2xl overflow-hidden"
                  >
                    <CardContent className="p-6">
                      {/* Desktop Layout */}
                      <div className="hidden md:grid md:grid-cols-5 gap-6 items-center">
                        {/* Home Team */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{match.homeTeam}</p>
                            <p className="text-xs text-gray-500">Local</p>
                          </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                            <Shield className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{match.awayTeam}</p>
                            <p className="text-xs text-gray-500">Visitante</p>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium">{formatDate(match.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{match.time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="truncate">{match.stadium}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleMatchClick(match.id, e)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg whitespace-nowrap"
                          >
                            Ver detalles
                          </Button>
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEditClick(match, e)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteClick(match, e)}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Equipo Local</p>
                            <p className="font-semibold text-gray-900">{match.homeTeam}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Equipo Visitante</p>
                            <p className="font-semibold text-gray-900">{match.awayTeam}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Fecha</p>
                            <p className="font-medium text-gray-900">{formatDate(match.date)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Hora</p>
                            <p className="font-medium text-gray-900">{match.time}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Estadio</p>
                            <p className="font-medium text-gray-900 truncate">{match.stadium}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleMatchClick(match.id, e)}
                            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg text-xs"
                          >
                            Ver detalles
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEditClick(match, e)}
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteClick(match, e)}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay partidos próximos programados.
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? `No se encontraron partidos que coincidan con "${searchTerm}"`
                    : 'Actualmente no hay partidos programados para las próximas fechas.'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="mt-4 rounded-lg"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingMatch} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Editar Partido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="homeTeam" className="text-sm font-medium text-gray-700">
                Equipo Local
              </Label>
              <Input
                id="homeTeam"
                type="text"
                value={editFormData.homeTeam}
                onChange={(e) => setEditFormData({ ...editFormData, homeTeam: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <Label htmlFor="awayTeam" className="text-sm font-medium text-gray-700">
                Equipo Visitante
              </Label>
              <Input
                id="awayTeam"
                type="text"
                value={editFormData.awayTeam}
                onChange={(e) => setEditFormData({ ...editFormData, awayTeam: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Fecha del partido
              </Label>
              <Input
                id="date"
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                Hora
              </Label>
              <Input
                id="time"
                type="time"
                value={editFormData.time}
                onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div>
              <Label htmlFor="stadium" className="text-sm font-medium text-gray-700">
                Estadio
              </Label>
              <Input
                id="stadium"
                type="text"
                value={editFormData.stadium}
                onChange={(e) => setEditFormData({ ...editFormData, stadium: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmMatch} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Eliminar Partido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-2">
              ¿Estás seguro de que deseas eliminar este partido? Esta acción no se puede deshacer.
            </AlertDialogDescription>
            {deleteConfirmMatch && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{deleteConfirmMatch.homeTeam}</span>
                  {' vs '}
                  <span className="font-semibold">{deleteConfirmMatch.awayTeam}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(deleteConfirmMatch.date)} a las {deleteConfirmMatch.time}
                </p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel className="text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
