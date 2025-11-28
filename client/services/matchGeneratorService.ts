import axios from "axios";
import { getToken } from "./authService";

// ===========================
//   URL BASE SEGÚN BACKEND
// ===========================
const API_TOURNAMENT = "http://localhost:8085/api/tournaments";

// ===========================
//   INTERFACES PARA TIPADO
// ===========================
export interface GeneratedMatch {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  matchDateTime: string;
  round?: string;
}

// ===========================
//   GENERAR ENFRENTAMIENTOS (POST) - MEJORADO
// ===========================
export const generarLlavesEnfrentamientos = async (tournamentId: number): Promise<GeneratedMatch[]> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    console.log(`🔄 Generando llaves para torneo ID: ${tournamentId}`);

    const response = await axios.post(
      `${API_TOURNAMENT}/${tournamentId}/matches/generator`,
      {}, // el backend NO requiere body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos timeout
      }
    );

    console.log(`✅ Llaves generadas exitosamente para torneo ${tournamentId}:`, {
      status: response.status,
      cantidadPartidos: Array.isArray(response.data) ? response.data.length : 'estructura inesperada',
      data: response.data
    });

    // Validar la estructura de la respuesta
    if (!response.data) {
      console.warn("⚠️ La respuesta del servidor está vacía");
      return [];
    }

    if (Array.isArray(response.data)) {
      // Validar que cada elemento tenga la estructura esperada
        const partidosValidos = response.data.filter((p: any) =>
          p.matchId !== undefined &&
          typeof p.homeTeam === "string" &&
          typeof p.awayTeam === "string"
        );

      if (partidosValidos.length !== response.data.length) {
        console.warn(`⚠️ Se filtraron ${response.data.length - partidosValidos.length} partidos inválidos`);
      }

      console.log(`🎯 ${partidosValidos.length} partidos válidos generados`);
      return partidosValidos;
    } else {
      console.error("❌ La respuesta no es un array:", response.data);
      throw new Error("Formato de respuesta inválido: se esperaba un array de partidos");
    }

  } catch (error: any) {
    console.error("❌ Error generando llaves:", {
      tournamentId,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });

    // Manejar diferentes tipos de errores
    if (error.response) {
      // Error del servidor con respuesta
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      switch (status) {
        case 400:
          throw new Error(`Solicitud inválida: ${message || "El torneo no cumple con los requisitos para generar partidos"}`);
        case 401:
          throw new Error("No autorizado: Token inválido o expirado");
        case 403:
          throw new Error("Acceso denegado: No tienes permisos para esta acción");
        case 404:
          throw new Error(`Torneo no encontrado: No existe el torneo con ID ${tournamentId}`);
        case 409:
          throw new Error(`Conflicto: ${message || "Ya existen partidos generados para este torneo"}`);
        case 422:
          throw new Error(`Datos inválidos: ${message || "El torneo no tiene suficientes equipos registrados"}`);
        case 500:
          throw new Error(`Error interno del servidor: ${message || "Intente nuevamente más tarde"}`);
        default:
          throw new Error(`Error ${status}: ${message || "Error desconocido del servidor"}`);
      }
    } else if (error.request) {
      // Error de red (sin respuesta)
      if (error.code === 'ECONNABORTED') {
        throw new Error("Timeout: La solicitud tardó demasiado tiempo en completarse");
      }
      throw new Error("Error de conexión: No se pudo conectar con el servidor");
    } else {
      // Error en la configuración de la solicitud
      throw new Error(`Error de configuración: ${error.message}`);
    }
  }
};

// ===========================
//   VERIFICAR SI EXISTEN PARTIDOS GENERADOS (OPCIONAL)
// ===========================
export const verificarPartidosExistentes = async (tournamentId: number): Promise<boolean> => {
  try {
    const token = getToken();
    
    const response = await axios.get(
      `${API_TOURNAMENT}/${tournamentId}/matches/upcoming`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { numberRegisters: 1 } // Solo necesitamos saber si existe al menos uno
      }
    );

    return response.data.matches && response.data.matches.length > 0;
  } catch (error) {
    console.error("Error verificando partidos existentes:", error);
    return false;
  }
};

// ===========================
//   ELIMINAR PARTIDOS GENERADOS (OPCIONAL - PARA RESET)
// ===========================
export const eliminarPartidosGenerados = async (tournamentId: number): Promise<void> => {
  try {
    const token = getToken();
    
    // Nota: Esta función asume que existe un endpoint para eliminar partidos
    // Si no existe, sería necesario implementarlo en el backend
    const response = await axios.delete(
      `${API_TOURNAMENT}/${tournamentId}/matches`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    console.log(`🗑️ Partidos eliminados para torneo ${tournamentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error eliminando partidos:", error);
    throw new Error(`No se pudieron eliminar los partidos: ${error.message}`);
  }
};

export default {
  generarLlavesEnfrentamientos,
  verificarPartidosExistentes,
  eliminarPartidosGenerados,
};