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
import { 
  ArrowLeft, Plus, Users, UserCheck, Trash2, Save, X, LayoutDashboard, 
  Edit, Eye, Loader2, MoreVertical, Pencil, UserPlus 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import teamService, { Team, Player, positions, UpdatePlayerRequest } from '@/services/teamManagService';

// 🔹 Definir tipo NewTeamData localmente ya que no existe en el servicio
type NewTeamData = Omit<Team, "id">;

// 🔹 Categorías locales
const categories = [
  { value: 'sub-13', label: 'Sub-13' },
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<{
    delete: number | null;
    edit: number | null;
    save: boolean;
  }>({ delete: null, edit: null, save: false });
  
  const [newTeam, setNewTeam] = useState<NewTeamData>({
    name: '',
    coach: '',
    category: '',
    mainField: '',
    secondaryField: '',
    players: []
  });

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Estados para jugadores
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    dorsalNumber: ''
  });

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // 🔹 Cargar equipos desde el backend
  const fetchTeams = async () => {
    if (!idTournament) {
      console.error("No se encontró el ID del torneo");
      setErrors(['No se encontró el ID del torneo']);
      return;
    }

    try {
      setLoading(true);
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

  // 🔹 Funciones CRUD para Equipos

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    if (!idTournament || !window.confirm(`¿Estás seguro de eliminar el equipo "${teamName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, delete: teamId }));
      const tournamentId = parseInt(idTournament);
      const result = await teamService.deleteTeam(tournamentId, teamId);
      
      if (result.success) {
        setSuccessMessage(`Equipo "${teamName}" eliminado exitosamente`);
        fetchTeams();
      }
    } catch (error: any) {
      console.error("Error eliminando equipo:", error);
      setErrors([error.response?.data?.message || 'Error al eliminar el equipo.']);
    } finally {
      setActionLoading(prev => ({ ...prev, delete: null }));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEditTeam = async (teamId: number) => {
    if (!idTournament) return;
    
    try {
      setActionLoading(prev => ({ ...prev, edit: teamId }));
      const tournamentId = parseInt(idTournament);
      const team = await teamService.getCompleteTeam(tournamentId, teamId);
      setEditingTeam(team);
      setIsEditModalOpen(true);
    } catch (error: any) {
      console.error("Error cargando equipo para editar:", error);
      setErrors([error.response?.data?.message || 'Error al cargar el equipo para editar.']);
    } finally {
      setActionLoading(prev => ({ ...prev, edit: null }));
    }
  };

  const handleUpdateTeam = async () => {
    if (!idTournament || !editingTeam) return;
    
    const validation = validateTeamForm(editingTeam);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, save: true }));
      const tournamentId = parseInt(idTournament);
      
      const updateData = {
        name: editingTeam.name.trim(),
        coach: editingTeam.coach.trim(),
        teamCategory: editingTeam.category,
        mainStadium: editingTeam.mainField.trim(),
        secondaryStadium: editingTeam.secondaryField?.trim() || ""
      };

      await teamService.updateTeam(tournamentId, editingTeam.id, updateData);
      
      setSuccessMessage(`Equipo "${editingTeam.name}" actualizado exitosamente`);
      fetchTeams();
      setIsEditModalOpen(false);
      setEditingTeam(null);
      setErrors([]);
    } catch (error: any) {
      console.error("Error actualizando equipo:", error);
      if (error.response?.status === 401) {
        setErrors(['Error de autenticación. Por favor, verifica tu sesión.']);
      } else {
        setErrors([error.response?.data?.message || 'Error al actualizar el equipo.']);
      }
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // 🔹 Funciones CRUD para Jugadores

  const handleAddPlayerToNewTeam = () => {
    if (newPlayer.name && newPlayer.position && newPlayer.dorsalNumber) {
      const dorsalNum = parseInt(newPlayer.dorsalNumber);
      
      if (dorsalNum < 1 || dorsalNum > 99) {
        setErrors(['El número de dorsal debe estar entre 1 y 99']);
        return;
      }

      const dorsalExists = newTeam.players.some(p => p.dorsalNumber === dorsalNum);
      if (dorsalExists) {
        setErrors(['El número de dorsal ya está en uso']);
        return;
      }

      const player: Player = {
        id: Date.now(),
        name: newPlayer.name,
        position: newPlayer.position,
        dorsalNumber: dorsalNum,
        age: 18,
        starter: false,
        status: 'ACTIVE'
      };

      setNewTeam(prev => ({
        ...prev,
        players: [...prev.players, player]
      }));

      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
      setErrors([]);
    }
  };

  const handleRemovePlayerFromNewTeam = (playerId: number) => {
    setNewTeam(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  };

  const handleOpenPlayerModal = (teamId: number) => {
    setSelectedTeamId(teamId);
    setEditingPlayer(null);
    setNewPlayer({ name: '', position: '', dorsalNumber: '' });
    setIsPlayerModalOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setNewPlayer({
      name: player.name,
      position: player.position,
      dorsalNumber: player.dorsalNumber.toString()
    });
  };

  const handleSavePlayer = async () => {
    if (!idTournament || !selectedTeamId) return;

    const dorsalNum = parseInt(newPlayer.dorsalNumber);
    if (!newPlayer.name || !newPlayer.position || !newPlayer.dorsalNumber || dorsalNum < 1 || dorsalNum > 99) {
      setErrors(['Por favor completa todos los campos correctamente']);
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, save: true }));
      const tournamentId = parseInt(idTournament);
      
      if (editingPlayer) {
        // Actualizar jugador existente
        const playerData: UpdatePlayerRequest = {
          idPlayer: editingPlayer.id!,
          name: newPlayer.name,
          position: newPlayer.position,
          shirtNumber: dorsalNum,
          starter: editingPlayer.starter || false,
          status: editingPlayer.status || 'ACTIVE'
        };
        
        await teamService.updatePlayer(tournamentId, selectedTeamId, playerData);
        setSuccessMessage(`Jugador "${newPlayer.name}" actualizado exitosamente`);
      } else {
        // Crear nuevo jugador
        const playerData = {
          name: newPlayer.name,
          position: newPlayer.position,
          shirtNumber: dorsalNum,
          starter: false,
          status: 'ACTIVE' as const
        };
        
        await teamService.createPlayer(tournamentId, selectedTeamId, playerData);
        setSuccessMessage(`Jugador "${newPlayer.name}" creado exitosamente`);
      }
      
      // Si estamos editando un equipo, actualizamos su lista de jugadores
      if (editingTeam && editingTeam.id === selectedTeamId) {
        const updatedTeam = await teamService.getCompleteTeam(tournamentId, selectedTeamId);
        setEditingTeam(updatedTeam);
      }
      
      // Actualizar lista general de equipos
      fetchTeams();
      
      // Limpiar formulario
      setEditingPlayer(null);
      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
      setErrors([]);
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        setIsPlayerModalOpen(false);
      }, 1000);
      
    } catch (error: any) {
      console.error("Error guardando jugador:", error);
      setErrors([error.response?.data?.message || 'Error al guardar el jugador.']);
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    if (!idTournament || !selectedTeamId || !window.confirm(`¿Estás seguro de eliminar al jugador "${playerName}"?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, delete: playerId }));
      const tournamentId = parseInt(idTournament);
      
      await teamService.deletePlayer(tournamentId, selectedTeamId, playerId);
      
      setSuccessMessage(`Jugador "${playerName}" eliminado exitosamente`);
      
      // Actualizar equipo en edición si corresponde
      if (editingTeam && editingTeam.id === selectedTeamId) {
        const updatedTeam = await teamService.getCompleteTeam(tournamentId, selectedTeamId);
        setEditingTeam(updatedTeam);
      }
      
      // Actualizar lista general
      fetchTeams();
      
    } catch (error: any) {
      console.error("Error eliminando jugador:", error);
      setErrors([error.response?.data?.message || 'Error al eliminar el jugador.']);
    } finally {
      setActionLoading(prev => ({ ...prev, delete: null }));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // 🔹 Funciones auxiliares
  const handleInputChange = (field: keyof NewTeamData, value: string) => {
    setNewTeam(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: keyof Team, value: string) => {
    if (editingTeam) {
      setEditingTeam(prev => ({ ...prev, [field]: value } as Team));
    }
  };

  const validateTeamForm = (team: Team | NewTeamData): { isValid: boolean; errors: string[] } => {
    const newErrors: string[] = [];
    
    if (!team.name.trim()) newErrors.push('El nombre del equipo es obligatorio');
    if (!team.coach.trim()) newErrors.push('El director técnico es obligatorio');
    if (!team.category) newErrors.push('La categoría es obligatoria');
    if (!team.mainField.trim()) newErrors.push('La cancha principal es obligatoria');
    
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    };
  };

  const handleSaveTeam = async () => {
    if (!idTournament) {
      setErrors(['No se encontró el ID del torneo']);
      return;
    }

    const validation = validateTeamForm(newTeam);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, save: true }));
      const tournamentId = parseInt(idTournament);
      
      const teamToCreate: NewTeamData = {
        name: newTeam.name.trim(),
        coach: newTeam.coach.trim(),
        category: newTeam.category,
        mainField: newTeam.mainField.trim(),
        secondaryField: newTeam.secondaryField?.trim() || '',
        players: newTeam.players.map(player => ({
          id: undefined,
          name: player.name.trim(),
          position: player.position,
          dorsalNumber: player.dorsalNumber,
          age: player.age || 18,
          starter: player.starter || false,
          status: player.status || 'ACTIVE'
        }))
      };

      await teamService.createTeam(tournamentId, teamToCreate);
      
      setSuccessMessage(`Equipo "${newTeam.name}" creado exitosamente`);
      fetchTeams();
      resetForm();
      setIsModalOpen(false);
      setErrors([]);
    } catch (error: any) {
      console.error("Error guardando equipo:", error);
      setErrors([error.response?.data?.message || 'Error al guardar el equipo. Intente nuevamente.']);
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleTeamClick = (team: Team) => {
    if (!team.id) {
      console.error('El equipo no tiene ID válido:', team);
      return;
    }
    navigate(`/tournament/${idTournament}/team/${team.id}`);
  };

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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTeam(null);
    setErrors([]);
  };

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedTeamId(null);
    setEditingPlayer(null);
    setNewPlayer({ name: '', position: '', dorsalNumber: '' });
    setErrors([]);
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

  const isTeamFormValid = (): boolean => {
    const validation = validateTeamForm(newTeam);
    return validation.isValid;
  };

  const isEditTeamFormValid = (): boolean => {
    if (!editingTeam) return false;
    const validation = validateTeamForm(editingTeam);
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
        {/* Mensajes de éxito y error */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-600">
              ✅ {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {errors.length > 0 && !isModalOpen && !isEditModalOpen && !isPlayerModalOpen && (
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
                    <Label htmlFor="secondaryField">Cancha Secundaria (Opcional)</Label>
                    <Input
                      id="secondaryField"
                      value={newTeam.secondaryField}
                      onChange={(e) => handleInputChange('secondaryField', e.target.value)}
                      placeholder="Ej: Ciudad Deportiva"
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
                            onClick={handleAddPlayerToNewTeam} 
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
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemovePlayerFromNewTeam(player.id!)}
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
                    disabled={!isTeamFormValid() || actionLoading.save} 
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {actionLoading.save ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Guardar equipo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modal Editar Equipo */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Editar Equipo: {editingTeam?.name}
              </DialogTitle>
              <DialogDescription>
                Modifica la información del equipo
              </DialogDescription>
            </DialogHeader>

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

            {editingTeam && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editTeamName">Nombre del Equipo *</Label>
                    <Input
                      id="editTeamName"
                      value={editingTeam.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCoach">Director Técnico *</Label>
                    <Input
                      id="editCoach"
                      value={editingTeam.coach}
                      onChange={(e) => handleEditInputChange('coach', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCategory">Categoría *</Label>
                    <Select value={editingTeam.category} onValueChange={(value) => handleEditInputChange('category', value)}>
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
                    <Label htmlFor="editMainField">Cancha Principal *</Label>
                    <Input
                      id="editMainField"
                      value={editingTeam.mainField}
                      onChange={(e) => handleEditInputChange('mainField', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editSecondaryField">Cancha Secundaria (Opcional)</Label>
                    <Input
                      id="editSecondaryField"
                      value={editingTeam.secondaryField || ''}
                      onChange={(e) => handleEditInputChange('secondaryField', e.target.value)}
                    />
                  </div>
                </div>

                {/* Jugadores del equipo */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">
                      Jugadores ({editingTeam.players.length})
                    </Label>
                    <Button
                      onClick={() => {
                        setSelectedTeamId(editingTeam.id);
                        setIsPlayerModalOpen(true);
                      }}
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> Agregar Jugador
                    </Button>
                  </div>
                  
                  {editingTeam.players.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {editingTeam.players
                        .filter(player => player.status !== 'INACTIVE')
                        .map(player => (
                        <div key={player.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold">
                              {player.dorsalNumber}
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-gray-500">
                                {positions.find(p => p.value === player.position)?.label || player.position}
                                {player.starter && <Badge className="ml-2 bg-green-100 text-green-800">Titular</Badge>}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEditPlayer(player);
                                setIsPlayerModalOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlayer(player.id!, player.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={actionLoading.delete === player.id}
                            >
                              {actionLoading.delete === player.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay jugadores en este equipo</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    onClick={handleCloseEditModal} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpdateTeam} 
                    disabled={!isEditTeamFormValid() || actionLoading.save} 
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {actionLoading.save ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Gestionar Jugadores */}
        <Dialog open={isPlayerModalOpen} onOpenChange={setIsPlayerModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingPlayer ? `Editar Jugador: ${editingPlayer.name}` : 'Agregar Nuevo Jugador'}
              </DialogTitle>
              <DialogDescription>
                {editingPlayer ? 'Modifica la información del jugador' : 'Complete los datos del nuevo jugador'}
              </DialogDescription>
            </DialogHeader>

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

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
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
              </div>

              {editingPlayer && (
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingPlayer.starter || false}
                      onChange={(e) => setEditingPlayer(prev => prev ? { ...prev, starter: e.target.checked } : null)}
                      className="mr-2"
                    />
                    Jugador Titular
                  </Label>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleClosePlayerModal} 
                  variant="outline" 
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button 
                  onClick={handleSavePlayer} 
                  disabled={!newPlayer.name || !newPlayer.position || !newPlayer.dorsalNumber || actionLoading.save}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {actionLoading.save ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : editingPlayer ? (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" /> Agregar jugador
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                  {teams.map((team) => (
                    <Card 
                      key={team.id}
                      className="hover:shadow-lg transition-all duration-200 border hover:border-primary"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg truncate">
                            {team.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {categories.find(c => c.value === team.category)?.label || team.category}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleTeamClick(team)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditTeam(team.id)}>
                                  {actionLoading.edit === team.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Edit className="w-4 h-4 mr-2" />
                                  )}
                                  Editar equipo
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenPlayerModal(team.id)}
                                  className="text-blue-600"
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Agregar jugador
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteTeam(team.id, team.name)}
                                  className="text-red-600"
                                >
                                  {actionLoading.delete === team.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                  )}
                                  Eliminar equipo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTeam(team.id)}
                            disabled={actionLoading.edit === team.id}
                            className="flex-1"
                          >
                            {actionLoading.edit === team.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4 mr-2" />
                            )}
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            disabled={actionLoading.delete === team.id}
                            className="flex-1"
                          >
                            {actionLoading.delete === team.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Eliminar
                          </Button>
                        </div>
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