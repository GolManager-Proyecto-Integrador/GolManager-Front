import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import teamService from '@/services/teamManagementService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { toast } from 'sonner';
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
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

// Importar servicios
import { 
  getUpcomingMatches, 
  createMatch, 
  updateMatch, 
  deleteMatch,
  getTournamentTeams,
  getReferees,
  getTournamentDetails
} from '@/services/upcomingMatchService';

// Interfaces según la API
interface UpcomingMatch {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  matchDateTime: string;
  stadium: string;
  refereeName?: string;
  homeTeamId?: number;
  awayTeamId?: number;
}

interface Team {
  id: number;
  name: string;
}

interface Referee {
  id: number;
  name: string;
}

interface Tournament {
  id: number;
  name: string;
}

interface EditFormData {
  date: string;
  time: string;
  stadium: string;
  refereeId: number;
}

interface ScheduleFormData {
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  time: string;
  stadium: string;
  refereeId: number;
}



const ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Función para obtener la hora actual en Colombia (UTC-5)
const getCurrentTimeInColombia = (): Date => {
  const now = new Date();
  // Colombia está en UTC-5, pero Date usa UTC, así que convertimos
  const colombiaOffset = -5 * 60; // UTC-5 en minutos
  const localOffset = now.getTimezoneOffset(); // Offset local en minutos
  const colombiaTime = new Date(now.getTime() + (localOffset - colombiaOffset) * 60000);
  return colombiaTime;
};

// Función para verificar si se puede acceder al partido (15 minutos antes)
const canAccessMatch = (matchDateTime: string): boolean => {
  const matchDate = new Date(matchDateTime);
  const currentTime = getCurrentTimeInColombia();
  
  // Calcular 15 minutos antes del partido
  const fifteenMinutesBefore = new Date(matchDate.getTime() - (15 * 60 * 1000));
  
  // El partido es accesible desde 15 minutos antes en adelante
  return currentTime >= fifteenMinutesBefore;
};

// Función para formartar la hora para mostrar en el mensaje
const formatDateTimeForMessage = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  });
};

