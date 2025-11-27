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
import { ArrowLeft, Plus, Users, UserCheck, Trash2, Save, X, Edit2, Home } from 'lucide-react';
import TeamService, { Team, UpdateTeamRequest, positions } from '@/services/teamManagementService';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id?: number;
  name: string;
  position: string;
  dorsalNumber: number;
  age?: number;
}

interface NewTeamData {
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField: string;
  players: Player[];
}

const categories = [
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'sub-17', label: 'Sub-17' },
  { value: 'sub-20', label: 'Sub-20' },
  { value: 'libre', label: 'Libre' }
];

const ITEMS_PER_PAGE = 6;

export default function TeamManagement() {
  const navigate = useNavigate();
  const { idTournament } = useParams<{ idTournament: string }>();
  const { toast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  const [editFormData, setEditFormData] = useState<UpdateTeamRequest>({
    name: '',
    coach: '',
    teamCategory: '',
    mainStadium: '',
    secondaryStadium: ''
  });

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

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        if (!idTournament) return;
        const tournamentIdNum = parseInt(idTournament);
        
        console.log('🔄 Fetching teams para torneo:', tournamentIdNum);
        const fetchedTeams = await TeamService.getTeams(tournamentIdNum);

        console.log('✅ Teams recibidos:', fetchedTeams);
        // Protección extra: asegurar que sea un array
        fetchedTeams.forEach((team, index) => {
        if (!team.id) {
          console.error(`❌ Equipo en índice ${index} no tiene ID:`, team);
        }
      });
      
      setTeams(Array.isArray(fetchedTeams) ? fetchedTeams : []);

      } catch (error) {
        console.error('Error fetching teams:', error);
        // Si es un 401, el interceptor o el servicio deberían manejarlo, 
        // pero aquí evitamos que la app explote con datos basura.
        setTeams([]); 
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los equipos. Verifique su sesión.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [idTournament, toast]);

  // Validación reactiva
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTeam]); 

  // Filter teams based on search query con protección contra undefined
  const filteredTeams = teams.filter(team => {
    // Usamos encadenamiento opcional y valores por defecto
    const name = team.name ? team.name.toLowerCase() : '';
    const coach = team.coach ? team.coach.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || coach.includes(query);
  });
  // -------------------------------------

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTeamClick = (teamId: number) => {
  if (teamId && idTournament) {
    console.log(`🖱️ Navegando al equipo: ${teamId} del torneo: ${idTournament}`);
    navigate(`/tournament/${idTournament}/team/${teamId}`);
  } else {
    console.warn('⚠️ No se puede navegar: teamId o idTournament faltante', { teamId, idTournament });
  }
  };

  const handleInputChange = (field: keyof NewTeamData, value: string) => {
    setNewTeam(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.position && newPlayer.dorsalNumber) {
      const dorsalNum = parseInt(newPlayer.dorsalNumber);

      const dorsalExists = newTeam.players.some(p => p.dorsalNumber === dorsalNum);
      if (dorsalExists) {
        setErrors(['El número de dorsal ya está en uso']);
        return;
      }

      const player: Player = {
        id: Date.now(),
        name: newPlayer.name,
        position: newPlayer.position,
        dorsalNumber: dorsalNum
      };

      setNewTeam(prev => ({
        ...prev,
        players: [...prev.players, player]
      }));

      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
    }
  };

  const handleRemovePlayer = (playerId?: number) => {
    setNewTeam(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!newTeam.name) newErrors.push('El nombre del equipo es obligatorio');
    if (!newTeam.coach) newErrors.push('El director técnico es obligatorio');
    if (!newTeam.category) newErrors.push('La categoría es obligatoria');
    if (!newTeam.mainField) newErrors.push('La cancha principal es obligatoria');
    if (!newTeam.secondaryField) newErrors.push('La cancha secundaria es obligatoria');
    if (newTeam.players.length < 11) newErrors.push('Debe haber mínimo 11 jugadores');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSaveTeam = async () => {
    if (validateForm() && errors.length === 0 && idTournament) {
      setIsSaving(true);
      try {
        const tournamentIdNum = parseInt(idTournament);
        await TeamService.createTeam(tournamentIdNum, newTeam);

        toast({
          title: 'Éxito',
          description: 'El equipo ha sido registrado correctamente',
        });

        const fetchedTeams = await TeamService.getTeams(tournamentIdNum);
        setTeams(fetchedTeams || []);

        resetForm();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving team:', error);
        toast({
          title: 'Error',
          description: 'No se pudo guardar el equipo',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditFormData({
      name: team.name,
      coach: team.coach,
      teamCategory: team.category,
      mainStadium: team.mainField,
      secondaryStadium: team.secondaryField || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !idTournament) return;

    if (!editFormData.name || !editFormData.coach || !editFormData.teamCategory || !editFormData.mainStadium || !editFormData.secondaryStadium) {
      toast({
        title: 'Error',
        description: 'Todos los campos son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const tournamentIdNum = parseInt(idTournament);
      await TeamService.updateTeam(tournamentIdNum, editingTeam.id || 0, editFormData);

      toast({
        title: 'Éxito',
        description: 'El equipo ha sido actualizado correctamente',
      });

      const fetchedTeams = await TeamService.getTeams(tournamentIdNum);
      setTeams(fetchedTeams || []);

      setIsEditModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el equipo',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!idTournament) return;

    if (!window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) return;

    setDeletingTeamId(teamId);
    setIsDeleting(true);
    try {
      const tournamentIdNum = parseInt(idTournament);
      await TeamService.deleteTeam(tournamentIdNum, teamId);

      toast({
        title: 'Éxito',
        description: 'El equipo ha sido eliminado correctamente',
      });

      const fetchedTeams = await TeamService.getTeams(tournamentIdNum);
      setTeams(fetchedTeams || []);
      
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el equipo',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeletingTeamId(null);
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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTeam(null);
  };

  const isFormValid = errors.length === 0 && newTeam.name !== '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando equipos...</p>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard-organizador')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al panel
              </Button>
            </div>
          </div>

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

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Search and Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:flex-1">
            <Input
              placeholder="Buscar por nombre o director técnico..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border-gray-300"
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-lg whitespace-nowrap"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar nuevo equipo
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Registrar Nuevo Equipo
                </DialogTitle>
                <DialogDescription>
                  Complete todos los campos obligatorios para registrar el equipo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Error Messages */}
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

                {/* Team Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Nombre del Equipo *</Label>
                    <Input
                      id="teamName"
                      value={newTeam.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ej: Real Madrid CF"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coach">Director Técnico *</Label>
                    <Input
                      id="coach"
                      value={newTeam.coach}
                      onChange={(e) => handleInputChange('coach', e.target.value)}
                      placeholder="Ej: Carlo Ancelotti"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={newTeam.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
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
                      placeholder="Ej: Santiago Bernabéu"
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="secondaryField">Cancha Secundaria *</Label>
                    <Input
                      id="secondaryField"
                      value={newTeam.secondaryField}
                      onChange={(e) => handleInputChange('secondaryField', e.target.value)}
                      placeholder="Ej: Ciudad Real Madrid"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Players Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Jugadores ({newTeam.players.length}/11 mínimo)</Label>
                  </div>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Agregar Jugador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="playerName">Nombre *</Label>
                          <Input
                            id="playerName"
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre"
                            className="rounded-lg"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position">Posición *</Label>
                          <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}>
                            <SelectTrigger className="rounded-lg">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map(position => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dorsalNumber">N° *</Label>
                          <Input
                            id="dorsalNumber"
                            type="number"
                            min="1"
                            max="99"
                            value={newPlayer.dorsalNumber}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, dorsalNumber: e.target.value }))}
                            placeholder="#"
                            className="rounded-lg"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={handleAddPlayer}
                            disabled={!newPlayer.name || !newPlayer.position || !newPlayer.dorsalNumber}
                            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {newTeam.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                            {player.dorsalNumber}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{player.position}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayer(player.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {newTeam.players.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No hay jugadores agregados.
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    onClick={handleCloseModal}
                    variant="outline"
                    className="flex-1 rounded-lg"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveTeam}
                    disabled={!isFormValid || isSaving}
                    className={`flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg ${
                      !isFormValid || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar equipo'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams List */}
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Equipos Registrados ({filteredTeams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedTeams.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedTeams.map((team, idx) => {
                    // fallbackKey: si team.id es undefined o nulo, creamos una key estable por página
                    const fallbackKey = `team-${idTournament ?? 'no-t'}-${startIndex + idx}`;
                    return (
                      <Card
                        key={team.id ?? fallbackKey}
                        className="border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                      >
                        <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50" onClick={() => {console.log('🖱️ Click en equipo:', team.id);
    handleTeamClick(team.id)}}>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-900 leading-tight flex-1">
                              {team.name}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs ml-2">
                              {team.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2 pb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <UserCheck className="w-4 h-4 mr-2 text-primary" />
                            <span className="font-medium">DT:</span>
                            <span className="ml-1">{team.coach}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-primary" />
                            <span>Campo: {team.mainField}</span>
                          </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3 border-t">
                          <Dialog open={isEditModalOpen && editingTeam?.id === team.id} onOpenChange={(open) => {
                            if (!open) handleCloseEditModal();
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTeam(team);
                                }}
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">
                                  Editar Equipo
                                </DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nombre del Equipo *</Label>
                                  <Input
                                    id="edit-name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="rounded-lg"
                                  />
                                </div>
                                {/* Resto de campos de edición simplificados para el ejemplo, asegurate de que estén todos */}
                                <div className="space-y-2">
                                  <Label htmlFor="edit-coach">Director Técnico *</Label>
                                  <Input
                                    id="edit-coach"
                                    value={editFormData.coach}
                                    onChange={(e) => setEditFormData({ ...editFormData, coach: e.target.value })}
                                    className="rounded-lg"
                                  />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-mainStadium">Cancha Principal</Label>
                                    <Input
                                        value={editFormData.mainStadium}
                                        onChange={(e) => setEditFormData({ ...editFormData, mainStadium: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-secondaryStadium">Cancha Secundaria</Label>
                                    <Input
                                        value={editFormData.secondaryStadium}
                                        onChange={(e) => setEditFormData({ ...editFormData, secondaryStadium: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    onClick={handleCloseEditModal}
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleUpdateTeam}
                                    className="flex-1 bg-blue-600 text-white"
                                  >
                                    Actualizar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Botón Eliminar Reconstruido */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                if(team.id) handleDeleteTeam(team.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isDeleting && deletingTeamId === team.id}
                           >
                            {isDeleting && deletingTeamId === team.id ? '...' : <Trash2 className="w-4 h-4" />}
                           </Button>
                        </div>
                      </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <span className="flex items-center px-4 text-sm">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
              </>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    No hay equipos registrados o no coinciden con la búsqueda.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}