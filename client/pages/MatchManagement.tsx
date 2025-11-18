import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, X, MapPin, Calendar, Clock, User, Target, RefreshCw } from 'lucide-react';

interface MatchData {
  id: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  homePosition?: number;
  awayPosition?: number;
  date: string;
  time: string;
  stadium: string;
  referee: string;
  homeScore: number;
  awayScore: number;
}

interface Player {
  id: string;
  name: string;
  team: 'home' | 'away';
}

interface MatchEvent {
  id: string;
  minute: number;
  player: string;
  type: 'goal' | 'yellow' | 'red';
  team: 'home' | 'away';
}

// Mock data
const mockMatch: MatchData = {
  id: '1',
  tournament: 'Liga Nacional de Fútbol 2024',
  homeTeam: 'Real Madrid CF',
  awayTeam: 'FC Barcelona',
  homePosition: 1,
  awayPosition: 2,
  date: '2024-12-20',
  time: '16:00',
  stadium: 'Santiago Bernabéu',
  referee: 'Antonio Mateu Lahoz',
  homeScore: 2,
  awayScore: 1
};

const mockPlayers: Player[] = [
  { id: '1', name: 'Karim Benzema', team: 'home' },
  { id: '2', name: 'Vinícius Jr.', team: 'home' }
];

const mockEvents: MatchEvent[] = [
  { id: '1', minute: 15, player: 'Vinícius Jr.', type: 'goal', team: 'home' },
  { id: '2', minute: 32, player: 'Robert Lewandowski', type: 'goal', team: 'away' }
];

const eventTypeOptions = [
  { value: 'goal', label: 'Gol ⚽', icon: '⚽' },
  { value: 'yellow', label: 'Tarjeta Amarilla 🟨', icon: '🟨' },
  { value: 'red', label: 'Tarjeta Roja 🟥', icon: '🟥' }
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'goal': return '⚽';
    case 'yellow': return '🟨';
    case 'red': return '🟥';
    default: return '';
  }
};

