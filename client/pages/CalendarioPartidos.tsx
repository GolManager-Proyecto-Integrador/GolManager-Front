import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Home,
} from 'lucide-react';
import { CalendarioService, Match, CreateMatchPayload, Tournament as ApiTournament, Referee as ApiReferee, Team } from '@/services/calendarService';
import { useToast } from '@/hooks/use-toast';

interface CalendarMatch {
  id: string;
  tournament: string;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
  date: string;
  time: string;
  stadium: string;
  referee: string;
  refereeId: number;
  goalsHomeTeam: number;
  goalsAwayTeam: number;
}

interface LocalTournament {
  id: number;
  name: string;
  teams: { id: number; name: string }[];
}

interface LocalReferee {
  id: number;
  name: string;
}

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type ViewType = 'month' | 'week' | 'day';

export default function Calendar() {

  useEffect(() => {
    document.title = `Calendario de Partidos`;
  }, );

  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedDayMatches, setSelectedDayMatches] = useState<CalendarMatch[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [matches, setMatches] = useState<CalendarMatch[]>([]);
  const [tournaments, setTournaments] = useState<LocalTournament[]>([]);
  const [referees, setReferees] = useState<LocalReferee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newMatch, setNewMatch] = useState({
    tournament: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    stadium: '',
    referee: ''
  });

  // Fetch initial data including tournaments and referees
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Cargar torneos desde la API
        const tournamentsData = await CalendarioService.getTournaments();
        setTournaments(tournamentsData.map(t => ({ ...t, teams: [] })));

        // Cargar árbitros desde la API
        const refereesData = await CalendarioService.getReferees();
        setReferees(refereesData);

        // Cargar partidos
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const startDate = new Date(firstDay);
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date(lastDay);
        endDate.setMonth(endDate.getMonth() + 1);

        const initialDateStr = startDate.toISOString().split('T')[0];
        const finishDateStr = endDate.toISOString().split('T')[0];

        const fetchedMatchesRaw = await CalendarioService.getMatches(initialDateStr, finishDateStr);
        const fetchedMatches: Match[] = Array.isArray(fetchedMatchesRaw) ? fetchedMatchesRaw : [];

        // Convert API matches to CalendarMatch format
        const convertedMatches: CalendarMatch[] = fetchedMatches.map(match => {
          const dateTime = new Date(match.matchDateTIme);
          const date = dateTime.toISOString().split('T')[0];
          const time = dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return {
            id: String(match.matchId),
            tournament: match.tournamentName,
            homeTeam: match.homeTeam,
            homeTeamId: match.homeTeamId,
            awayTeam: match.awayTeam,
            awayTeamId: match.awayTeamId,
            date,
            time,
            stadium: match.stadium,
            referee: match.refereeName,
            refereeId: match.refereeId,
            goalsHomeTeam: match.goalsHomeTeam,
            goalsAwayTeam: match.goalsAwayTeam,
          };
        });

        setMatches(convertedMatches);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos. Intenta más tarde.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [currentDate, toast]);



  // Función para cargar equipos cuando se selecciona un torneo
  const handleTournamentChange = async (tournamentId: string) => {
    setNewMatch({ ...newMatch, tournament: tournamentId, homeTeam: '', awayTeam: '' });
    
    if (tournamentId !== 'all') {
      try {
        const teams = await CalendarioService.getTeamsByTournament(parseInt(tournamentId));
        // Actualizar el estado de tournaments con los equipos
        setTournaments(prev => prev.map(t => 
          t.id === parseInt(tournamentId) 
            ? { ...t, teams: teams.map(team => ({ id: team.teamId, name: team.name })) }
            : t
        ));
      } catch (error) {
        console.error('Error loading teams:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los equipos del torneo.',
          variant: 'destructive',
        });
      }
    }
  };

  // Obtener equipos disponibles para el torneo seleccionado
  const selectedTournamentTeams = tournaments.find(t => String(t.id) === newMatch.tournament)?.teams || [];

  const getTeamsFromMatches = (tournamentId: string) => {
    if (tournamentId === 'all') return [];

    const teams = new Map<number, string>();
    matches.forEach(match => {
      if (String(match.homeTeamId) === tournamentId || match.tournament === tournaments.find(t => String(t.id) === tournamentId)?.name) {
        teams.set(match.homeTeamId, match.homeTeam);
        teams.set(match.awayTeamId, match.awayTeam);
      }
    });

    return Array.from(teams.values());
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const getCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMatchesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return matches.filter(match => {
      const matchDate = match.date;
      let tournamentMatch = true;

      if (selectedTournament !== 'all') {
        const selectedTournamentName = tournaments.find(
          t => String(t.id) === selectedTournament
        )?.name;
        tournamentMatch = match.tournament === selectedTournamentName;
      }

      return matchDate === dateString && tournamentMatch;
    });
  };

  const handleMatchClick = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/detalle-partido/${matchId}`);
  };

  const handleDayClick = (date: Date) => {
    const dayMatches = getMatchesForDate(date);
    if (dayMatches.length > 0) {
      setSelectedDayMatches(dayMatches);
      setIsDayModalOpen(true);
    }
  };

  const handleDashboardClick = () => {
    navigate('/dashboard-organizador');
  };

  const handleScheduleMatch = async () => {
    if (
      newMatch.tournament &&
      newMatch.homeTeam &&
      newMatch.awayTeam &&
      newMatch.date &&
      newMatch.time &&
      newMatch.stadium &&
      newMatch.referee
    ) {
      setIsSaving(true);
      try {
        // Encontrar los IDs de los equipos por sus nombres
        const homeTeam = selectedTournamentTeams.find(team => team.name === newMatch.homeTeam);
        const awayTeam = selectedTournamentTeams.find(team => team.name === newMatch.awayTeam);

        if (!homeTeam || !awayTeam) {
          throw new Error('No se encontraron los equipos seleccionados');
        }

        const selectedTournamentId = parseInt(newMatch.tournament);
        const homeTeamId = homeTeam.id;
        const awayTeamId = awayTeam.id;
        const refereeId = parseInt(newMatch.referee);

        // Combine date and time into ISO format
        const [hours, minutes] = newMatch.time.split(':');
        const matchDateTime = new Date(newMatch.date);
        matchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const matchDateStr = matchDateTime.toISOString();

        const payload: CreateMatchPayload = {
          homeTeamId,
          awayTeamId,
          tournamentId: selectedTournamentId,
          stadiumName: newMatch.stadium,
          referee: refereeId,
          matchDate: matchDateStr,
        };

        const response = await CalendarioService.createMatch(payload);

        toast({
          title: 'Éxito',
          description: 'El partido ha sido programado correctamente.',
        });

        // Reset form and close dialog
        setIsScheduleDialogOpen(false);
        setNewMatch({
          tournament: '',
          homeTeam: '',
          awayTeam: '',
          date: '',
          time: '',
          stadium: '',
          referee: ''
        });

        // Refresh matches
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date(lastDay);
        endDate.setMonth(endDate.getMonth() + 1);

        const initialDateStr = startDate.toISOString().split('T')[0];
        const finishDateStr = endDate.toISOString().split('T')[0];

        const fetchedMatchesRaw = await CalendarioService.getMatches(initialDateStr, finishDateStr);
        const fetchedMatches: Match[] = Array.isArray(fetchedMatchesRaw) ? fetchedMatchesRaw : [];

        const convertedMatches: CalendarMatch[] = fetchedMatches.map(match => {
          const dateTime = new Date(match.matchDateTIme);
          const date = dateTime.toISOString().split('T')[0];
          const time = dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return {
            id: String(match.matchId),
            tournament: match.tournamentName,
            homeTeam: match.homeTeam,
            homeTeamId: match.homeTeamId,
            awayTeam: match.awayTeam,
            awayTeamId: match.awayTeamId,
            date,
            time,
            stadium: match.stadium,
            referee: match.refereeName,
            refereeId: match.refereeId,
            goalsHomeTeam: match.goalsHomeTeam,
            goalsAwayTeam: match.goalsAwayTeam,
          };
        });

        setMatches(convertedMatches);
      } catch (error) {
        console.error('Error creating match:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear el partido. Intenta nuevamente.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDays = getCalendarDays();
  const weekDays = getWeekDays();

  if (isLoading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDashboardClick}
                    className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 rounded-lg"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Volver al Panel
                  </Button>
                </div>
      
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-start">
                      <CalendarIcon className="w-8 h-8 mr-3 text-blue-600" />
                      Calendario de Partidos
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      Visualiza los partidos programados de todos tus torneos.
                    </p>
                  </div>
      
                  <Button
                    onClick={() => setIsScheduleDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Programar Partido
                  </Button>
                </div>
              </div>
            </div>
      
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {/* Filters */}
              <Card className="bg-white shadow-md border border-gray-200 rounded-2xl mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Filtrar por torneo
                        </Label>
                        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                          <SelectTrigger className="w-[250px] rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                            <SelectValue placeholder="Todos los torneos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los torneos</SelectItem>
                            {tournaments.map(tournament => (
                              <SelectItem key={tournament.id} value={String(tournament.id)}>
                                {tournament.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Vista</Label>
                        <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
                          <SelectTrigger className="w-[150px] rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">Mes</SelectItem>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="day">Día</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
      
                    <Button
                      variant="outline"
                      onClick={goToToday}
                      className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Hoy
                    </Button>
                  </div>
                </CardContent>
              </Card>
      
              {/* Calendar */}
              <Card className="bg-white shadow-md border border-gray-200 rounded-2xl">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                      <CalendarDays className="w-6 h-6 mr-3 text-blue-600" />
                      {view === 'month'
                        ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        : view === 'week'
                        ? `Semana del ${weekDays[0].getDate()} de ${monthNames[weekDays[0].getMonth()]} al ${weekDays[6].getDate()} de ${monthNames[weekDays[6].getMonth()]}`
                        : `${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (view === 'month') navigateMonth('prev');
                          else if (view === 'week') navigateWeek('prev');
                          else navigateDay('prev');
                        }}
                        className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (view === 'month') navigateMonth('next');
                          else if (view === 'week') navigateWeek('next');
                          else navigateDay('next');
                        }}
                        className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
      
                <CardContent className="p-6">
                  {view === 'month' && (
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day headers */}
                      {daysOfWeek.map(day => (
                        <div
                          key={day}
                          className="p-3 text-center text-sm font-semibold text-gray-500 border-b"
                        >
                          {day}
                        </div>
                      ))}
      
                      {/* Calendar days */}
                      {calendarDays.map((date, index) => {
                        const dayMatches = getMatchesForDate(date);
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);
                        const displayedMatches = dayMatches.slice(0, 3);
                        const moreMatches = dayMatches.length - 3;
      
                        return (
                          <div
                            key={index}
                            onClick={() => handleDayClick(date)}
                            className={`min-h-[140px] p-3 border border-gray-200 rounded-lg transition-all cursor-pointer ${
                              !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white hover:shadow-lg'
                            } ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}`}
                          >
                            <div
                              className={`text-sm font-bold mb-2 ${
                                isTodayDate
                                  ? 'text-blue-600'
                                  : isCurrentMonthDay
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }`}
                            >
                              {date.getDate()}
                            </div>
      
                            <div className="space-y-1">
                              {displayedMatches.map(match => (
                                <div
                                  key={match.id}
                                  onClick={(e) => handleMatchClick(match.id, e)}
                                  className="px-2 py-1 rounded-md cursor-pointer transition-all bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 hover:shadow-sm"
                                >
                                  <div className="text-xs font-semibold text-blue-900 leading-tight truncate">
                                    <span className="text-blue-700 font-bold">{match.time}</span> {match.homeTeam} vs{' '}
                                    {match.awayTeam}
                                  </div>
                                </div>
                              ))}
                              {moreMatches > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDayMatches(dayMatches);
                                    setIsDayModalOpen(true);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                                >
                                  +{moreMatches} más
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
      
                  {view === 'week' && (
                    <div className="space-y-4">
                      {weekDays.map(date => {
                        const dayMatches = getMatchesForDate(date);
                        const isTodayDate = isToday(date);
      
                        return (
                          <div
                            key={date.toISOString()}
                            className={`p-4 rounded-lg border ${
                              isTodayDate ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div
                              className={`font-bold mb-3 text-lg ${
                                isTodayDate ? 'text-blue-600' : 'text-gray-900'
                              }`}
                            >
                              {daysOfWeek[date.getDay()]} {date.getDate()} de{' '}
                              {monthNames[date.getMonth()]}
                            </div>
      
                            {dayMatches.length > 0 ? (
                              <div className="space-y-2">
                                {dayMatches.map(match => (
                                  <div
                                    key={match.id}
                                    onClick={(e) => handleMatchClick(match.id, e)}
                                    className="p-3 rounded-lg cursor-pointer transition-all bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400"
                                  >
                                    <div className="text-sm font-semibold text-gray-900">
                                      [{match.time}] {match.homeTeam} vs {match.awayTeam}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {match.stadium} • {match.referee}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">Sin partidos</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
      
                  {view === 'day' && (
                    <div>
                      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-900 mb-1">
                          {daysOfWeek[currentDate.getDay()]} {currentDate.getDate()} de{' '}
                          {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
                        </div>
                        {isToday(currentDate) && (
                          <span className="text-sm text-blue-700 font-medium">Hoy</span>
                        )}
                      </div>
      
                      {getMatchesForDate(currentDate).length > 0 ? (
                        <div className="space-y-3">
                          {getMatchesForDate(currentDate).map(match => (
                            <div
                              key={match.id}
                              onClick={(e) => handleMatchClick(match.id, e)}
                              className="p-4 rounded-lg cursor-pointer transition-all bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-lg font-bold text-gray-900 mb-2">
                                    {match.homeTeam} vs {match.awayTeam}
                                  </div>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                      {match.time}
                                    </div>
                                    <div>{match.stadium}</div>
                                    <div>Árbitro: {match.referee}</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  {match.tournament}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">Sin partidos programados para este día</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
      {/* El JSX permanece exactamente igual */}
      
      {/* Schedule Match Dialog - ACTUALIZADO */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Programar Partido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tournament */}
            <div>
              <Label htmlFor="tournament" className="text-sm font-medium text-gray-700">
                Torneo al cual pertenece el partido
              </Label>
              <Select value={newMatch.tournament} onValueChange={handleTournamentChange}>
                <SelectTrigger id="tournament" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar torneo" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map(tournament => (
                    <SelectItem key={tournament.id} value={String(tournament.id)}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Home Team */}
            <div>
              <Label htmlFor="homeTeam" className="text-sm font-medium text-gray-700">
                Equipo Local
              </Label>
              <Select
                value={newMatch.homeTeam}
                onValueChange={(value) => setNewMatch({ ...newMatch, homeTeam: value })}
                disabled={!newMatch.tournament}
              >
                <SelectTrigger id="homeTeam" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar equipo local" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTournamentTeams.map(team => (
                    <SelectItem key={team.id} value={team.name}>
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
                value={newMatch.awayTeam}
                onValueChange={(value) => setNewMatch({ ...newMatch, awayTeam: value })}
                disabled={!newMatch.homeTeam}
              >
                <SelectTrigger id="awayTeam" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar equipo visitante" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTournamentTeams
                    .filter(team => team.name !== newMatch.homeTeam)
                    .map(team => (
                      <SelectItem key={team.id} value={team.name}>
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
                value={newMatch.date}
                onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                min={getTodayDate()}
                className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
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
                value={newMatch.time}
                onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
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
                placeholder="Ingresar o seleccionar estadio"
                value={newMatch.stadium}
                onChange={(e) => setNewMatch({ ...newMatch, stadium: e.target.value })}
                className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            {/* Referee */}
            <div>
              <Label htmlFor="referee" className="text-sm font-medium text-gray-700">
                Árbitro
              </Label>
              <Select value={newMatch.referee} onValueChange={(value) => setNewMatch({ ...newMatch, referee: value })}>
                <SelectTrigger id="referee" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar árbitro" />
                </SelectTrigger>
                <SelectContent>
                  {referees.map(referee => (
                    <SelectItem key={referee.id} value={String(referee.id)}>
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
              onClick={() => {
                setIsScheduleDialogOpen(false);
                setNewMatch({
                  tournament: '',
                  homeTeam: '',
                  awayTeam: '',
                  date: '',
                  time: '',
                  stadium: '',
                  referee: ''
                });
              }}
              className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleScheduleMatch}
              disabled={
                !newMatch.tournament ||
                !newMatch.homeTeam ||
                !newMatch.awayTeam ||
                !newMatch.date ||
                !newMatch.time ||
                !newMatch.stadium ||
                !newMatch.referee ||
                isSaving
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar partido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Day Matches Modal */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Partidos del día
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedDayMatches.map(match => (
              <div
                key={match.id}
                onClick={(e) => {
                  handleMatchClick(match.id, e);
                  setIsDayModalOpen(false);
                }}
                className="p-4 rounded-lg cursor-pointer transition-all bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400"
              >
                <div className="text-sm font-bold text-gray-900 mb-1">
                  [{match.time}] {match.homeTeam} vs {match.awayTeam}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>{match.stadium}</div>
                  <div>Árbitro: {match.referee}</div>
                  <div className="text-blue-700 font-medium mt-2">{match.tournament}</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}