export default function UpcomingMatches() {

  useEffect(() => {
  document.title = `Próximos Partidos`;
  }, );

  const navigate = useNavigate();
  const { idTournament } = useParams<{ idTournament: string }>(); // CAMBIADO: tournamentId → idTournament
  
  // Verificar si idTournament existe
  useEffect(() => {
    if (!idTournament) {
      console.error('❌ idTournament is missing from URL');
      toast.error('ID de torneo no encontrado');
      navigate('/dashboard-organizador');
      return;
    }
  }, [idTournament, navigate]);

  // Si no hay idTournament, mostrar mensaje de error
  if (!idTournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Error: ID de torneo no encontrado</h3>
            <p className="mt-2">La URL no contiene el ID del torneo.</p>
            <Button 
              onClick={() => navigate('/dashboard-organizador')}
              className="mt-4"
            >
              Volver al dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [editingMatch, setEditingMatch] = useState<UpcomingMatch | null>(null);
  const [deleteConfirmMatch, setDeleteConfirmMatch] = useState<UpcomingMatch | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [editFormData, setEditFormData] = useState<EditFormData>({
    date: '',
    time: '',
    stadium: '',
    refereeId: 0
  });
  
  const [scheduleFormData, setScheduleFormData] = useState<ScheduleFormData>({
    homeTeamId: 0,
    awayTeamId: 0,
    date: '',
    time: '',
    stadium: '',
    refereeId: 0
  });

  // Cargar datos iniciales
  // Cargar datos iniciales - VERSIÓN CORREGIDA
useEffect(() => {
  const loadData = async () => {
    if (!idTournament) return;
    
    try {
      setLoading(true);
      console.log('🔄 Starting to load data for tournament:', idTournament);

      // Test cada endpoint individualmente
      const matchesData = await getUpcomingMatches(parseInt(idTournament), 100);
      const teamsData = await teamService.getTeams(parseInt(idTournament));
      // Extrae solo id y name que necesitas para el select
      const simpleTeams = teamsData.map(team => ({
        id: team.id,
        name: team.name
      }));
      const refereesData = await getReferees();

      // DEBUG: Ver EXACTAMENTE qué devuelve getTournamentDetails
      console.log('📋 Testing getTournamentDetails...');
      const tournamentData = await getTournamentDetails(parseInt(idTournament));
      console.log('✅ Tournament data (RAW):', tournamentData);
      console.log('🔍 Is Array?:', Array.isArray(tournamentData));
      console.log('🔍 Array length:', Array.isArray(tournamentData) ? tournamentData.length : 'Not an array');

      // CORRECCIÓN: La API devuelve un array, necesitamos encontrar el torneo específico
      let tournamentName = '';
      let foundTournament = null;

      if (Array.isArray(tournamentData)) {
        console.log('🔍 Searching for tournament with id:', idTournament);
        
        // Buscar el torneo con el ID específico
        foundTournament = tournamentData.find(t => t.id === parseInt(idTournament));
        
        if (foundTournament) {
          console.log('✅ Found tournament:', foundTournament);
          tournamentName = foundTournament.name;
        } else if (tournamentData.length > 0) {
          // Si no encuentra por ID, usar el primer elemento
          console.log('⚠️ Tournament not found by ID, using first element');
          foundTournament = tournamentData[0];
          tournamentName = foundTournament.name || `Torneo #${idTournament}`;
        } else {
          console.warn('⚠️ Empty tournaments array');
          tournamentName = `Torneo #${idTournament}`;
        }
      } else if (tournamentData && tournamentData.name) {
        // Si por alguna razón no es array sino objeto directo
        tournamentName = tournamentData.name;
        foundTournament = tournamentData;
      } else {
        tournamentName = `Torneo #${idTournament}`;
        console.warn('⚠️ No se pudo extraer el nombre del torneo, estructura desconocida');
      }

      console.log('🎯 Final tournament name:', tournamentName);

      // Resto del código...
      setMatches(matchesData.matches || []);
      setTeams(simpleTeams);
      setReferees(refereesData.referees || []);
      
      setTournament({
        id: parseInt(idTournament),
        name: tournamentName
      });

    } catch (error) {
      console.error('💥 Error loading data:', error);
      toast.error('Error al cargar los datos');
      setTournament({
        id: parseInt(idTournament),
        name: `Torneo #${idTournament}`
      });
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [idTournament]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchesSearch =
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(match.matchDateTime).includes(searchTerm) ||
        match.stadium.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !filterDate || match.matchDateTime.split('T')[0] === filterDate;

      return matchesSearch && matchesDate;
    });
  }, [matches, searchTerm, filterDate]);

  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMatches = filteredMatches.slice(startIndex, endIndex);

  const handleMatchClick = (match: UpcomingMatch, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Validar si se puede acceder al partido (15 minutos antes)
    if (!canAccessMatch(match.matchDateTime)) {
      const matchTime = formatDateTimeForMessage(match.matchDateTime);
      toast.error(`No puedes acceder a este partido aún. Estará disponible 15 minutos antes del inicio: ${matchTime}`);
      return;
    }

    // Navegar a la nueva ruta
    navigate(`/tournament/${idTournament}/match/${match.matchId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard-organizador');
  };

  const handleEditClick = async (match: UpcomingMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMatch(match);
    const matchDate = new Date(match.matchDateTime);
    
    // OPCIÓN 2: Buscar el ID del árbitro por su nombre en la lista de árbitros
    const referee = referees.find(ref => ref.name === match.refereeName);
    const refereeId = referee ? referee.id : 0;
    
    setEditFormData({
      date: matchDate.toISOString().split('T')[0],
      time: matchDate.toTimeString().slice(0, 5),
      stadium: match.stadium,
      refereeId: refereeId 
    });
  };

  const handleDeleteClick = (match: UpcomingMatch, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmMatch(match);
  };

  const handleSaveEdit = async () => {
    if (editingMatch && idTournament) { 
      try {
        const matchDateTime = new Date(`${editFormData.date}T${editFormData.time}`);
        
        const updateData = {
          matchId: editingMatch.matchId,
          matchDate: matchDateTime.toISOString(),
          stadium: editFormData.stadium,
          refereeId: editFormData.refereeId
        };

        await updateMatch(parseInt(idTournament), updateData); 
        
        // Actualizar estado local - también actualizar el nombre del árbitro
        const updatedRefereeName = referees.find(ref => ref.id === editFormData.refereeId)?.name || editingMatch.refereeName;
        
        setMatches(matches.map(m =>
          m.matchId === editingMatch.matchId
            ? {
                ...m,
                matchDateTime: matchDateTime.toISOString(),
                stadium: editFormData.stadium,
                refereeName: updatedRefereeName
              }
            : m
        ));
        setEditingMatch(null);
        toast.success('Partido actualizado correctamente');
      } catch (error) {
        console.error('Error updating match:', error);
        toast.error('Error al actualizar el partido');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmMatch && idTournament) { 
      try {
        await deleteMatch(parseInt(idTournament), deleteConfirmMatch.matchId); 
        
        setMatches(matches.filter(m => m.matchId !== deleteConfirmMatch.matchId));
        setDeleteConfirmMatch(null);
        
        if (startIndex >= filteredMatches.length - 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        toast.success('Partido eliminado correctamente');
      } catch (error) {
        console.error('Error deleting match:', error);
        toast.error('Error al eliminar el partido');
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmMatch(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenScheduleDialog = () => {
    setIsScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setIsScheduleDialogOpen(false);
    setScheduleFormData({
      homeTeamId: 0,
      awayTeamId: 0,
      date: '',
      time: '',
      stadium: '',
      refereeId: 0
    });
  };

  const handleSaveSchedule = async () => {
    if (idTournament && scheduleFormData.homeTeamId && scheduleFormData.awayTeamId && 
        scheduleFormData.date && scheduleFormData.time && scheduleFormData.stadium && 
        scheduleFormData.refereeId) {
      try {
        const matchDateTime = new Date(`${scheduleFormData.date}T${scheduleFormData.time}`);
        
        const matchData = {
          homeTeamId: scheduleFormData.homeTeamId,
          awayTeamId: scheduleFormData.awayTeamId,
          tournamentId: parseInt(idTournament), 
          stadiumName: scheduleFormData.stadium,
          referee: scheduleFormData.refereeId,
          matchDate: matchDateTime.toISOString()
        };

        const newMatch = await createMatch(parseInt(idTournament), matchData); 
        
        // Obtener el nombre del árbitro para mostrarlo en la lista
        const refereeName = referees.find(ref => ref.id === scheduleFormData.refereeId)?.name || '';
        
        // Convertir la respuesta de la API al formato del componente
        const formattedMatch: UpcomingMatch = {
          matchId: newMatch.matchId,
          homeTeam: newMatch.homeTeam,
          awayTeam: newMatch.awayTeam,
          matchDateTime: newMatch.matchDate,
          stadium: newMatch.stadiumName,
          refereeName: refereeName
        };

        setMatches([...matches, formattedMatch]);
        handleCloseScheduleDialog();
        setCurrentPage(1);
        toast.success('Partido programado correctamente');
      } catch (error) {
        console.error('Error creating match:', error);
        toast.error('Error al programar el partido');
      }
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const getMinDateTime = () => {
    const today = getTodayDate();
    const now = new Date();
    return {
      minDate: today,
      minTime: scheduleFormData.date === today ? now.toTimeString().slice(0, 5) : '00:00'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                Próximos Partidos
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {tournament ? `Torneo: ${tournament.name}` : 'Consultando torneo...'}
              </p>
            </div>
            <Button
              onClick={handleOpenScheduleDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Programar partido
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <Card className="bg-white shadow-md border border-gray-200 rounded-2xl mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre de equipo"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              <Input
                type="date"
                placeholder="Filtrar por fecha"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600 sm:w-40"
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 whitespace-nowrap"
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
            {paginatedMatches.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedMatches.map(match => (
                    <Card
                      key={match.matchId}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 rounded-2xl overflow-hidden"
                      onClick={() => handleMatchClick(match)}
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
                              <span className="font-medium">{formatDate(match.matchDateTime)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{formatTime(match.matchDateTime)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="truncate">{match.stadium}</span>
                            </div>
                            {match.refereeName && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="text-xs text-gray-500">Árbitro: </span>
                                <span className="ml-1">{match.refereeName}</span>
                              </div>
                            )}
                          </div>

                          {/* Match Status Badge */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleMatchClick(match, e)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg whitespace-nowrap"
                            >
                              Ver detalles
                            </Button>
                            {!canAccessMatch(match.matchDateTime) && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                No disponible
                              </Badge>
                            )}
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

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Fecha</p>
                              <p className="font-medium text-gray-900">{formatDate(match.matchDateTime)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Hora</p>
                              <p className="font-medium text-gray-900">{formatTime(match.matchDateTime)}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 mb-1">Estadio</p>
                              <p className="font-medium text-gray-900 truncate">{match.stadium}</p>
                            </div>
                            {match.refereeName && (
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Árbitro</p>
                                <p className="font-medium text-gray-900">{match.refereeName}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleMatchClick(match, e)}
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
                          {!canAccessMatch(match.matchDateTime) && (
                            <div className="text-center">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                Disponible 15 minutos antes del inicio
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="rounded-lg border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>

                    <div className="flex items-center space-x-1">
                      {generatePageNumbers().map((page, index) => (
                        <div key={index}>
                          {page === '...' ? (
                            <span className="px-2 py-1 text-gray-400">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageClick(page as number)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay partidos próximos programados.
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm || filterDate
                    ? 'No se encontraron partidos que coincidan con tus criterios de búsqueda.'
                    : 'Actualmente no hay partidos programados para las próximas fechas.'
                  }
                </p>
                {(searchTerm || filterDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDate('');
                      setCurrentPage(1);
                    }}
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

      {/* Schedule Match Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Programar partido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tournament (Read-only) - CON DEBUG CORRECTO */}
            <div>
              <Label htmlFor="tournament" className="text-sm font-medium text-gray-700">
                Torneo al cual pertenece el partido
              </Label>
              <Input
                id="tournament"
                type="text"
                value={tournament?.name || 'Cargando nombre...'}
                disabled
                className="mt-1 rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              {/* Debug en consola - se ejecuta pero no se renderiza */}
              {(() => {
                console.log('Tournament data in dialog:', tournament);
                return null;
              })()}
            </div>

            {/* Home Team */}
            <div>
              <Label htmlFor="homeTeam" className="text-sm font-medium text-gray-700">
                Equipo Local
              </Label>
              <Select 
                value={scheduleFormData.homeTeamId.toString()} 
                onValueChange={(value) => {
                  setScheduleFormData({ ...scheduleFormData, homeTeamId: parseInt(value), awayTeamId: 0 });
                }}
              >
                <SelectTrigger id="homeTeam" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar equipo local" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Away Team */}
            <div>
              <Label htmlFor="awayTeam" className="text-sm font-medium text-gray-700">
                Equipo Visitante
              </Label>
              <Select 
                value={scheduleFormData.awayTeamId.toString()} 
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, awayTeamId: parseInt(value) })}>
                <SelectTrigger id="awayTeam" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600" disabled={!scheduleFormData.homeTeamId}>
                  <SelectValue placeholder="Seleccionar equipo visitante" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter(team => team.id !== scheduleFormData.homeTeamId)
                    .map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Fecha del partido
              </Label>
              <Input
                id="date"
                type="date"
                value={scheduleFormData.date}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, date: e.target.value })}
                min={getMinDateTime().minDate}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Time */}
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                Hora del partido
              </Label>
              <Input
                id="time"
                type="time"
                value={scheduleFormData.time}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                min={getMinDateTime().minTime}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Stadium */}
            <div>
              <Label htmlFor="stadium" className="text-sm font-medium text-gray-700">
                Estadio
              </Label>
              <Input
                id="stadium"
                type="text"
                placeholder="Nombre del estadio"
                value={scheduleFormData.stadium}
                onChange={(e) => setScheduleFormData({ ...scheduleFormData, stadium: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Referee */}
            <div>
              <Label htmlFor="referee" className="text-sm font-medium text-gray-700">
                Árbitro
              </Label>
              <Select 
                value={scheduleFormData.refereeId.toString()} 
                onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, refereeId: parseInt(value) })}>
                <SelectTrigger id="referee" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar árbitro" />
                </SelectTrigger>
                <SelectContent>
                  {referees.map(referee => (
                    <SelectItem key={referee.id} value={referee.id.toString()}>
                      {referee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseScheduleDialog}
              className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={!scheduleFormData.homeTeamId || !scheduleFormData.awayTeamId || !scheduleFormData.date || !scheduleFormData.time || !scheduleFormData.stadium || !scheduleFormData.refereeId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar partido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingMatch} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Editar Partido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Read-only Home Team */}
            <div>
              <Label htmlFor="homeTeamReadOnly" className="text-sm font-medium text-gray-700">
                Equipo Local
              </Label>
              <Input
                id="homeTeamReadOnly"
                type="text"
                value={editingMatch?.homeTeam || ''}
                disabled
                className="mt-1 rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Read-only Away Team */}
            <div>
              <Label htmlFor="awayTeamReadOnly" className="text-sm font-medium text-gray-700">
                Equipo Visitante
              </Label>
              <Input
                id="awayTeamReadOnly"
                type="text"
                value={editingMatch?.awayTeam || ''}
                disabled
                className="mt-1 rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Editable Date */}
            <div>
              <Label htmlFor="editDate" className="text-sm font-medium text-gray-700">
                Fecha del partido
              </Label>
              <Input
                id="editDate"
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Editable Time */}
            <div>
              <Label htmlFor="editTime" className="text-sm font-medium text-gray-700">
                Hora
              </Label>
              <Input
                id="editTime"
                type="time"
                value={editFormData.time}
                onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Editable Stadium */}
            <div>
              <Label htmlFor="editStadium" className="text-sm font-medium text-gray-700">
                Estadio
              </Label>
              <Input
                id="editStadium"
                type="text"
                value={editFormData.stadium}
                onChange={(e) => setEditFormData({ ...editFormData, stadium: e.target.value })}
                className="mt-1 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Editable Referee */}
            <div>
              <Label htmlFor="editReferee" className="text-sm font-medium text-gray-700">
                Árbitro
              </Label>
              <Select 
                value={editFormData.refereeId.toString()} 
                onValueChange={(value) => setEditFormData({ ...editFormData, refereeId: parseInt(value) })}>
                <SelectTrigger id="editReferee" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar árbitro" />
                </SelectTrigger>
                <SelectContent>
                  {referees.map(referee => (
                    <SelectItem key={referee.id} value={referee.id.toString()}>
                      {referee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {formatDate(deleteConfirmMatch.matchDateTime)} a las {formatTime(deleteConfirmMatch.matchDateTime)}
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