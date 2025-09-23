import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import gcompetenciaService, { Tournament, Referee } from '@/services/gcompetenciaService';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tournament: Tournament) => void;
}

interface FormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  format: 'Liga' | 'Eliminatoria' | 'Repechaje' | '';
  teams: number;
  roundTrip: boolean;
  yellowCards: number;
  referees: string[]; // guardamos los IDs como string
}

// 🔹 Mapeo entre lo que selecciona el usuario y lo que espera el backend
const formatMap: Record<string, string> = {
  Liga: "LEAGUE",
  Eliminatoria: "DIRECT_ELIMINATION",
  Repechaje: "PLAY_OFF",
};

export function CreateTournamentModal({ isOpen, onClose, onCreated }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: undefined,
    endDate: undefined,
    format: '',
    teams: 8,
    roundTrip: false,
    yellowCards: 5,
    referees: []
  });

  const [refereesList, setRefereesList] = useState<Referee[]>([]);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReferees = async () => {
      try {
        const data = await gcompetenciaService.getReferees();
        setRefereesList(data);
      } catch (error) {
        console.error("Error cargando árbitros:", error);
      }
    };
    fetchReferees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.format) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    if (formData.endDate < formData.startDate) {
      alert('La fecha de finalización debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      const newTournament = await gcompetenciaService.createTournament({
        name: formData.name,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        format: formatMap[formData.format], // 🔹 conversión aquí
        teams: formData.teams,
        roundTrip: formData.roundTrip,
        yellowCards: formData.yellowCards,
        referees: formData.referees.map(Number),
        status: 'Pendiente',
      });

      onCreated(newTournament);

      setFormData({
        name: '',
        startDate: undefined,
        endDate: undefined,
        format: '',
        teams: 8,
        roundTrip: false,
        yellowCards: 5,
        referees: []
      });
      onClose();
    } catch (error) {
      console.error('Error creando torneo:', error);
      alert('Error al crear la competencia');
    } finally {
      setLoading(false);
    }
  };

  const removeReferee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referees: prev.referees.filter((_, i) => i !== index)
    }));
  };

  const getTeamsRange = (format: string) => {
    switch (format) {
      case 'Liga':
        return { min: 6, max: 24, default: 12 };
      case 'Eliminatoria':
        return { min: 4, max: 32, default: 16 };
      case 'Repechaje':
        return { min: 4, max: 16, default: 8 };
      default:
        return { min: 4, max: 32, default: 8 };
    }
  };

  const teamsRange = getTeamsRange(formData.format);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Crear Nueva Competencia
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete los datos del torneo para crear una nueva competencia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Nombre del torneo *
            </Label>
            <Input
              id="name"
              placeholder="Ej: Liga Nacional de Fútbol 2024"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Fecha de inicio *
              </Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, startDate: date }));
                      setStartDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Fecha de finalización *
              </Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: es })
                    ) : (
                      "Seleccionar fecha"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, endDate: date }));
                      setEndDateOpen(false);
                    }}
                    disabled={(date) => 
                      date < new Date() || 
                      (formData.startDate && date < formData.startDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Format and Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Formato *
              </Label>
              <Select
                value={formData.format}
                onValueChange={(value: 'Liga' | 'Eliminatoria' | 'Repechaje') => {
                  setFormData(prev => ({ 
                    ...prev, 
                    format: value,
                    teams: getTeamsRange(value).default 
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Liga">Liga</SelectItem>
                  <SelectItem value="Eliminatoria">Eliminatoria</SelectItem>
                  <SelectItem value="Repechaje">Repechaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teams" className="text-sm font-medium text-gray-900">
                Número de equipos
              </Label>
              <Input
                id="teams"
                type="number"
                min={teamsRange.min}
                max={teamsRange.max}
                value={formData.teams}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  teams: parseInt(e.target.value) || teamsRange.default 
                }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Para {formData.format || 'este formato'}: {teamsRange.min} - {teamsRange.max} equipos
              </p>
            </div>
          </div>

          {/* Round Trip and Yellow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="roundTrip"
                  checked={formData.roundTrip}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, roundTrip: checked as boolean }))
                  }
                />
                <Label htmlFor="roundTrip" className="text-sm font-medium text-gray-900">
                  Ida y vuelta
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Los equipos se enfrentarán en partidos de ida y vuelta
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yellowCards" className="text-sm font-medium text-gray-900">
                Amarillas para suspensión
              </Label>
              <Input
                id="yellowCards"
                type="number"
                min="1"
                max="10"
                value={formData.yellowCards}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  yellowCards: parseInt(e.target.value) || 5 
                }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Referees */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Árbitros autorizados
            </Label>

            <Select
              onValueChange={(value) => {
                if (!formData.referees.includes(value)) {
                  setFormData(prev => ({
                    ...prev,
                    referees: [...prev.referees, value]
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar árbitro" />
              </SelectTrigger>
              <SelectContent>
                {refereesList.map((ref) => (
                  <SelectItem key={ref.id} value={String(ref.id)}>
                    {ref.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.referees.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Árbitros seleccionados ({formData.referees.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {formData.referees.map((refereeId, index) => {
                      const refereeName = refereesList.find(r => String(r.id) === refereeId)?.name || refereeId;
                      return (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {refereeName}
                          <button
                            type="button"
                            onClick={() => removeReferee(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Competencia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
