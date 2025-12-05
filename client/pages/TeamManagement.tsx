import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Users, UserCheck, Trash2, Save, X, LayoutDashboard } from 'lucide-react';

import teamService, { Team, Player, positions } from '@/services/teamManagementService';

// 🔹 Definir tipo NewTeamData localmente ya que no existe en el servicio
type NewTeamData = Omit<Team, "id">;

// 🔹 Categorías locales
const categories = [
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'sub-17', label: 'Sub-17' },
  { value: 'sub-20', label: 'Sub-20' },
  { value: 'libre', label: 'Libre' }
];

export default function TeamManagement() {
  const navigate = useNavigate();
  const { idTournament } = useParams<{ idTournament: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [newTeam, setNewTeam] = useState<NewTeamData>({
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
    if (!idTournament) {
      console.error("No se encontró el ID del torneo");
      setErrors(['No se encontró el ID del torneo']);
      return;
    }

    try {
      setLoading(true);
      // Convertir idTournament a number (el servicio espera number)
      const tournamentId = parseInt(idTournament);
      
      if (isNaN(tournamentId)) {
        setErrors(['ID de torneo inválido']);
        return;
      }

      const data = await teamService.getTeams(tournamentId);
      setTeams(data);
      setErrors([]);
    } catch (error: any) {
      console.error("Error cargando equipos:", error);
      setErrors([error.response?.data?.message || 'Error al cargar los equipos. Intente nuevamente.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [idTournament]);

  const handleTeamClick = (teamId: number) => {
    navigate(`/tournament/${idTournament}/team/${teamId}`);
  };

  const handleInputChange = (field: keyof NewTeamData, value: string) => {
    setNewTeam(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.position && newPlayer.dorsalNumber) {
      const dorsalNum = parseInt(newPlayer.dorsalNumber);
      
      // Validar dorsal válido
      if (dorsalNum < 1 || dorsalNum > 99) {
        setErrors(['El número de dorsal debe estar entre 1 y 99']);
        return;
      }

      // Verificar dorsal duplicado
      const dorsalExists = newTeam.players.some(p => p.dorsalNumber === dorsalNum);
      if (dorsalExists) {
        setErrors(['El número de dorsal ya está en uso']);
        return;
      }

      const player: Player = {
        id: Date.now(), // Cambiado a number
        name: newPlayer.name,
        position: newPlayer.position,
        dorsalNumber: dorsalNum,
        age: 18 // Valor por defecto más realista
      };

      setNewTeam(prev => ({
        ...prev,
        players: [...prev.players, player]
      }));

      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
      setErrors([]); // Limpiar errores al agregar jugador exitosamente
    }
  };

  const handleRemovePlayer = (playerId: number) => { // Cambiado a number
    setNewTeam(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  };

  // 🔹 Validación mejorada del formulario
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const newErrors: string[] = [];
    
    // Validar campos requeridos
    if (!newTeam.name.trim()) newErrors.push('El nombre del equipo es obligatorio');
    if (!newTeam.coach.trim()) newErrors.push('El director técnico es obligatorio');
    if (!newTeam.category) newErrors.push('La categoría es obligatoria');
    if (!newTeam.mainField.trim()) newErrors.push('La cancha principal es obligatoria');
    if (!newTeam.secondaryField?.trim()) newErrors.push('La cancha secundaria es obligatoria');
    
    // Validar jugadores
    if (newTeam.players.length < 11) {
      newErrors.push('Debe haber mínimo 11 jugadores');
    }
    
    // Validar dorsales únicos
    const dorsalNumbers = newTeam.players.map(p => p.dorsalNumber);
    const uniqueDorsals = new Set(dorsalNumbers);
    if (dorsalNumbers.length !== uniqueDorsals.size) {
      newErrors.push('No puede haber jugadores con el mismo número de dorsal');
    }
    
    // Validar posiciones válidas
    const validPositions = positions.map(p => p.value);
    const invalidPosition = newTeam.players.find(p => !validPositions.includes(p.position));
    if (invalidPosition) {
      newErrors.push(`El jugador "${invalidPosition.name}" tiene una posición inválida`);
    }
    
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    };
  };

  // 🔹 Guardar equipo en el backend
  const handleSaveTeam = async () => {
    if (!idTournament) {
      setErrors(['No se encontró el ID del torneo']);
      return;
    }

    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const tournamentId = parseInt(idTournament);
      if (isNaN(tournamentId)) {
        setErrors(['ID de torneo inválido']);
        return;
      }

      // Crear equipo con ID temporal (el backend asignará el ID real)
      const teamToCreate: NewTeamData = {
        name: newTeam.name.trim(),
        coach: newTeam.coach.trim(),
        category: newTeam.category,
        mainField: newTeam.mainField.trim(),
        secondaryField: newTeam.secondaryField?.trim() || '',
        players: newTeam.players.map(player => ({
          id: undefined, // El backend asignará el ID
          name: player.name.trim(),
          position: player.position,
          dorsalNumber: player.dorsalNumber,
          age: player.age || 18
        }))
      };

      await teamService.createTeam(tournamentId, teamToCreate);
      
      // Actualizar lista y limpiar formulario
      fetchTeams();
      resetForm();
      setIsModalOpen(false);
      setErrors([]);
    } catch (error: any) {
      console.error("Error guardando equipo:", error);
      setErrors([error.response?.data?.message || 'Error al guardar el equipo. Intente nuevamente.']);
    }
  };

  // 🔹 Funciones auxiliares
  const handleBackToTournament = () => {
    if (idTournament) {
      navigate(`/detalles-torneo/${idTournament}`);
    } else {
      navigate('/dashboard-organizador');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
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

  // 🔹 Calcular si el formulario es válido (para deshabilitar botón)
  const isFormValid = (): boolean => {
    const validation = validateForm();
    return validation.isValid;
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
                onClick={handleBackToTournament}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al torneo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard-organizador")}
                className="text-gray-600 hover:text-gray-900 border-gray-300"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Volver al panel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Equipos
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Administra y registra los equipos del torneo {idTournament}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Errores generales */}
        {errors.length > 0 && !isModalOpen && (
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

              {/* Errores del formulario */}
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coach">Director Técnico *</Label>
                    <Input
                      id="coach"
                      value={newTeam.coach}
                      onChange={(e) => handleInputChange('coach', e.target.value)}
                      placeholder="Ej: Carlo Ancelotti"
                      required
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
                      placeholder="Ej: Estadio Santiago Bernabéu"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="secondaryField">Cancha Secundaria *</Label>
                    <Input
                      id="secondaryField"
                      value={newTeam.secondaryField}
                      onChange={(e) => handleInputChange('secondaryField', e.target.value)}
                      placeholder="Ej: Ciudad Deportiva"
                      required
                    />
                  </div>
                </div>

                {/* Jugadores */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    Jugadores ({newTeam.players.length}/11 mínimo)
                    {newTeam.players.length < 11 && (
                      <span className="text-red-500 text-sm ml-2">(Faltan {11 - newTeam.players.length} jugadores)</span>
                    )}
                  </Label>
                  
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
                            placeholder="Nombre completo"
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
                            placeholder="1-99"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            onClick={handleAddPlayer} 
                            disabled={!newPlayer.name || !newPlayer.position || !newPlayer.dorsalNumber}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" /> Agregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {newTeam.players.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {newTeam.players.map(player => (
                        <div key={player.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold">
                              {player.dorsalNumber}
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-gray-500">
                                {positions.find(p => p.value === player.position)?.label || player.position}
                                {player.age && `, ${player.age} años`}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemovePlayer(player.id!)} // Usar ! porque sabemos que existe
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay jugadores agregados</p>
                      <p className="text-sm">Agrega al menos 11 jugadores</p>
                    </div>
                  )}
                </div>

                {/* Resumen del equipo */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">Resumen del equipo:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nombre:</span>
                      <p className="font-medium">{newTeam.name || 'No asignado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">DT:</span>
                      <p className="font-medium">{newTeam.coach || 'No asignado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Categoría:</span>
                      <p className="font-medium">
                        {categories.find(c => c.value === newTeam.category)?.label || 'No seleccionada'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jugadores:</span>
                      <p className="font-medium">{newTeam.players.length}/11</p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    onClick={handleCloseModal} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveTeam} 
                    disabled={!isFormValid()} 
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" /> Guardar equipo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de equipos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando equipos...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="w-5 h-5 mr-2 text-primary" /> 
                Equipos Registrados ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map(team => (
                    <Card 
                      key={team.id}
                      onClick={() => handleTeamClick(team.id!)}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            {categories.find(c => c.value === team.category)?.label || team.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <UserCheck className="w-4 h-4 mr-2 text-primary flex-shrink-0" /> 
                            <span className="truncate">DT: {team.coach}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-primary flex-shrink-0" /> 
                            <span className="truncate">Campo: {team.mainField}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-primary flex-shrink-0" /> 
                            <span>Jugadores: {team.players.length}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          Ver detalles →
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No hay equipos registrados</p>
                  <p className="text-gray-400 text-sm mb-6">Registra el primer equipo para comenzar</p>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Registrar equipo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}