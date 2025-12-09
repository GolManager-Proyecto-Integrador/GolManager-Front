import axios, { AxiosError } from 'axios';
import { getToken } from "./authService";

const API_URL = "http://localhost:8085/api/tournaments";
const API_REFEREES_URL = "http://localhost:8085/api/referees";

// =======================
// 🔍 FUNCIÓN DE DEBUG MEJORADA
// =======================
const getCleanToken = (): string | null => {
  console.group('🔄 getCleanToken() - Análisis completo');
  
  // Paso 1: Obtener token de getToken()
  let token: string | null = getToken();
  console.log('1️⃣ Token de getToken():', token ? token : 'NULL/UNDEFINED');
  console.log('   📏 Longitud:', token ? token.length : 0);
  console.log('   🔍 Tipo:', typeof token);
  
  if (token) {
    console.log('   👀 Primeros 50 chars:', token.substring(0, Math.min(50, token.length)));
    console.log('   🔎 Tiene comillas?:', token.includes('"'));
    console.log('   🔎 Tiene "Bearer"?:', token.includes('Bearer'));
  }
  
  // Paso 2: Si no hay token, intentar localStorage
  if (!token || token === 'null' || token === 'undefined' || token === '""') {
    console.log('2️⃣ getToken() no devolvió token válido, probando localStorage...');
    token = localStorage.getItem("token");
    console.log('   🏪 Token de localStorage:', token);
    console.log('   📏 Longitud localStorage:', token ? token.length : 0);
  }
  
  if (!token) {
    console.error('❌ No se encontró token en ninguna fuente');
    console.groupEnd();
    return null;
  }
  
  // Paso 3: Guardar token original para debug
  const originalToken = token;
  console.log('3️⃣ Token original para limpieza:', originalToken);
  
  // Paso 4: Limpiar token
  // 4.1 Quitar comillas si empieza y termina con ellas
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
    console.log('   ✅ Comillas dobles removidas');
  } else if (token.startsWith("'") && token.endsWith("'")) {
    token = token.slice(1, -1);
    console.log('   ✅ Comillas simples removidas');
  }
  
  // 4.2 Quitar espacios al inicio y final
  token = token.trim();
  console.log('   ✅ Espacios trimmeados');
  
  // 4.3 Quitar "Bearer " si ya lo tiene
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
    console.log('   ✅ "Bearer " removido');
  }
  
  // 4.4 Verificar si aún tiene "Bearer" en otro lugar
  if (token.includes('Bearer')) {
    console.warn('⚠️ Token todavía contiene "Bearer" después de limpieza');
    token = token.replace('Bearer', '').trim();
    console.log('   🔄 "Bearer" removido después de limpieza');
  }
  
  console.log('4️⃣ Resultado final:');
  console.log('   ✨ Token limpio:', token.substring(0, Math.min(50, token.length)) + '...');
  console.log('   📏 Longitud final:', token.length);
  console.log('   🔄 Cambios aplicados:', originalToken !== token);
  
  console.groupEnd();
  return token;
};

// =======================
// 🚀 HEADERS CON DEBUG
// =======================
interface AuthHeaders {
  headers: {
    'Content-Type': string;
    'Authorization'?: string;
  };
}

const authHeaders = (): AuthHeaders => {
  console.group('📨 authHeaders() - Construyendo headers');
  
  const token = getCleanToken();
  
  if (!token) {
    console.error('❌ No hay token disponible para headers');
    console.groupEnd();
    return { headers: { 'Content-Type': 'application/json' } };
  }
  
  const headers: AuthHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  console.log('✅ Headers construidos:');
  console.log('   📋 Content-Type:', headers.headers['Content-Type']);
  console.log('   🔐 Authorization:', `Bearer ${token.substring(0, 30)}...`);
  console.log('   📏 Longitud total Authorization:', headers.headers['Authorization']?.length || 0);
  
  console.groupEnd();
  return headers;
};

// =======================
// 🎯 FUNCIONES DEL SERVICIO CON DEBUG COMPLETO
// =======================

interface MatchData {
  homeTeamId: number;
  awayTeamId: number;
  tournamentId: number;
  stadiumName: string;
  referee: number;
  matchDate: string;
}

