import { useState, useMemo } from 'react';
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

interface CalendarMatch {
  id: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  referee: string;
}

interface Tournament {
  id: string;
  name: string;
  teams: string[];
}

interface Team {
  name: string;
}

interface Referee {
  id: string;
  name: string;
}

const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Liga Nacional de Fútbol 2025',
    teams: [
      'Los Tigres FC', 'Águilas Doradas', 'Dragones Azules', 'Leones Rojos',
      'Halcones FC', 'Cóndores Unidos', 'Pumas Blancos', 'Jaguares Negros',
      'Serpientes Verdes', 'Lobos Grises', 'Delfines Azules', 'Tiburones FC'
    ]
  },
  {
    id: '2',
    name: 'Copa Ciudad Primavera',
    teams: [
      'Halcones FC', 'Cóndores Unidos', 'Búhos Nocturnos', 'Águilas Reales',
      'Zorros Plateados', 'Osos Pardos', 'Pumas Blancos', 'Jaguares Negros'
    ]
  },
  {
    id: '3',
    name: 'Liga Juvenil 2025',
    teams: [
      'Pumas Blancos', 'Jaguares Negros', 'Búhos Nocturnos', 'Águilas Reales',
      'Zorros Plateados', 'Osos Pardos', 'Leones Rojos', 'Serpientes Verdes'
    ]
  }
];

const mockMatches: CalendarMatch[] = [
  {
    id: '1',
    tournament: 'Liga Nacional de Fútbol 2025',
    homeTeam: 'Los Tigres FC',
    awayTeam: 'Águilas Doradas',
    date: '2025-08-20',
    time: '15:00',
    stadium: 'Estadio Nacional',
    referee: 'Antonio Mateu Lahoz'
  },
  {
    id: '2',
    tournament: 'Liga Nacional de Fútbol 2025',
    homeTeam: 'Dragones Azules',
    awayTeam: 'Leones Rojos',
    date: '2025-08-20',
    time: '18:30',
    stadium: 'Arena Central',
    referee: 'José Luis Munuera'
  },
  {
    id: '3',
    tournament: 'Copa Ciudad Primavera',
    homeTeam: 'Halcones FC',
    awayTeam: 'Cóndores Unidos',
    date: '2025-08-22',
    time: '16:00',
    stadium: 'Coliseo Deportivo',
    referee: 'Carlos del Cerro'
  },
  {
    id: '4',
    tournament: 'Liga Juvenil 2025',
    homeTeam: 'Pumas Blancos',
    awayTeam: 'Jaguares Negros',
    date: '2025-08-24',
    time: '19:30',
    stadium: 'Estadio Municipal',
    referee: 'Alejandro Hernández'
  },
  {
    id: '5',
    tournament: 'Liga Nacional de Fútbol 2025',
    homeTeam: 'Serpientes Verdes',
    awayTeam: 'Lobos Grises',
    date: '2025-08-26',
    time: '17:00',
    stadium: 'Campo Norte',
    referee: 'Ricardo de Burgos'
  },
  {
    id: '6',
    tournament: 'Copa Ciudad Primavera',
    homeTeam: 'Delfines Azules',
    awayTeam: 'Tiburones FC',
    date: '2025-08-28',
    time: '20:00',
    stadium: 'Complejo Deportivo',
    referee: 'Jesús Gil Manzano'
  },
  {
    id: '7',
    tournament: 'Liga Nacional de Fútbol 2025',
    homeTeam: 'Halcones FC',
    awayTeam: 'Pumas Blancos',
    date: '2025-08-20',
    time: '21:00',
    stadium: 'Estadio Central',
    referee: 'Miguel Carvajal'
  }
];

const mockReferees: Referee[] = [
  { id: '1', name: 'Antonio Mateu Lahoz' },
  { id: '2', name: 'José Luis Munuera' },
  { id: '3', name: 'Alejandro Hernández' },
  { id: '4', name: 'Ricardo de Burgos' },
  { id: '5', name: 'Carlos del Cerro' },
  { id: '6', name: 'Jesús Gil Manzano' },
  { id: '7', name: 'Miguel Carvajal' },
  { id: '8', name: 'Fernando Guadalupe' }
];

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type ViewType = 'month' | 'week' | 'day';

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 20)); // August 20, 2025
  const [view, setView] = useState<ViewType>('month');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedDayMatches, setSelectedDayMatches] = useState<CalendarMatch[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [matches, setMatches] = useState<CalendarMatch[]>(mockMatches);

  const [newMatch, setNewMatch] = useState({
    tournament: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    stadium: '',
    referee: ''
  });

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
      const tournamentMatch =
        selectedTournament === 'all' ||
        mockTournaments.find(t => t.id === selectedTournament)?.name === match.tournament;
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

  const handleScheduleMatch = () => {
    if (
      newMatch.tournament &&
      newMatch.homeTeam &&
      newMatch.awayTeam &&
      newMatch.date &&
      newMatch.time &&
      newMatch.stadium &&
      newMatch.referee
    ) {
      const tournament = mockTournaments.find(t => t.id === newMatch.tournament);
      const match: CalendarMatch = {
        id: String(matches.length + 1),
        tournament: tournament?.name || '',
        homeTeam: newMatch.homeTeam,
        awayTeam: newMatch.awayTeam,
        date: newMatch.date,
        time: newMatch.time,
        stadium: newMatch.stadium,
        referee: mockReferees.find(r => r.id === newMatch.referee)?.name || ''
      };
      setMatches([...matches, match]);
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
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const selectedTournamentData = mockTournaments.find(
    t => t.id === newMatch.tournament
  );

  const availableTeams = selectedTournamentData?.teams || [];

  const calendarDays = getCalendarDays();
  const weekDays = getWeekDays();

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
                      {mockTournaments.map(tournament => (
                        <SelectItem key={tournament.id} value={tournament.id}>
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

      {/* Schedule Match Dialog */}
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
              <Select value={newMatch.tournament} onValueChange={(value) => {
                setNewMatch({ ...newMatch, tournament: value, homeTeam: '', awayTeam: '' });
              }}>
                <SelectTrigger id="tournament" className="rounded-lg border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                  <SelectValue placeholder="Seleccionar torneo" />
                </SelectTrigger>
                <SelectContent>
                  {mockTournaments.map(tournament => (
                    <SelectItem key={tournament.id} value={tournament.id}>
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
                  {availableTeams.map(team => (
                    <SelectItem key={team} value={team}>
                      {team}
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
                  {availableTeams
                    .filter(team => team !== newMatch.homeTeam)
                    .map(team => (
                      <SelectItem key={team} value={team}>
                        {team}
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
                  {mockReferees.map(referee => (
                    <SelectItem key={referee.id} value={referee.id}>
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
                !newMatch.referee
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar partido
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
