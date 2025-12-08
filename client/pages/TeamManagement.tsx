import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Users, UserCheck, Trash2, Save, X } from 'lucide-react';

import teamService, { Team, Player, positions } from '@/services/teamManagService';

// 🔹 Categorías locales
const categories = [
  { value: 'sub-15', label: 'Sub-15' },
  { value: 'sub-17', label: 'Sub-17' },
  { value: 'sub-20', label: 'Sub-20' },
  { value: 'libre', label: 'Libre' }
];

interface NewTeamData {
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField: string;
  players: Player[];
}

export default function TeamManagement() {
  console.log('🔍 [Componente] TeamManagement - Montando componente');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔥 **CORRECCIÓN CRÍTICA**: Extraer ID de la URL
  // La URL es: http://localhost:8080/tournament/1/teams-manage
  const extractTournamentIdFromUrl = (): string | null => {
    // Opción 1: Extraer de /tournament/1/teams-manage
    const match1 = window.location.pathname.match(/\/tournament\/(\d+)\/teams-manage/);
    if (match1 && match1[1]) {
      console.log('✅ ID extraído de /tournament/{id}/teams-manage:', match1[1]);
      return match1[1];
    }
    
    // Opción 2: Extraer de cualquier patrón con número antes de /teams-manage
    const match2 = window.location.pathname.match(/\/(\d+)\/teams-manage/);
    if (match2 && match2[1]) {
      console.log('✅ ID extraído de /{id}/teams-manage:', match2[1]);
      return match2[1];
    }
    
    // Opción 3: Intentar de location.state (por si acaso)
    if (location.state?.idTournament) {
      console.log('✅ ID obtenido de location.state:', location.state.idTournament);
      return location.state.idTournament.toString();
    }
    
    console.error('❌ No se pudo extraer ID de torneo');
    console.log('🔍 Pathname:', window.location.pathname);
    console.log('🔍 location.state:', location.state);
    console.log('🔍 URL completa:', window.location.href);
    
    return null;
  };
  
  // 🔥 Usar la función para obtener el ID
  const idTournament = extractTournamentIdFromUrl();
  
  console.log('🔍 [Componente] idTournament final:', idTournament);
  console.log('🔍 [Componente] location.state:', location.state);
  console.log('🔍 [Componente] URL completa:', window.location.href);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [pageError, setPageError] = useState<string>(''); // Para errores de página
  
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
    console.log('🔍 [Componente] fetchTeams - Iniciando');
    console.log('🔍 [Componente] idTournament para fetch:', idTournament);
    
    if (!idTournament) {
      console.error('❌ [Componente] ERROR: No hay idTournament disponible');
      setPageError('No se pudo identificar el torneo. Por favor, vuelve a la página anterior.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔍 [Componente] Llamando a teamService.getTeams...');
      setLoading(true);
      setPageError('');
      
      // Test de conexión primero
      console.log('🔍 [Componente] Probando conexión con backend...');
      const isConnected = await teamService.testConnection();
      console.log('🔍 [Componente] Conexión con backend:', isConnected ? '✅ OK' : '❌ FALLIDA');
      
      if (!isConnected) {
        setPageError('No se pudo conectar con el servidor. Verifica tu conexión.');
        setLoading(false);
        return;
      }
      
      const data = await teamService.getTeams(idTournament);
      console.log('✅ [Componente] fetchTeams - Datos recibidos:', data);
      console.log('✅ [Componente] Tipo de datos:', typeof data);
      console.log('✅ [Componente] Es array?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log(`✅ [Componente] Se cargaron ${data.length} equipos`);
        setTeams(data);
      } else {
        console.error('❌ [Componente] ERROR: Los datos no son un array:', data);
        setTeams([]);
        setPageError('Formato de datos incorrecto recibido del servidor.');
      }
    } catch (error: any) {
      console.error('❌ [Componente] Error en fetchTeams:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      // Mostrar error al usuario
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      setPageError(`Error al cargar equipos: ${errorMsg}`);
      setTeams([]);
    } finally {
      setLoading(false);
      console.log('🔍 [Componente] fetchTeams - Finalizado, loading:', false);
    }
  };

  useEffect(() => {
    document.title = `Gestión de Equipos`;
  }, []);

  useEffect(() => {
    console.log('🔍 [Componente] useEffect - Se ejecutó');
    console.log('🔍 [Componente] idTournament en useEffect:', idTournament);
    
    if (idTournament) {
      fetchTeams();
    } else {
      setLoading(false);
    }
  }, [idTournament]);

  // 🔥 Si no hay ID, mostrar pantalla de error
  if (!idTournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                No se pudo identificar el torneo. Por favor, vuelve atrás e intenta nuevamente.
              </AlertDescription>
            </Alert>
            <div className="text-sm text-gray-500 space-y-2">
              <p><strong>URL actual:</strong> {window.location.href}</p>
              <p><strong>Pathname:</strong> {window.location.pathname}</p>
              <p><strong>Location state:</strong> {JSON.stringify(location.state)}</p>
            </div>
            <Button 
              onClick={() => navigate(-1)} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver atrás
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Recargar página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔥 **CORRECCIÓN**: Función para manejar clic en equipo
  const handleTeamClick = (teamId: string) => {
    console.log('🔍 [Componente] Click en equipo ID:', teamId);
    
    // 🔥 Usar la ruta correcta: /tournament/{idTournament}/team/{teamId}
    navigate(`/tournament/${idTournament}/team/${teamId}`, { 
      state: { idTournament } 
    });
  };

  const handleInputChange = (field: keyof NewTeamData, value: string) => {
    console.log(`🔍 [Componente] Cambio en ${field}:`, value);
    setNewTeam(prev => ({ ...prev, [field]: value }));
    validateForm();
  };

  const handleAddPlayer = () => {
    console.log('🔍 [Componente] handleAddPlayer - Iniciando');
    console.log('🔍 [Componente] Datos del jugador:', newPlayer);
    
    if (newPlayer.name && newPlayer.position && newPlayer.dorsalNumber) {
      const dorsalNum = parseInt(newPlayer.dorsalNumber);
      console.log('🔍 [Componente] dorsalNumber parseado:', dorsalNum);
      
      const dorsalExists = newTeam.players.some(p => p.dorsalNumber === dorsalNum);
      console.log('🔍 [Componente] Dorsal existe?', dorsalExists);

      if (dorsalExists) {
        console.warn('⚠️ [Componente] Dorsal duplicado:', dorsalNum);
        setErrors(['El número de dorsal ya está en uso']);
        return;
      }

      const player: Player = {
        id: Date.now().toString(),
        name: newPlayer.name,
        position: newPlayer.position,
        dorsalNumber: dorsalNum,
        age: 18 // Valor por defecto para el backend
      };

      console.log('🔍 [Componente] Jugador creado:', player);
      
      setNewTeam(prev => {
        const newPlayers = [...prev.players, player];
        console.log(`🔍 [Componente] Total jugadores: ${newPlayers.length}`);
        return { ...prev, players: newPlayers };
      });

      setNewPlayer({ name: '', position: '', dorsalNumber: '' });
      validateForm();
    } else {
      console.warn('⚠️ [Componente] Datos incompletos del jugador');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    console.log('🔍 [Componente] Eliminando jugador:', playerId);
    setNewTeam(prev => ({
      ...prev,
      players: prev.players.filter(p => {
        console.log(`🔍 [Componente] Jugador ${p.id} === ${playerId}?`, p.id === playerId);
        return p.id !== playerId;
      })
    }));
    validateForm();
  };

  const validateForm = () => {
    console.log('🔍 [Componente] Validando formulario...');
    const newErrors: string[] = [];
    
    console.log('🔍 [Componente] Campos:', {
      name: newTeam.name,
      coach: newTeam.coach,
      category: newTeam.category,
      mainField: newTeam.mainField,
      secondaryField: newTeam.secondaryField,
      playersCount: newTeam.players.length
    });
    
    if (!newTeam.name) {
      console.warn('⚠️ [Componente] Validación: Nombre vacío');
      newErrors.push('El nombre del equipo es obligatorio');
    }
    if (!newTeam.coach) {
      console.warn('⚠️ [Componente] Validación: Coach vacío');
      newErrors.push('El director técnico es obligatorio');
    }
    if (!newTeam.category) {
      console.warn('⚠️ [Componente] Validación: Categoría vacía');
      newErrors.push('La categoría es obligatoria');
    }
    if (!newTeam.mainField) {
      console.warn('⚠️ [Componente] Validación: mainField vacío');
      newErrors.push('La cancha principal es obligatoria');
    }
    if (!newTeam.secondaryField) {
      console.warn('⚠️ [Componente] Validación: secondaryField vacío');
      newErrors.push('La cancha secundaria es obligatoria');
    }
    if (newTeam.players.length < 11) {
      console.warn(`⚠️ [Componente] Validación: Solo ${newTeam.players.length} jugadores (mínimo 11)`);
      newErrors.push('Debe haber mínimo 11 jugadores');
    }
    
    console.log(`🔍 [Componente] Errores encontrados: ${newErrors.length}`);
    setErrors(newErrors);
    
    const isValid = newErrors.length === 0;
    console.log(`🔍 [Componente] Formulario válido? ${isValid}`);
    return isValid;
  };

  // 🔹 Guardar en backend
  const handleSaveTeam = async () => {
    console.log('🔍 [Componente] handleSaveTeam - Iniciando');
    console.log('🔍 [Componente] idTournament:', idTournament);
    console.log('🔍 [Componente] Datos del equipo:', JSON.stringify(newTeam, null, 2));
    
    if (!idTournament) {
      console.error('❌ [Componente] ERROR: No hay idTournament para guardar equipo');
      setErrors(['No se puede guardar: Torneo no identificado']);
      return;
    }
    
    // Agregar edad a cada jugador si no existe
    const teamWithCompletePlayers = {
      ...newTeam,
      players: newTeam.players.map(player => ({
        ...player,
        age: player.age || 18 // Valor por defecto para el backend
      }))
    };
    
    console.log('🔍 [Componente] Equipo completo a enviar:', teamWithCompletePlayers);
    
    const isValid = validateForm();
    console.log(`🔍 [Componente] Validación pasada? ${isValid}`);
    
    if (isValid && idTournament) {
      try {
        console.log('🔍 [Componente] Llamando a teamService.createTeam...');
        const savedTeam = await teamService.createTeam(idTournament, teamWithCompletePlayers);
        console.log('✅ [Componente] Equipo guardado exitosamente:', savedTeam);
        
        // Refrescar lista
        console.log('🔍 [Componente] Refrescando lista de equipos...');
        await fetchTeams();
        
        resetForm();
        setIsModalOpen(false);
        
        // Mostrar mensaje de éxito
        console.log('✅ [Componente] Equipo creado y lista actualizada');
      } catch (error: any) {
        console.error('❌ [Componente] Error en handleSaveTeam:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // Mostrar error específico del backend si existe
        const backendError = error.response?.data?.message || error.message;
        setErrors([`Error al guardar equipo: ${backendError}`]);
      }
    } else {
      console.warn('⚠️ [Componente] Formulario inválido o idTournament faltante');
    }
  };

  const resetForm = () => {
    console.log('🔍 [Componente] resetForm - Limpiando formulario');
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
    console.log('🔍 [Componente] Cerrando modal');
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

  console.log('🔍 [Componente] isFormValid:', isFormValid);
  console.log('🔍 [Componente] Renderizando...');

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
                onClick={() => {
                  console.log('🔍 [Componente] Volviendo atrás');
                  navigate(-1);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard-organizador")}
                className="text-gray-600 hover:text-gray-900 border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al panel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Equipos
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Administra y registra los equipos del torneo
                </p>
                {idTournament && (
                  <p className="mt-1 text-xs text-blue-600 font-medium">
                    Torneo ID: {idTournament}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {loading ? 'Cargando...' : `${teams.length} equipos cargados`}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Botón registrar */}
        <div className="flex justify-end">
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            console.log('🔍 [Componente] Modal cambiado a:', open);
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-lg"
                size="lg"
                onClick={() => console.log('🔍 [Componente] Abriendo modal de registro')}
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
                <div className="text-xs text-gray-500 mt-1">
                  Torneo ID: {idTournament}
                </div>
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
                    <Label htmlFor="secondaryField">Cancha Secundaria *</Label>
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
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleAddPlayer();
                            }}
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
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleAddPlayer();
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            onClick={handleAddPlayer} 
                            disabled={!newPlayer.name || !newPlayer.position || !newPlayer.dorsalNumber}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Agregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {newTeam.players.map((player, index) => (
                      <div key={player.id || index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full">
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
                          onClick={() => handleRemovePlayer(player.id!)}
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
                  <Button 
                    onClick={handleSaveTeam} 
                    disabled={!isFormValid} 
                    className="flex-1"
                    title={!isFormValid ? "Complete todos los campos obligatorios" : "Guardar equipo"}
                  >
                    <Save className="w-4 h-4 mr-2" /> Guardar equipo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error de página */}
        {pageError && (
          <Alert variant="destructive">
            <AlertDescription>
              {pageError}
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de equipos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando equipos...</p>
            <p className="text-sm text-gray-400">Torneo ID: {idTournament}</p>
          </div>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay equipos registrados</p>
              <p className="text-gray-400 text-sm mb-4">
                Para el torneo con ID: {idTournament}
              </p>
              <p className="text-gray-400 text-sm">Haz clic en "Registrar nuevo equipo" para comenzar</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="w-5 h-5 mr-2 text-primary" /> 
                Equipos Registrados ({teams.length})
              </CardTitle>
              {teams.length > 0 && (
                <div className="text-sm text-gray-500">
                  {teams.reduce((total, team) => total + (team.players?.length || 0), 0)} jugadores en total
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                  <Card 
                    key={team.id}
                    onClick={() => handleTeamClick(team.id!)}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {team.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <UserCheck className="w-4 h-4 mr-2 text-primary" /> 
                        <span className="font-medium">DT:</span> {team.coach}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Users className="w-4 h-4 mr-2 text-primary" /> 
                        <span className="font-medium">Jugadores:</span> {team.players?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Campo:</span> {team.mainField}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 






