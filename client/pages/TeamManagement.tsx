import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Users, UserCheck, Trash2, Save, X } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  dorsalNumber: number;
}

interface Team {
  id: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField: string;
  players: Player[];
}

interface NewTeamData {
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField: string;
  players: Player[];
}

// Mock data for existing teams
const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Real Madrid CF',
    coach: 'Carlo Ancelotti',
    category: 'Libre',
    mainField: 'Santiago Bernabéu',
    secondaryField: 'Ciudad Real Madrid',
    players: []
  },
  {
    id: '2',
    name: 'FC Barcelona',
    coach: 'Xavi Hernández',
    category: 'Libre',
    mainField: 'Camp Nou',
    secondaryField: 'Joan Gamper',
    players: []
  },
  {
    id: '3',
    name: 'Atlético Madrid',
    coach: 'Diego Simeone',
    category: 'Libre',
    mainField: 'Wanda Metropolitano',
    secondaryField: 'Cerro del Espino',
    players: []
  },
  {
    id: '4',
    name: 'Valencia CF',
    coach: 'Rubén Baraja',
    category: 'Sub-20',
    mainField: 'Mestalla',
    secondaryField: 'Ciudad Deportiva',
    players: []
  }
];

const categories = [
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'sub-17', label: 'Sub-17' },
  { value: 'sub-20', label: 'Sub-20' },
  { value: 'libre', label: 'Libre' }
];

const positions = [
  { value: 'portero', label: 'Portero' },
  { value: 'defensa', label: 'Defensa' },
  { value: 'centro', label: 'Centro' },
  { value: 'delantero', label: 'Delantero' }
];

export default function TeamManagement() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>(mockTeams);
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

  const handleTeamClick = (teamId: string) => {
    //navigate(`/team/${teamId}`);
    navigate(`/teams-manage/${teamId}`);
  };

  const handleInputChange = (field: keyof NewTeamData, value: string) => {
    setNewTeam(prev => ({ ...prev, [field]: value }));
    validateForm();
  };

  const handleAddPlayer = () => {
    if (newPlayer.name && newPlayer.position && newPlayer.dorsalNumber) {
      const dorsalNum = parseInt(newPlayer.dorsalNumber);
      
      // Check if dorsal number is already taken
      const dorsalExists = newTeam.players.some(p => p.dorsalNumber === dorsalNum);
      if (dorsalExists) {
        setErrors(['El número de dorsal ya está en uso']);
        return;
      }

      const player: Player = {
        id: Date.now().toString(),
        name: newPlayer.name,
        position: newPlayer.position,
        dorsalNumber: dorsalNum
      };

      setNewTeam(prev => ({
        ...prev,
        players: [...prev.players, player]
      }));

      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
      validateForm();
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setNewTeam(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
    validateForm();
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

  const handleSaveTeam = () => {
    if (validateForm()) {
      const team: Team = {
        id: Date.now().toString(),
        ...newTeam
      };

      setTeams(prev => [...prev, team]);
      resetForm();
      setIsModalOpen(false);
      console.log('Equipo guardado:', team);
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
    newTeam.secondaryField.trim() !== "" &&
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
        
        {/* Action Button */}
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

                  {/* Add Player Form */}
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
                            placeholder="Nombre del jugador"
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
                          <Label htmlFor="dorsalNumber">N° Dorsal *</Label>
                          <Input
                            id="dorsalNumber"
                            type="number"
                            min="1"
                            max="99"
                            value={newPlayer.dorsalNumber}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, dorsalNumber: e.target.value }))}
                            placeholder="1-99"
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

                  {/* Players List */}
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
                        No hay jugadores agregados. Agrega al menos 11 jugadores.
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
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveTeam}
                    disabled={!isFormValid}
                    className={`flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg ${
                      !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar equipo
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
              Equipos Registrados ({teams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <Card 
                  key={team.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary/30"
                  onClick={() => handleTeamClick(team.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                        {team.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {team.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserCheck className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">DT:</span>
                      <span className="ml-1">{team.coach}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span>Campo: {team.mainField}</span>
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
      </div>
    </div>
  );
}
