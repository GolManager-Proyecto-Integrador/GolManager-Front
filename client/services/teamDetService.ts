import { getToken } from "./authService";

// =========================
//   URL BASES SEGÚN BACKEND  
// =========================
const API_TOURNAMENTS = "http://localhost:8085/api/tournaments";
const API_PLAYERS = "http://localhost:8085/api/players";

// ============================================================
// 🔹 INTERFACES DEL FRONTEND
// ============================================================

export interface Player {
  id: string;
  name: string;
  position: string;
  role: "Titular" | "Suplente";
  dorsalNumber: number;
  goals?: number;
  yellowCards?: number;
  redCards?: number;
  status: "Activo" | "Suspendido" | "Lesionado";
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  category: string;
  mainField: string;
  secondaryField?: string;
  players: Player[];
}

// ============================================================
// 🔹 INTERFACES DEL BACKEND
// ============================================================

interface BackendTeam {
  teamId: number;
  name: string;
  coach: string;
  category: string;
  mainStadium: string;
  secondaryStadium: string;
  dateCreated: string;
}

interface BackendPlayer {
  idPlayer: number;
  name: string;
  position: string;
  starter: boolean;
  shirtNumber: number;
  goals?: number;
  yellowCards?: number;
  redCards?: number;
  status: "ACTIVE" | "SUSPENDED" | "INJURED";
}

// ============================================================
// 🔹 INTERFACES PARA ACTUALIZACIÓN (RESTAURADAS)
// ============================================================

interface UpdateTeamDTO {
  name: string;
  coach: string;
  teamCategory: string;
  mainStadium: string;
  secondaryStadium: string;
}

interface UpdatePlayerDTO {
  idPlayer: number;
  name: string;
  position: string;
  starter: boolean;
  shirtNumber: number;
  status: "ACTIVE" | "SUSPENDED" | "INJURED";
}

// ============================================================
// 🔹 MAPEO BACKEND → FRONTEND
// ============================================================

function mapBackendPlayer(p: BackendPlayer): Player {
  return {
    id: String(p.idPlayer),
    name: p.name,
    position: p.position,
    role: p.starter ? "Titular" : "Suplente",
    dorsalNumber: p.shirtNumber,
    goals: p.goals ?? 0,
    yellowCards: p.yellowCards ?? 0,
    redCards: p.redCards ?? 0,
    status: p.status === "ACTIVE" 
      ? "Activo" 
      : p.status === "SUSPENDED" 
        ? "Suspendido" 
        : "Lesionado",
  };
}

function mapBackendTeam(t: BackendTeam, players: Player[]): Team {
  return {
    id: String(t.teamId),
    name: t.name,
    coach: t.coach,
    category: t.category,
    mainField: t.mainStadium,
    secondaryField: t.secondaryStadium,
    players,
  };
}

// ============================================================
// 🔹 FUNCIÓN PARA HACER REQUEST (MANTIENE LOGS IMPORTANTES)
// ============================================================

async function makeApiRequest<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<T> {
  const token = getToken();
  
  console.group(`🌐 ${method} ${url}`);
  console.log('📋 Token source: getToken()');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    let cleanToken = token.replace(/^"(.*)"$/, '$1');
    if (cleanToken.startsWith("Bearer ")) {
      cleanToken = cleanToken.slice(7).trim();
    }
    
    console.log('🔢 Token length:', cleanToken.length);
    console.log('👀 Token preview:', cleanToken.substring(0, 20) + '...');
    
    if (cleanToken && cleanToken !== "null" && cleanToken !== "undefined") {
      headers['Authorization'] = `Bearer ${cleanToken}`;
      console.log('✅ Token configurado en headers');
    } else {
      console.warn('⚠️ Token inválido o vacío después de limpieza');
      console.log('🔍 Token después de limpieza:', cleanToken);
    }
  } else {
    console.warn('⚠️ No se encontró token en getToken()');
  }
  
  console.log('📨 Headers finales:', {
    'Content-Type': headers['Content-Type'],
    'Authorization': headers['Authorization'] ? '***PRESENTE***' : 'AUSENTE'
  });
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('📊 Status:', response.status);
    console.log('📦 Data preview:', response.ok ? 'DATA_RECIBIDA' : 'ERROR');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      if (response.status === 401) {
        console.error('🔐 ERROR 401 DETECTADO - Posibles causas:');
        console.log('   • Token expirado');
        console.log('   • Token inválido');
        console.log('   • Falta de permisos');
        console.log('   • Endpoint requiere autenticación diferente');
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const responseData = await response.json();
    
    if (method === 'GET') {
      console.log('🔢 Cantidad de elementos:', Array.isArray(responseData) ? responseData.length : 'N/A');
    }
    
    console.groupEnd();
    return responseData as T;
    
  } catch (error) {
    console.error('❌ Error en la solicitud:', error);
    console.groupEnd();
    throw error;
  }
}

