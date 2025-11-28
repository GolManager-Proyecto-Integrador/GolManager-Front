import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Save, X, MapPin, Calendar, Clock, User, Target, RefreshCw, Loader2, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getMatchDetails,
  getTournamentPositions,
  getMatchEvents,
  createGoal,
  updateGoal,
  deleteGoal,
  createCard,
  updateCard,
  deleteCard,
} from '@/services/matchManagementService';

interface MatchData {
  id: number;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
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
  id: number;
  name: string;
  team: 'home' | 'away';
}

interface MatchEvent {
  id: number;
  minute: number;
  player: string;
  playerId: number;
  type: 'goal' | 'yellow' | 'red';
  team: 'home' | 'away';
}

interface Position {
  teamId: number;
  teamName: string;
  position: number;
}


const eventTypeOptions = [
  { value: 'goal', label: 'Gol ⚽', icon: '⚽' },
  { value: 'yellow', label: 'Tarjeta Amarilla 🟨', icon: '🟨' },
  { value: 'red', label: 'Tarjeta Roja 🟥', icon: '🟥' },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'goal':
      return '⚽';
    case 'yellow':
      return '🟨';
    case 'red':
      return '🟥';
    default:
      return '';
  }
};

const getEventLabel = (type: string) => {
  switch (type) {
    case 'goal':
      return 'Gol';
    case 'yellow':
      return 'Tarjeta Amarilla';
    case 'red':
      return 'Tarjeta Roja';
    default:
      return '';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export default function MatchManagement() {

  useEffect(() => {
    document.title = `Gestión de Partido`;
  }, );


  const { tournamentId, matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for match data
  const [match, setMatch] = useState<MatchData | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [positions, setPositions] = useState<Record<number, Position>>({});
  const [players, setPlayers] = useState<Player[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for rescheduling
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    stadium: '',
    referee: '',
  });
  const [dateWarning, setDateWarning] = useState('');

  // State for new event form
  const [newEvent, setNewEvent] = useState({
    minute: '',
    player: '',
    type: '',
    cardColor: 'YELLOW' as 'RED' | 'YELLOW',
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // State for deleting events
  const [isDeletingEventId, setIsDeletingEventId] = useState<number | null>(null);

  // State for editing events
  const [isEditingEvent, setIsEditingEvent] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);
  const [editFormData, setEditFormData] = useState({
    minute: '',
    player: '',
    cardColor: 'YELLOW' as 'RED' | 'YELLOW',
  });

  // Fetch match details and events on component mount
  useEffect(() => {
    const loadMatchData = async () => {
      if (!matchId || !tournamentId) {
        setError('Match ID or Tournament ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const matchIdNum = parseInt(matchId);
        const tournamentIdNum = parseInt(tournamentId);

        const [matchDetailsData, eventsData, positionsData] = await Promise.all([
          getMatchDetails(tournamentIdNum, matchIdNum),
          getMatchEvents(tournamentIdNum, matchIdNum),
          getTournamentPositions(tournamentIdNum),
        ]);

// Fix backend naming → Adapt to frontend structure
let raw = matchDetailsData.matchDateTIme;

let fixedDate = "";
let fixedTime = "";

// Si viene null, undefined o vacío → no intentar formatear
if (raw && typeof raw === "string") {
  
  // Si viene con espacio en vez de T → corregir
  if (raw.includes(" ")) {
    raw = raw.replace(" ", "T");
  }

  const dateObj = new Date(raw);

  if (!isNaN(dateObj.getTime())) {
    fixedDate = raw.split("T")[0];
    fixedTime = raw.split("T")[1]?.substring(0, 5) || "";
  }
}

console.log("FECHA PROCESADA →", { raw, fixedDate, fixedTime });


setMatch({
  id: matchDetailsData.matchId,
  tournamentId: matchDetailsData.tournamentId,

  homeTeamId: matchDetailsData.homeTeamId,
  awayTeamId: matchDetailsData.awayTeamId,
  homeTeam: matchDetailsData.homeTeam,
  awayTeam: matchDetailsData.awayTeam,

  date: fixedDate,
  time: fixedTime,
  stadium: matchDetailsData.stadium,
  referee: matchDetailsData.refereeName,

  homeScore: matchDetailsData.goalsHomeTeam ?? 0,
  awayScore: matchDetailsData.goalsAwayTeam ?? 0,
});

// initial reschedule data
setRescheduleData({
  date: fixedDate,
  time: fixedTime,
  stadium: matchDetailsData.stadium,
  referee: matchDetailsData.refereeName,
});


        // Build positions map
        const positionsMap: Record<number, Position> = {};
        if (positionsData.positions && Array.isArray(positionsData.positions)) {
          positionsData.positions.forEach((pos: any) => {
            positionsMap[pos.teamId] = pos;
          });
        }
        setPositions(positionsMap);

        // Set events (merge goals and cards)
        const allEvents: MatchEvent[] = [];
        if (eventsData.listGoals && Array.isArray(eventsData.listGoals)) {
          eventsData.listGoals.forEach((goal: any) => {
            allEvents.push({
              id: goal.goalId,
              minute: goal.minute,
              player: goal.playerTeamName || goal.player,
              playerId: goal.playerId,
              type: 'goal',
              team: goal.teamId === matchDetailsData.homeTeamId ? 'home' : 'away',
            });
          });
        }
        if (eventsData.listCards && Array.isArray(eventsData.listCards)) {
          eventsData.listCards.forEach((card: any) => {
            allEvents.push({
              id: card.cardId,
              minute: card.minute,
              player: card.playerTeamName || card.player,
              playerId: card.playerId,
              type: card.cardColor === 'RED' ? 'red' : 'yellow',
              team: card.teamId === matchDetailsData.homeTeamId ? 'home' : 'away',
            });
          });
        }
        setEvents(allEvents.sort((a, b) => a.minute - b.minute));

        // Build players list from match details
        const allPlayers: Player[] = [];
        if (matchDetailsData.homeTeamPlayers && Array.isArray(matchDetailsData.homeTeamPlayers)) {
          matchDetailsData.homeTeamPlayers.forEach((player: any) => {
            allPlayers.push({
              id: player.id,
              name: player.name,
              team: 'home',
            });
          });
        }
        if (matchDetailsData.awayTeamPlayers && Array.isArray(matchDetailsData.awayTeamPlayers)) {
          matchDetailsData.awayTeamPlayers.forEach((player: any) => {
            allPlayers.push({
              id: player.id,
              name: player.name,
              team: 'away',
            });
          });
        }
        setPlayers(allPlayers);
      } catch (err) {
        console.error('Error loading match data:', err);
        setError(err instanceof Error ? err.message : 'Error loading match data');
        toast({
          title: 'Error',
          description: 'Failed to load match data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchData();
  }, [matchId, tournamentId, toast]);

  // Calculate scores from goals
  const calculateScores = (eventsList: MatchEvent[]) => {
    const goals = eventsList.filter((e) => e.type === 'goal');
    const homeGoals = goals.filter((g) => g.team === 'home').length;
    const awayGoals = goals.filter((g) => g.team === 'away').length;
    return { homeGoals, awayGoals };
  };

  // Validate form fields
  const validateEventForm = (minute: string, player: string, type: string, cardColor?: string): string[] => {
    const errors: string[] = [];

    if (!minute || isNaN(parseInt(minute))) {
      errors.push('Minuto debe ser un número válido');
    } else {
      const minuteNum = parseInt(minute);
      if (minuteNum < 1 || minuteNum > 120) {
        errors.push('Minuto debe estar entre 1 y 120');
      }
    }

    if (!player) {
      errors.push('Debe seleccionar un jugador');
    }

    if (!type) {
      errors.push('Debe seleccionar un tipo de evento');
    }

    if ((type === 'yellow' || type === 'red') && !cardColor) {
      errors.push('Debe seleccionar color de tarjeta');
    }

    return errors;
  };

  const handleScoreUpdate = (team: 'home' | 'away', score: number) => {
    if (match) {
      setMatch((prev) =>
        prev
          ? {
              ...prev,
              [team === 'home' ? 'homeScore' : 'awayScore']: score,
            }
          : prev
      );
    }
  };

  const handleAddEvent = async () => {
    const validationErrors = validateEventForm(
      newEvent.minute,
      newEvent.player,
      newEvent.type,
      newEvent.type !== 'goal' ? newEvent.cardColor : undefined
    );

    if (validationErrors.length > 0) {
      toast({
        title: 'Validación Error',
        description: validationErrors[0],
        variant: 'destructive',
      });
      return;
    }

    if (!match) {
      return;
    }

    try {
      setIsAddingEvent(true);
      const player = players.find((p) => p.id === parseInt(newEvent.player));
      if (!player) {
        throw new Error('Jugador no encontrado');
      }

      const minute = parseInt(newEvent.minute);
      const playerId = parseInt(newEvent.player);
      const tournamentIdNum = match.tournamentId;
      const matchIdNum = match.id;

      if (newEvent.type === 'goal') {
        const goalData = await createGoal(tournamentIdNum, {
          matchId: matchIdNum,
          playerId,
          goalMinute: minute,
        });

        const newGoalEvent: MatchEvent = {
          id: goalData.goalId,
          minute: goalData.minute,
          player: goalData.playerTeamName,
          playerId: goalData.playerId,
          type: 'goal',
          team: goalData.playerTeamId === match.homeTeamId ? 'home' : 'away',
        };

        const updatedEvents = [...events, newGoalEvent].sort((a, b) => a.minute - b.minute) as MatchEvent[];
        setEvents(updatedEvents);

        // Update scores based on goals
        const scores = calculateScores(updatedEvents);
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                homeScore: scores.homeGoals,
                awayScore: scores.awayGoals,
              }
            : prev
        );

        toast({
          title: 'Éxito',
          description: 'Gol registrado correctamente',
        });
      } else {
        const cardData = await createCard(tournamentIdNum, {
          matchId: matchIdNum,
          playerId,
          cardMinute: minute,
          cardColor: newEvent.cardColor,
        });

        const newCardEvent: MatchEvent = {
          id: cardData.cardId,
          minute: cardData.minute,
          player: cardData.playerTeamName,
          playerId: cardData.playerId,
          type: cardData.cardColor === 'RED' ? 'red' : 'yellow',
          team: cardData.playerTeamId === match.homeTeamId ? 'home' : 'away',
        };

        setEvents((prev) => [...prev, newCardEvent].sort((a, b) => a.minute - b.minute) as MatchEvent[]);

        toast({
          title: 'Éxito',
          description: 'Tarjeta registrada correctamente',
        });
      }

      setNewEvent({ minute: '', player: '', type: '', cardColor: 'YELLOW' });
    } catch (err) {
      console.error('Error agregando evento:', err);
      toast({
        title: 'Error',
        description: 'No se pudo agregar el evento',
        variant: 'destructive',
      });
    } finally {
      setIsAddingEvent(false);
    }
  };

  const handleOpenEditDialog = (event: MatchEvent) => {
    setEditingEvent(event);
    setEditFormData({
      minute: event.minute.toString(),
      player: event.playerId.toString(),
      cardColor: event.type === 'red' ? 'RED' : 'YELLOW',
    });
    setIsEditingEvent(event.id);
  };

  const handleEditEvent = async () => {
    if (!editingEvent || !match) {
      return;
    }

    const validationErrors = validateEventForm(
      editFormData.minute,
      editFormData.player,
      editingEvent.type,
      editingEvent.type !== 'goal' ? editFormData.cardColor : undefined
    );

    if (validationErrors.length > 0) {
      toast({
        title: 'Validación Error',
        description: validationErrors[0],
        variant: 'destructive',
      });
      return;
    }

    try {
      const player = players.find((p) => p.id === parseInt(editFormData.player));
      if (!player) {
        throw new Error('Jugador no encontrado');
      }

      const minute = parseInt(editFormData.minute);
      const playerId = parseInt(editFormData.player);
      const tournamentIdNum = match.tournamentId;

      if (editingEvent.type === 'goal') {
        await updateGoal(tournamentIdNum, editingEvent.id, {
          matchId: match.id,
          playerId,
          goalMinute: minute,
        });

        const updatedEvents = events
          .map((e) =>
            e.id === editingEvent.id
              ? {
                  ...e,
                  minute,
                  player: player.name,
                  playerId,
                }
              : e
          )
          .sort((a, b) => a.minute - b.minute) as MatchEvent[];

        setEvents(updatedEvents);

        // Update scores based on goals
        const scores = calculateScores(updatedEvents);
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                homeScore: scores.homeGoals,
                awayScore: scores.awayGoals,
              }
            : prev
        );

        toast({
          title: 'Éxito',
          description: 'Gol actualizado correctamente',
        });
      } else {
        await updateCard(tournamentIdNum, editingEvent.id, {
          matchId: match.id,
          playerId,
          cardMinute: minute,
          cardColor: editFormData.cardColor,
        });

        const updatedEvents = events
          .map((e) =>
            e.id === editingEvent.id
              ? {
                  ...e,
                  minute,
                  player: player.name,
                  playerId,
                  type: editFormData.cardColor === 'RED' ? 'red' : 'yellow',
                }
              : e
          )
          .sort((a, b) => a.minute - b.minute) as MatchEvent[];

        setEvents(updatedEvents);

        toast({
          title: 'Éxito',
          description: 'Tarjeta actualizada correctamente',
        });
      }

      setIsEditingEvent(null);
      setEditingEvent(null);
    } catch (err) {
      console.error('Error editando evento:', err);
      toast({
        title: 'Error',
        description: 'No se pudo editar el evento',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (event: MatchEvent) => {
    if (!match) return;

    try {
      setIsDeletingEventId(event.id);
      const tournamentIdNum = match.tournamentId;

      if (event.type === 'goal') {
        await deleteGoal(tournamentIdNum, event.id);
      } else {
        await deleteCard(tournamentIdNum, event.id);
      }

      const updatedEvents = events.filter((e) => e.id !== event.id);
      setEvents(updatedEvents);

      // Recalculate scores if a goal was deleted
      if (event.type === 'goal') {
        const scores = calculateScores(updatedEvents);
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                homeScore: scores.homeGoals,
                awayScore: scores.awayGoals,
              }
            : prev
        );
      }

      toast({
        title: 'Éxito',
        description: 'Evento eliminado correctamente',
      });
    } catch (err) {
      console.error('Error eliminando evento:', err);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el evento',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingEventId(null);
    }
  };

  const handleRescheduleUpdate = (field: string, value: string) => {
    setRescheduleData((prev) => ({ ...prev, [field]: value }));

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
    if (dateWarning || !match) return;

    setMatch({
      ...match,
      date: rescheduleData.date,
      time: rescheduleData.time,
      stadium: rescheduleData.stadium,
      referee: rescheduleData.referee,
    });

    setIsRescheduling(false);
    toast({
      title: 'Éxito',
      description: 'Partido reprogramado correctamente',
    });
  };

  const handleSaveChanges = async () => {
    if (!match) return;

    try {
      toast({
        title: 'Éxito',
        description: 'Cambios guardados correctamente',
      });
    } catch (err) {
      console.error('Error guardando cambios:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    }
  };

  const isMatchFinalized = match ? match.homeScore > 0 || match.awayScore > 0 : false;

  const handleTeamClick = (team: string) => {
    console.log('Navegar a detalle del equipo:', team);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-600">Cargando datos del partido...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error || 'No se pudieron cargar los datos del partido'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Partidos</h1>
                <p className="mt-1 text-sm text-gray-500">Administra resultados y eventos del partido</p>
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
              <p className="text-lg font-semibold text-gray-900 mt-1">{match.tournamentId}</p>
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
                  {positions[match.homeTeamId] && (
                    <Badge variant="outline" className="mt-1">
                      Posición: {positions[match.homeTeamId].position}°
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
                  {positions[match.awayTeamId] && (
                    <Badge variant="outline" className="mt-1">
                      Posición: {positions[match.awayTeamId].position}°
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
                        <AlertDescription className="text-red-600 text-sm">{dateWarning}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p
                    className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${
                      isMatchFinalized ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
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
                  <p
                    className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${
                      isMatchFinalized ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
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
                  <p
                    className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${
                      isMatchFinalized ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
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
                  <p
                    className={`text-lg font-medium p-2 rounded-lg bg-gray-50 ${
                      isMatchFinalized ? 'text-gray-500' : 'text-gray-900'
                    }`}
                  >
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
                    disabled={
                      !!dateWarning ||
                      !rescheduleData.date ||
                      !rescheduleData.time ||
                      !rescheduleData.stadium ||
                      !rescheduleData.referee
                    }
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
                        referee: match.referee,
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
                  toast({
                    title: 'Éxito',
                    description: `Marcador actualizado: ${match.homeScore} - ${match.awayScore}`,
                  });
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
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Jugador</Label>
                <Select
                  value={newEvent.player}
                  onValueChange={(value) => setNewEvent((prev) => ({ ...prev, player: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jugador" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {match.homeTeam}
                    </div>
                    {players
                      .filter((p) => p.team === 'home')
                      .map((player) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.name}
                        </SelectItem>
                      ))}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t mt-2 pt-2">
                      {match.awayTeam}
                    </div>
                    {players
                      .filter((p) => p.team === 'away')
                      .map((player) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
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
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, minute: e.target.value }))}
                />
              </div>

              {newEvent.type !== 'goal' && newEvent.type && (
                <div className="space-y-2">
                  <Label htmlFor="cardColor">Color de Tarjeta</Label>
                  <Select
                    value={newEvent.cardColor}
                    onValueChange={(value) => setNewEvent((prev) => ({ ...prev, cardColor: value as 'RED' | 'YELLOW' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YELLOW">Tarjeta Amarilla 🟨</SelectItem>
                      <SelectItem value="RED">Tarjeta Roja 🟥</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleAddEvent}
                disabled={!newEvent.minute || !newEvent.player || !newEvent.type || isAddingEvent}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isAddingEvent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Agregar evento
                  </>
                )}
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
                  <p className="text-gray-500 text-center py-8">No hay eventos registrados</p>
                ) : (
                  events.map((event) => (
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
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={
                            event.team === 'home'
                              ? 'border-blue-500 text-blue-700'
                              : 'border-red-500 text-red-700'
                          }
                        >
                          {event.team === 'home' ? match.homeTeam : match.awayTeam}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(event)}
                          disabled={isEditingEvent !== null}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event)}
                          disabled={isDeletingEventId === event.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {isDeletingEventId === event.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
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
                onClick={handleSaveChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditingEvent !== null} onOpenChange={(open) => {
        if (!open) {
          setIsEditingEvent(null);
          setEditingEvent(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Modifica los detalles del {editingEvent?.type === 'goal' ? 'gol' : 'tarjeta'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-player">Jugador</Label>
              <Select
                value={editFormData.player}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, player: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar jugador" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {match.homeTeam}
                  </div>
                  {players
                    .filter((p) => p.team === 'home')
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t mt-2 pt-2">
                    {match.awayTeam}
                  </div>
                  {players
                    .filter((p) => p.team === 'away')
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-minute">Minuto</Label>
              <Input
                id="edit-minute"
                type="number"
                min="1"
                max="120"
                value={editFormData.minute}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, minute: e.target.value }))}
              />
            </div>

            {editingEvent?.type !== 'goal' && (
              <div className="space-y-2">
                <Label htmlFor="edit-cardColor">Color de Tarjeta</Label>
                <Select
                  value={editFormData.cardColor}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, cardColor: value as 'RED' | 'YELLOW' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YELLOW">Tarjeta Amarilla 🟨</SelectItem>
                    <SelectItem value="RED">Tarjeta Roja 🟥</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingEvent(null);
                setEditingEvent(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditEvent}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