// Crear un partido con fecha
export const createMatch = async (tournamentId: number, matchData: MatchData) => {
  console.group(`🚀 CREATE MATCH - Tournament ${tournamentId}`);
  
  const url = `${API_URL}/${tournamentId}/matches`;
  console.log('🎯 Endpoint:', url);
  console.log('📤 Payload completo:', JSON.stringify(matchData, null, 2));
  console.log('📝 Campos específicos:');
  console.log('   • homeTeamId:', matchData.homeTeamId);
  console.log('   • awayTeamId:', matchData.awayTeamId);
  console.log('   • tournamentId:', matchData.tournamentId);
  console.log('   • stadiumName:', matchData.stadiumName);
  console.log('   • referee:', matchData.referee);
  console.log('   • matchDate:', matchData.matchDate);
  
  try {
    console.log('🔄 Obteniendo headers de autenticación...');
    const headers = authHeaders();
    
    if (!headers.headers.Authorization || !headers.headers.Authorization.includes('Bearer ')) {
      console.error('❌ ERROR CRÍTICO: Headers sin Authorization Bearer');
      console.log('🔍 Headers actuales:', headers);
      throw new Error('Falta token de autenticación');
    }
    
    console.log('📤 Enviando request POST...');
    const startTime = Date.now();
    
    const res = await axios.post(url, matchData, headers);
    
    const endTime = Date.now();
    console.log(`✅ ÉXITO! Request completado en ${endTime - startTime}ms`);
    console.log('📊 Response:');
    console.log('   • Status:', res.status);
    console.log('   • Data:', res.data);
    console.log('   • Headers:', res.headers);
    
    console.groupEnd();
    return res.data;
    
  } catch (error) {
    console.error('❌ ERROR en createMatch:');
    
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      console.error('📊 Detalles del error del servidor:');
      console.log('   • Status:', axiosError.response.status);
      console.log('   • Status Text:', axiosError.response.statusText);
      console.log('   • Data:', axiosError.response.data);
      console.log('   • Headers:', axiosError.response.headers);
      
      if (axiosError.response.status === 401) {
        console.error('🔐 ERROR 401 - ANÁLISIS:');
        console.log('   • URL:', axiosError.config?.url);
        console.log('   • Método:', axiosError.config?.method);
        console.log('   • ¿Es problema de CORS?:', axiosError.code === 'ERR_NETWORK');
        
        // Verificar diferencias con Postman
        console.log('🔍 COMPARACIÓN CON POSTMAN (que funciona):');
        console.log('   • Misma URL?:', url === 'http://localhost:8085/api/tournaments/1/matches');
        console.log('   • Mismo payload?:', JSON.stringify(matchData));
        console.log('   • ¿Headers diferentes?');
      }
    } else if (axiosError.request) {
      console.error('🌐 Error de red - No hubo respuesta:', axiosError.request);
    } else {
      console.error('⚡ Error de configuración:', axiosError.message);
    }
    
    console.groupEnd();
    throw error;
  }
};

// Generar los partidos automáticamente
export const generateMatches = async (tournamentId: number) => {
  console.log(`🔄 generateMatches - Tournament ${tournamentId}`);
  const url = `${API_URL}/${tournamentId}/matches/generator`;
  const headers = authHeaders();
  const res = await axios.post(url, {}, headers);
  return res.data;
};

// Obtener un partido por ID
export const getMatchById = async (tournamentId: number, matchId: number) => {
  console.log(`🔍 getMatchById - Tournament ${tournamentId}, Match ${matchId}`);
  const url = `${API_URL}/${tournamentId}/matches/${matchId}`;
  const headers = authHeaders();
  const res = await axios.get(url, headers);
  return res.data;
};

// Obtener próximos partidos
export const getUpcomingMatches = async (tournamentId: number, numberRegisters = 3) => {
  console.log(`📅 getUpcomingMatches - Tournament ${tournamentId}, Limit: ${numberRegisters}`);
  const url = `${API_URL}/${tournamentId}/matches/upcoming`;
  const headers = authHeaders();
  const res = await axios.get(url, {
    ...headers,
    params: { numberRegisters }
  });
  return res.data;
};