// ============================================================
// 🔹 GET: Obtener detalles del equipo (VERSIÓN MEJORADA)
// ============================================================

export async function getTeamDetails(
  idTournament: string,
  idTeam: string
): Promise<Team> {
  console.log('🎯 === GET TEAM DETAILS ===');
  console.log(`📌 ID recibido desde TeamManagement: ${idTeam}`);
  console.log(`💡 NOTA: Este '${idTeam}' es la POSICIÓN en la lista (1=primero, 2=segundo, etc.)`);
  
  const tournamentIdNum = parseInt(idTournament, 10);
  const positionInList = parseInt(idTeam, 10);

  try {
    // 🔹 PASO 1: Obtener TODOS los equipos
    const teamsUrl = `${API_TOURNAMENTS}/${tournamentIdNum}/teams`;
    console.log('🔍 Obteniendo equipos desde:', teamsUrl);
    
    const teamsData = await makeApiRequest<any>(teamsUrl, 'GET');
    
    console.log('📦 Respuesta completa del backend:', teamsData);
    
    // 🔹 PASO 2: Extraer array de equipos (igual que teamManagementService)
    let teamsArray: any[] = [];
    
    if (teamsData && typeof teamsData === 'object') {
      if (Array.isArray(teamsData)) {
        teamsArray = teamsData;
        console.log('📊 Datos son array directo');
      } else if (teamsData.teams && Array.isArray(teamsData.teams)) {
        teamsArray = teamsData.teams;
        console.log('📊 Datos en propiedad teams');
      } else {
        teamsArray = Object.values(teamsData).find(val => Array.isArray(val)) || [];
        console.log('📊 Datos encontrados en valores del objeto');
      }
    }
    
    if (!Array.isArray(teamsArray)) {
      console.warn('⚠️ teamsData no es un array:', teamsData);
      throw new Error('No se pudieron cargar los equipos');
    }

    // 🔹 PASO 3: Mostrar equipos disponibles
    console.log('📋 Equipos disponibles en backend (en orden del array):');
    teamsArray.forEach((team, index) => {
      const teamId = team.teamId || team.id || index + 1;
      const teamName = team.name || team.teamName || `Equipo ${teamId}`;
      console.log(`   [${index}] → ID: ${teamId}, Nombre: "${teamName}"`);
    });
    
    // 🔹 PASO 4: Validar posición
    if (positionInList < 1 || positionInList > teamsArray.length) {
      console.error(`❌ Posición ${positionInList} fuera de rango. Hay ${teamsArray.length} equipos.`);
      throw new Error(`No existe el equipo en posición ${positionInList}`);
    }
    
    // 🔹 PASO 5: Obtener el equipo en la posición correcta
    const index = positionInList - 1;
    const backendTeam = teamsArray[index];
    
    // Extraer datos (igual que teamManagementService)
    const teamId = backendTeam.teamId || backendTeam.id || positionInList;
    const teamName = backendTeam.name || backendTeam.teamName || `Equipo ${positionInList}`;
    
    console.log(`✅ Equipo seleccionado: Posición ${positionInList} → "${teamName}" (ID usado: ${teamId})`);
    
    // 🔹 PASO 6: Obtener jugadores usando el ID
    const playersUrl = `${API_PLAYERS}/${tournamentIdNum}/teams/${teamId}`;
    console.log('👥 Obteniendo jugadores desde:', playersUrl);
    
    const playersData = await makeApiRequest<any[]>(playersUrl, 'GET');
    
    console.log(`✅ ${playersData.length} jugadores obtenidos`);
    
    // 🔹 PASO 7: Mapear jugadores usando función dedicada
    const players: Player[] = playersData.map(player => {
      // Usar la función de mapeo dedicada si los datos coinciden con BackendPlayer
      if (player.idPlayer !== undefined) {
        const backendPlayer: BackendPlayer = {
          idPlayer: player.idPlayer,
          name: player.name,
          position: player.position,
          starter: player.starter,
          shirtNumber: player.shirtNumber,
          goals: player.goals,
          yellowCards: player.yellowCards,
          redCards: player.redCards,
          status: player.status
        };
        return mapBackendPlayer(backendPlayer);
      }
      
      // Si no, usar mapeo flexible
      return {
        id: String(player.idPlayer || player.id || Date.now()),
        name: player.name,
        position: player.position,
        role: player.starter === true || player.starter === "TRUE" ? "Titular" : "Suplente",
        dorsalNumber: player.shirtNumber || player.dorsalNumber || 0,
        goals: player.goals || 0,
        yellowCards: player.yellowCards || 0,
        redCards: player.redCards || 0,
        status: player.status === "ACTIVE" ? "Activo" : 
                player.status === "SUSPENDED" ? "Suspendido" : "Lesionado"
      };
    });
    
    // 🔹 PASO 8: Crear equipo final usando función de mapeo
    const team: Team = {
      id: String(teamId),
      name: teamName,
      coach: backendTeam.coach || backendTeam.coachName || 'Sin DT',
      category: backendTeam.category || backendTeam.teamCategory || 'libre',
      mainField: backendTeam.mainStadium || backendTeam.mainField || 'Cancha principal',
      secondaryField: backendTeam.secondaryStadium || backendTeam.secondaryField || '',
      players
    };
    
    console.log('🎉 EQUIPO FINAL:');
    console.log(`   - ID: ${team.id}`);
    console.log(`   - Nombre: ${team.name}`);
    console.log(`   - DT: ${team.coach}`);
    console.log(`   - Categoría: ${team.category}`);
    console.log(`   - Jugadores: ${team.players.length}`);
    
    return team;
    
  } catch (error: any) {
    console.error('❌ ERROR en getTeamDetails:');
    console.error('   - Mensaje:', error.message);
    console.error('   - Stack:', error.stack);
    throw error;
  }
}

