import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';

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
}

// Mock data
const mockTournaments: Tournament[] = [
  { id: '1', name: 'Liga Nacional de Fútbol 2025' },
  { id: '2', name: 'Copa Ciudad Primavera' },
  { id: '3', name: 'Liga Juvenil 2025' }
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
  }
];

const mockTeams = [
  'Los Tigres FC', 'Águilas Doradas', 'Dragones Azules', 'Leones Rojos',
  'Halcones FC', 'Cóndores Unidos', 'Pumas Blancos', 'Jaguares Negros',
  'Serpientes Verdes', 'Lobos Grises', 'Delfines Azules', 'Tiburones FC',
  'Búhos Nocturnos', 'Águilas Reales', 'Zorros Plateados', 'Osos Pardos'
];

const mockReferees = [
  'Antonio Mateu Lahoz', 'José Luis Munuera', 'Alejandro Hernández',
  'Ricardo de Burgos', 'Carlos del Cerro', 'Jesús Gil Manzano'
];

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type ViewType = 'month' | 'week';

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // August 2025
  const [view, setView] = useState<ViewType>('month');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state for new match
  const [newMatch, setNewMatch] = useState({
    tournament: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    stadium: '',
    referee: ''
  });

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

  const getCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getMatchesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return mockMatches.filter(match => {
      const matchDate = match.date;
      const tournamentMatch = selectedTournament === 'all' || 
        mockTournaments.find(t => t.id === selectedTournament)?.name === match.tournament;
      return matchDate === dateString && tournamentMatch;
    });
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/actualizar-partido/${matchId}`);
  };

  const handleScheduleMatch = () => {
    // In a real app, this would submit to the backend
    console.log('Scheduling new match:', newMatch);
    setIsModalOpen(false);
    setNewMatch({
      tournament: '',
      homeTeam: '',
      awayTeam: '',
      date: '',
      time: '',
      stadium: '',
      referee: ''
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Calendario de Partidos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona y visualiza todos los partidos programados
              </p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Programar partido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Programar Nuevo Partido</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tournament" className="text-sm font-medium text-gray-700">Torneo</Label>
                    <Select value={newMatch.tournament} onValueChange={(value) => setNewMatch(prev => ({ ...prev, tournament: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar torneo" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTournaments.map(tournament => (
                          <SelectItem key={tournament.id} value={tournament.name}>
                            {tournament.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="homeTeam" className="text-sm font-medium text-gray-700">Equipo Local</Label>
                      <Select value={newMatch.homeTeam} onValueChange={(value) => setNewMatch(prev => ({ ...prev, homeTeam: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo local" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTeams.map(team => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="awayTeam" className="text-sm font-medium text-gray-700">Equipo Visitante</Label>
                      <Select value={newMatch.awayTeam} onValueChange={(value) => setNewMatch(prev => ({ ...prev, awayTeam: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo visitante" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTeams.filter(team => team !== newMatch.homeTeam).map(team => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newMatch.date}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm font-medium text-gray-700">Hora</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newMatch.time}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stadium" className="text-sm font-medium text-gray-700">Estadio</Label>
                    <Input
                      id="stadium"
                      placeholder="Nombre del estadio o cancha"
                      value={newMatch.stadium}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, stadium: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referee" className="text-sm font-medium text-gray-700">Árbitro</Label>
                    <Input
                      id="referee"
                      placeholder="Nombre del árbitro"
                      value={newMatch.referee}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, referee: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleScheduleMatch}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white shadow-lg"
                    style={{ backgroundColor: '#2563eb' }}
                  >
                    Guardar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <Card className="bg-white shadow-sm border-0 rounded-xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Filtrar por torneo</Label>
                  <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                    <SelectTrigger className="w-[250px]">
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
                  <Label className="text-sm font-medium text-gray-600">Vista</Label>
                  <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mes</SelectItem>
                      <SelectItem value="week">Semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" onClick={goToToday}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Hoy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <CalendarDays className="w-6 h-6 mr-3 text-primary" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {daysOfWeek.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 border-b">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                const matches = getMatchesForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[140px] max-h-[200px] p-2 border border-gray-200 ${
                      !isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isTodayDate ? 'bg-blue-50 border-primary' : ''}`}
                  >
                    <div className={`text-sm font-bold mb-2 text-center ${
                      isTodayDate ? 'text-primary' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {matches.map(match => (
                        <div
                          key={match.id}
                          onClick={() => handleMatchClick(match.id)}
                          className="px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200 border border-blue-200 hover:border-blue-400 hover:shadow-md transform hover:scale-[1.02]"
                          style={{
                            backgroundColor: '#dbeafe'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#bfdbfe';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                          }}
                        >
                          <div className="text-xs font-semibold text-black leading-tight">
                            [{match.time}] {match.homeTeam} vs {match.awayTeam}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