// Obtener partidos jugados
export const getPlayedMatches = async (tournamentId: number, numberRegisters = 3) => {
  console.log(`🏁 getPlayedMatches - Tournament ${tournamentId}, Limit: ${numberRegisters}`);
  const url = `${API_URL}/${tournamentId}/matches/played`;
  const headers = authHeaders();
  const res = await axios.get(url, {
    ...headers,
    params: { numberRegisters }
  });
  return res.data;
};

// Obtener equipos del torneo
export const getTournamentTeams = async (tournamentId: number) => {
  console.log(`👥 getTournamentTeams - Tournament ${tournamentId}`);
  const url = `${API_URL}/${tournamentId}/teams`;
  const headers = authHeaders();
  const res = await axios.get(url, headers);
  return res.data;
};

// Obtener árbitros
export const getReferees = async () => {
  console.log(`⚽ getReferees`);
  const headers = authHeaders();
  const res = await axios.get(API_REFEREES_URL, headers);
  return res.data;
};

// Obtener detalles del torneo
export const getTournamentDetails = async (tournamentId: number) => {
  console.log(`🏆 getTournamentDetails - Tournament ${tournamentId}`);
  const url = `${API_URL}/${tournamentId}`;
  const headers = authHeaders();
  const res = await axios.get(url, headers);
  return res.data;
};

interface UpdateMatchData {
  matchId: number;
  matchDate: string;
  stadium: string;
  refereeId: number;
}

// Actualizar partido
export const updateMatch = async (tournamentId: number, matchData: UpdateMatchData) => {
  console.group(`✏️ UPDATE MATCH - Tournament ${tournamentId}`);
  console.log('🎯 Endpoint:', `${API_URL}/${tournamentId}/matches`);
  console.log('📤 Payload:', matchData);
  
  const url = `${API_URL}/${tournamentId}/matches`;
  const headers = authHeaders();
  const res = await axios.put(url, matchData, headers);
  
  console.log('✅ Update completado:', res.status);
  console.groupEnd();
  return res.data;
};

// Eliminar partido
export const deleteMatch = async (tournamentId: number, matchId: number) => {
  console.group(`🗑️ DELETE MATCH - Tournament ${tournamentId}, Match ${matchId}`);
  
  const url = `${API_URL}/${tournamentId}/matches?matchId=${matchId}`;
  console.log('🎯 Endpoint:', url);
  
  const headers = authHeaders();
  const res = await axios.delete(url, headers);
  
  console.log('✅ Delete completado:', res.status);
  console.groupEnd();
  return res.data;
};

// =======================
// 🛠️ FUNCIÓN DE DIAGNÓSTICO MANUAL
// =======================
export const diagnoseAuth = () => {
  console.group('🔍 DIAGNÓSTICO MANUAL DE AUTENTICACIÓN');
  
  // 1. Ver todas las fuentes de token
  console.log('1️⃣ FUENTES DE TOKEN:');
  const tokenFromGetToken = getToken();
  const tokenFromLocalStorage = localStorage.getItem("token");
  
  console.log('   • getToken():', tokenFromGetToken || 'NULL');
  console.log('   • localStorage:', tokenFromLocalStorage || 'NULL');
  
  // 2. Ver estado del token limpio
  console.log('2️⃣ TOKEN LIMPIO:');
  const cleanToken = getCleanToken();
  console.log('   • Resultado:', cleanToken ? 'OBTENIDO' : 'NO OBTENIDO');
  if (cleanToken) {
    console.log('   • Longitud:', cleanToken.length);
    console.log('   • Preview:', cleanToken.substring(0, 30) + '...');
  }
  
  // 3. Ver headers que se generarían
  console.log('3️⃣ HEADERS GENERADOS:');
  const headers = authHeaders();
  console.log('   • Authorization presente:', !!headers.headers.Authorization);
  if (headers.headers.Authorization) {
    console.log('   • Valor:', headers.headers.Authorization.substring(0, 50) + '...');
  }
  
  // 4. Probar conexión simple
  console.log('4️⃣ PRUEBA DE CONEXIÓN SIMPLE:');
  console.log('   • API_URL:', API_URL);
  console.log('   • ¿Backend accesible?:', 'Probar manualmente');
  
  console.groupEnd();
  
  return {
    tokenFromGetToken,
    tokenFromLocalStorage,
    cleanToken,
    headers
  };
};