// ============================================================
// 🔹 FUNCIÓN AUXILIAR: Obtener ID real del equipo (RESTAURADA)
// ============================================================

export async function getRealTeamId(
  idTournament: string,
  positionInList: string
): Promise<number> {
  console.log('🔍 === GET REAL TEAM ID ===');
  
  const tournamentIdNum = parseInt(idTournament, 10);
  const position = parseInt(positionInList, 10);
  
  const teamsUrl = `${API_TOURNAMENTS}/${tournamentIdNum}/teams`;
  const teamsData = await makeApiRequest<any>(teamsUrl, 'GET');
  
  let teamsArray: any[] = [];
  if (teamsData && typeof teamsData === 'object') {
    if (Array.isArray(teamsData)) {
      teamsArray = teamsData;
    } else if (teamsData.teams && Array.isArray(teamsData.teams)) {
      teamsArray = teamsData.teams;
    } else {
      teamsArray = Object.values(teamsData).find(val => Array.isArray(val)) || [];
    }
  }
  
  if (position < 1 || position > teamsArray.length) {
    throw new Error(`Posición ${position} inválida`);
  }
  
  const backendTeam = teamsArray[position - 1];
  const realTeamId = backendTeam.teamId || backendTeam.id || position;
  
  console.log(`✅ Posición ${position} → ID real: ${realTeamId}`);
  return realTeamId;
}

// ============================================================
// 🔹 MAPEO FRONTEND → BACKEND (RESTAURADO)
// ============================================================

// Agrega esta función en teamDetService.ts (después de updatePlayerDetails):

export async function updateMultiplePlayers(
  idTournament: string,
  idTeam: string,
  players: Player[]
): Promise<Player[]> {
  console.log('🔄 === UPDATE MULTIPLE PLAYERS ===');
  console.log(`📌 Actualizando ${players.length} jugadores`);
  
  const tournamentIdNum = parseInt(idTournament, 10);
  const positionInList = parseInt(idTeam, 10);

  try {
    // 🔹 Obtener el ID real del equipo
    const realTeamId = await getRealTeamId(idTournament, idTeam);
    
    console.log(`🔍 Equipo posición ${positionInList} → ID real: ${realTeamId}`);
    
    const updatedPlayers: Player[] = [];
    
    // 🔹 Actualizar cada jugador
    for (const player of players) {
      try {
        console.log(`📤 Actualizando jugador: ${player.name}`);
        
        const body: UpdatePlayerDTO = mapFrontendPlayerToBackend(player);
        
        const response = await makeApiRequest<BackendPlayer>(
          `${API_PLAYERS}/${tournamentIdNum}/teams/${realTeamId}`,
          'PUT',
          body
        );
        
        const updatedPlayer = mapBackendPlayer(response);
        updatedPlayers.push(updatedPlayer);
        console.log(`✅ ${player.name} actualizado`);
        
      } catch (error: any) {
        console.error(`❌ Error actualizando jugador ${player.name}:`, error.message);
        // Continuar con los demás jugadores
      }
    }
    
    console.log(`🎉 ${updatedPlayers.length}/${players.length} jugadores actualizados exitosamente`);
    return updatedPlayers;
    
  } catch (error: any) {
    console.error('❌ ERROR en updateMultiplePlayers:', error.message);
    throw error;
  }
}

