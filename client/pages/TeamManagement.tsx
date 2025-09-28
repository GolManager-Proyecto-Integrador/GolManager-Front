import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Users, UserCheck, Trash2, Save, X } from 'lucide-react';

import teamService, { Team, Player, positions } from '@/services/teamService';

// 🔹 Categorías locales
const categories = [
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'sub-17', label: 'Sub-17' },
  { value: 'sub-20', label: 'Sub-20' },
  { value: 'libre', label: 'Libre' }
];

export default function TeamManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { idTournament: idFromParams } = useParams<{ idTournament: string }>();

  // ✅ Soporta state o parámetros de URL
  const idTournament = location.state?.idTournament || idFromParams;

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ✅ usamos Omit<Team, "id"> para equipos nuevos
  const [newTeam, setNewTeam] = useState<Omit<Team, "id">>({
    name: '',
    coach: '',
    category: '',
    mainField: '',
    secondaryField: '',
    players: []
  });

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    dorsalNumber: ''
  });

  // 🔹 Cargar equipos desde el backend
  const fetchTeams = async () => {
    if (!idTournament) return;
    try {
      setLoading(true);
      const data = await teamService.getTeams(idTournament);
      setTeams(data);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [idTournament]);

  const handleTeamClick = (teamId: string) => {
    navigate(`/tournament/${idTournament}/team/${teamId}`);
  };

  const handleInputChange = (field: keyof Omit<Team, "id">, value: string) => {
    setNewTeam(prev => ({ ...prev, [field]: value }));
    validateForm();
  };

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.position && newPlayer.dorsalNumber) {
      const dorsalNum = parseInt(newPlayer.dorsalNumber);
      const dorsalExists = newTeam.players.some(p => p.dorsalNumber === dorsalNum);

      if (dorsalExists) {
        setErrors(['El número de dorsal ya está en uso']);
        return;
      }

      // ⚡ Nuevo jugador sin id (lo genera el backend)
      const player: Omit<Player, "id"> = {
        name: newPlayer.name,
        position: newPlayer.position,
        dorsalNumber: dorsalNum
      };

      setNewTeam(prev => ({
        ...prev,
        players: [...prev.players, player as Player]
      }));

      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
      validateForm();
    }
  };

  const handleRemovePlayer = (playerId?: string, dorsalNumber?: number) => {
    setNewTeam(prev => ({
      ...prev,
      players: prev.players.filter(
        p => p.id !== playerId && p.dorsalNumber !== dorsalNumber
      )
    }));
    validateForm();
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!newTeam.name) newErrors.push('El nombre del equipo es obligatorio');
    if (!newTeam.coach) newErrors.push('El director técnico es obligatorio');
    if (!newTeam.category) newErrors.push('La categoría es obligatoria');
    if (!newTeam.mainField) newErrors.push('La cancha principal es obligatoria');
    if (newTeam.players.length < 11) newErrors.push('Debe haber mínimo 11 jugadores');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // 🔹 Guardar en backend
  const handleSaveTeam = async () => {
    if (validateForm() && idTournament) {
      try {
        const created = await teamService.createTeam(idTournament, newTeam);
        // ✅ actualiza estado local en lugar de recargar todo
        setTeams(prev => [...prev, created]);
        resetForm();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error guardando equipo:", error);
      }
    }
  };

  const resetForm = () => {
    setNewTeam({
      name: '',
      coach: '',
      category: '',
      mainField: '',
      secondaryField: '',
      players: []
    });
    setNewPlayer({ name: '', position: '', dorsalNumber: '' });
    setErrors([]);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const isFormValid =
    newTeam.name.trim() !== "" &&
    newTeam.coach.trim() !== "" &&
    newTeam.category.trim() !== "" &&
    newTeam.mainField.trim() !== "" &&
    newTeam.players.length >= 11;

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
                  Gestión de Equipos
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Administra y registra los equipos del torneo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Botón registrar */}
        <div className="flex justify-end">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar nuevo equipo
              </Button>
            </DialogTrigger>
            
            {/* Modal Crear Equipo */}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Registrar Nuevo Equipo
                </DialogTitle>
                <DialogDescription>
                  Complete todos los campos obligatorios para registrar el equipo
                </DialogDescription>
              </DialogHeader>

              {/* Errores */}
              {errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription>
                    <ul className="text-red-600 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Formulario equipo */}
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Nombre del Equipo *</Label>
                    <Input
                      id="teamName"
                      value={newTeam.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ej: Real Madrid CF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coach">Director Técnico *</Label>
                    <Input
                      id="coach"
                      value={newTeam.coach}
                      onChange={(e) => handleInputChange('coach', e.target.value)}
                      placeholder="Ej: Carlo Ancelotti"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={newTeam.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mainField">Cancha Principal *</Label>
                    <Input
                      id="mainField"
                      value={newTeam.mainField}
                      onChange={(e) => handleInputChange('mainField', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="secondaryField">Cancha Secundaria (opcional)</Label>
                    <Input
                      id="secondaryField"
                      value={newTeam.secondaryField}
                      onChange={(e) => handleInputChange('secondaryField', e.target.value)}
                    />
                  </div>
                </div>

                {/* Jugadores */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Jugadores ({newTeam.players.length}/11 mínimo)</Label>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Agregar Jugador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Nombre *</Label>
                          <Input
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Posición *</Label>
                          <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map(pos => (
                                <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>N° Dorsal *</Label>
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            value={newPlayer.dorsalNumber}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, dorsalNumber: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleAddPlayer} disabled={!newPlayer.name || !newPlayer.position || !newPlayer.dorsalNumber}>
                            <Plus className="w-4 h-4 mr-2" /> Agregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {newTeam.players.map(player => (
                      <div key={player.dorsalNumber} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full">
                            {player.dorsalNumber}
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-500">{player.position}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemovePlayer(player.id, player.dorsalNumber)} 
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button onClick={handleCloseModal} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button onClick={handleSaveTeam} disabled={!isFormValid} className="flex-1">
                    <Save className="w-4 h-4 mr-2" /> Guardar equipo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de equipos */}
        {loading ? (
          <p className="text-center text-gray-600 py-12">Cargando equipos...</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="w-5 h-5 mr-2 text-primary" /> Equipos Registrados ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                  <Card 
                    key={team.id}
                    onClick={() => handleTeamClick(team.id!)}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle>{team.name}</CardTitle>
                        <Badge>{team.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserCheck className="w-4 h-4 mr-2 text-primary" /> DT: {team.coach}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary" /> Campo: {team.mainField}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {teams.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No hay equipos registrados</p>
                  <p className="text-gray-400 text-sm">Registra el primer equipo para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