const getEventLabel = (type: string) => {
  switch (type) {
    case 'goal': return 'Gol';
    case 'yellow': return 'Tarjeta Amarilla';
    case 'red': return 'Tarjeta Roja';
    default: return '';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

export default function MatchManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for match data
  const [match, setMatch] = useState(mockMatch);
  const [events, setEvents] = useState(mockEvents);

  // State for rescheduling
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: match.date,
    time: match.time,
    stadium: match.stadium,
    referee: match.referee
  });
  const [dateWarning, setDateWarning] = useState('');

  // State for new event form
  const [newEvent, setNewEvent] = useState({
    minute: '',
    player: '',
    type: ''
  });

  const handleScoreUpdate = (team: 'home' | 'away', score: number) => {
    setMatch(prev => ({
      ...prev,
      [team === 'home' ? 'homeScore' : 'awayScore']: score
    }));
  };

  const handleAddEvent = () => {
    if (newEvent.minute && newEvent.player && newEvent.type) {
      const player = mockPlayers.find(p => p.id === newEvent.player);
      if (player) {
        const event: MatchEvent = {
          id: Date.now().toString(),
          minute: parseInt(newEvent.minute),
          player: player.name,
          type: newEvent.type as 'goal' | 'yellow' | 'red',
          team: player.team
        };

        setEvents(prev => [...prev, event].sort((a, b) => a.minute - b.minute));
        setNewEvent({ minute: '', player: '', type: '' });
      }
    }
  };

  const handleRescheduleUpdate = (field: string, value: string) => {
    setRescheduleData(prev => ({ ...prev, [field]: value }));

    // Check for past date warning
    if (field === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setDateWarning('No se puede asignar una fecha pasada');
      } else {
        setDateWarning('');
      }
    }
  };

  const handleRescheduleMatch = () => {
    if (dateWarning) return;

    setMatch(prev => ({
      ...prev,
      date: rescheduleData.date,
      time: rescheduleData.time,
      stadium: rescheduleData.stadium,
      referee: rescheduleData.referee
    }));

    setIsRescheduling(false);
    console.log('Match rescheduled:', rescheduleData);
    // Here you would typically call an API to update the match and calendar
  };

  const isMatchFinalized = match.homeScore > 0 || match.awayScore > 0;

  const handleTeamClick = (team: string) => {
    // Navigate to team detail (HU-14)
    console.log('Navegar a detalle del equipo:', team);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Partidos
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Administra resultados y eventos del partido
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Sección de Información del Partido */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Información del Partido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tournament */}
            <div>
              <Label className="text-sm font-medium text-gray-500">Torneo</Label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{match.tournament}</p>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Equipo Local</Label>
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleTeamClick(match.homeTeam)}
                >
                  <p className="font-semibold text-gray-900">{match.homeTeam}</p>
                  {match.homePosition && (
                    <Badge variant="outline" className="mt-1">
                      Posición: {match.homePosition}°
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold text-primary">VS</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Equipo Visitante</Label>
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleTeamClick(match.awayTeam)}
                >
                  <p className="font-semibold text-gray-900">{match.awayTeam}</p>
                  {match.awayPosition && (
                    <Badge variant="outline" className="mt-1">
                      Posición: {match.awayPosition}°
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="matchDate" className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 text-primary mr-2" />
                  Fecha
                </Label>
                {isRescheduling && !isMatchFinalized ? (
                  <div className="space-y-2">
                    <Input
                      id="matchDate"
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) => handleRescheduleUpdate('date', e.target.value)}
                      className="rounded-lg"
                    />
                    {dateWarning && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-600 text-sm">
                          {dateWarning}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${isMatchFinalized ? 'text-gray-500' : 'text-gray-900'}`}>
                    {formatDate(match.date)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchTime" className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 text-primary mr-2" />
                  Hora
                </Label>
                {isRescheduling && !isMatchFinalized ? (
                  <Input
                    id="matchTime"
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => handleRescheduleUpdate('time', e.target.value)}
                    className="rounded-lg"
                  />
                ) : (
                  <p className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${isMatchFinalized ? 'text-gray-500' : 'text-gray-900'}`}>
                    {match.time}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchStadium" className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 text-primary mr-2" />
                  Estadio
                </Label>
                {isRescheduling && !isMatchFinalized ? (
                  <Input
                    id="matchStadium"
                    type="text"
                    value={rescheduleData.stadium}
                    onChange={(e) => handleRescheduleUpdate('stadium', e.target.value)}
                    className="rounded-lg"
                  />
                ) : (
                  <p className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${isMatchFinalized ? 'text-gray-500' : 'text-gray-900'}`}>
                    {match.stadium}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchReferee" className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 text-primary mr-2" />
                  Árbitro
                </Label>
                {isRescheduling && !isMatchFinalized ? (
                  <Input
                    id="matchReferee"
                    type="text"
                    value={rescheduleData.referee}
                    onChange={(e) => handleRescheduleUpdate('referee', e.target.value)}
                    className="rounded-lg"
                  />
                ) : (
                  <p className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${isMatchFinalized ? 'text-gray-500' : 'text-gray-900'}`}>
                    {match.referee}
                  </p>
                )}
              </div>
            </div>

            {/* Reschedule Button */}
            <div className="pt-6 border-t">
              {isRescheduling ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleRescheduleMatch}
                    disabled={!!dateWarning || !rescheduleData.date || !rescheduleData.time || !rescheduleData.stadium || !rescheduleData.referee}
                    className="bg-primary hover:bg-primary/90 text-white rounded-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Confirmar Reprogramación
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRescheduling(false);
                      setRescheduleData({
                        date: match.date,
                        time: match.time,
                        stadium: match.stadium,
                        referee: match.referee
                      });
                      setDateWarning('');
                    }}
                    className="rounded-lg"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsRescheduling(true)}
                  disabled={isMatchFinalized}
                  className={`bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg ${
                    isMatchFinalized ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reprogramar partido
                </Button>
              )}

              {isMatchFinalized && (
                <Alert className="mt-3 border-gray-200 bg-gray-50">
                  <AlertDescription className="text-gray-600 text-sm">
                    No se puede reprogramar un partido que ya tiene resultado registrado.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección Marcador */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Marcador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="homeScore">Goles {match.homeTeam}</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={match.homeScore}
                  onChange={(e) => handleScoreUpdate('home', parseInt(e.target.value) || 0)}
                  className="text-center text-2xl font-bold"
                />
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400 mb-4">-</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayScore">Goles {match.awayTeam}</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={match.awayScore}
                  onChange={(e) => handleScoreUpdate('away', parseInt(e.target.value) || 0)}
                  className="text-center text-2xl font-bold"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button 
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  console.log('Actualizar marcador:', match.homeScore, '-', match.awayScore);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Actualizar marcador
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección de Eventos - Formulario */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Registrar Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Jugador</Label>
                <Select value={newEvent.player} onValueChange={(value) => setNewEvent(prev => ({ ...prev, player: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jugador" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {match.homeTeam}
                    </div>
                    {mockPlayers.filter(p => p.team === 'home').map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t mt-2 pt-2">
                      {match.awayTeam}
                    </div>
                    {mockPlayers.filter(p => p.team === 'away').map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minute">Minuto</Label>
                <Input
                  id="minute"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Ej: 45"
                  value={newEvent.minute}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, minute: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleAddEvent}
                disabled={!newEvent.minute || !newEvent.player || !newEvent.type}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Target className="w-4 h-4 mr-2" />
                Agregar evento
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Eventos */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Eventos del Partido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay eventos registrados
                  </p>
                ) : (
                  events.map(event => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                          {event.minute}'
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{event.player}</p>
                          <p className="text-sm text-gray-500">
                            {getEventIcon(event.type)} {getEventLabel(event.type)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={event.team === 'home' ? 'border-blue-500 text-blue-700' : 'border-red-500 text-red-700'}
                      >
                        {event.team === 'home' ? match.homeTeam : match.awayTeam}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Principales */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate(-1)}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                onClick={() => {
                  console.log('Guardar cambios del partido');
                  // Handle save logic here
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