function mapFrontendPlayerToBackend(p: Player): UpdatePlayerDTO {
  return {
    idPlayer: parseInt(p.id, 10),
    name: p.name,
    position: p.position,
    starter: p.role === "Titular",
    shirtNumber: p.dorsalNumber,
    status: p.status === "Activo" 
      ? "ACTIVE" 
      : p.status === "Suspendido" 
        ? "SUSPENDED" 
        : "INJURED",
  };
}

// ============================================================
// 🔹 PUT: Actualizar solo datos del equipo (MEJORADA)
// ============================================================

export async function updateTeamDetails(
  idTournament: string,
  idTeam: string,
  team: Team
): Promise<Team> {
  console.log('🔄 === UPDATE TEAM DETAILS ===');
  console.log(`📌 ID proporcionado: ${idTeam} (esto es la posición en la lista)`);
  
  const tournamentIdNum = parseInt(idTournament, 10);
  const positionInList = parseInt(idTeam, 10);

  try {
    // 🔹 Obtener el ID real del equipo
    const realTeamId = await getRealTeamId(idTournament, idTeam);
    
    console.log(`🔍 Actualizando equipo en posición ${positionInList} → ID real: ${realTeamId}`);
    
    // 🔹 Crear body para actualización
    const body: UpdateTeamDTO = {
      name: team.name,
      coach: team.coach,
      teamCategory: team.category,
      mainStadium: team.mainField,
      secondaryStadium: team.secondaryField ?? "",
    };

    console.log('📤 Payload de actualización:', body);
    
    // 🔹 Hacer la solicitud PUT
    const response = await makeApiRequest<BackendTeam>(
      `${API_TOURNAMENTS}/${tournamentIdNum}/teams/${realTeamId}`,
      'PUT',
      body
    );

    console.log('✅ Equipo actualizado exitosamente:', response.name);
    
    // 🔹 Retornar equipo actualizado
    return {
      id: String(realTeamId),
      name: response.name,
      coach: response.coach,
      category: response.category,
      mainField: response.mainStadium,
      secondaryField: response.secondaryStadium,
      players: team.players // Mantener los jugadores existentes
    };
    
  } catch (error: any) {
    console.error('❌ ERROR actualizando equipo:', error.message);
    throw error;
  }
}

// ============================================================
// 🔹 PUT: Actualizar un jugador (MEJORADA)
// ============================================================

export async function updatePlayerDetails(
  idTournament: string,
  idTeam: string,
  player: Player
): Promise<Player> {
  console.log('🔄 === UPDATE PLAYER DETAILS ===');
  console.log(`📌 ID del equipo: ${idTeam} (esto es la posición en la lista)`);
  
  const tournamentIdNum = parseInt(idTournament, 10);
  const positionInList = parseInt(idTeam, 10);

  try {
    // 🔹 Obtener el ID real del equipo
    const realTeamId = await getRealTeamId(idTournament, idTeam);
    
    console.log(`🔍 Actualizando jugador en equipo posición ${positionInList} → ID real del equipo: ${realTeamId}`);
    
    // 🔹 Crear body para actualización
    const body: UpdatePlayerDTO = mapFrontendPlayerToBackend(player);
    
    console.log('📤 Payload de actualización:', body);
    
    // 🔹 Hacer la solicitud PUT
    const response = await makeApiRequest<BackendPlayer>(
      `${API_PLAYERS}/${tournamentIdNum}/teams/${realTeamId}`,
      'PUT',
      body
    );

    console.log('✅ Jugador actualizado exitosamente:', response.name);
    
    // 🔹 Retornar jugador actualizado
    return mapBackendPlayer(response);
    
  } catch (error: any) {
    console.error('❌ ERROR actualizando jugador:', error.message);
    throw error;
  }
}

// ============================================================
// 🔹 Exportar servicio (RESTAURADO COMPLETO)
// ============================================================

export default {
  getTeamDetails,
  updateTeamDetails,
  updatePlayerDetails,
  updateMultiplePlayers, // Agregar esta línea
  getRealTeamId,
};