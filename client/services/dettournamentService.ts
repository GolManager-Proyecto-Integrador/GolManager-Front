import axios from "axios";
import { getToken } from "./authService";

const API_URL = "/api/tournaments";

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "pendiente" | "en_curso" | "finalizado";
  description: string;
}

export interface Match {
  id: number;
  date: string;
  time: string;
  teamA: string;
  teamB: string;
  phase: string;
  result?: {
    scoreA: number;
    scoreB: number;
    winner: string;
  };
}

export interface TeamPosition {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  isQualified?: boolean;
}

// ===========================
//   HEADERS DE AUTENTICACIÓN
// ===========================
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  }
});

// ===========================
//   MANEJO DE ERRORES CENTRALIZADO
// ===========================
const handleApiError = (error: any, operation: string) => {
  console.error(`❌ Error en ${operation}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });

  if (error.response?.status === 401) {
    throw new Error("No autorizado: Por favor, inicia sesión nuevamente");
  } else if (error.response?.status === 403) {
    throw new Error("Acceso denegado: No tienes permisos para esta acción");
  } else if (error.response?.status === 404) {
    throw new Error("Recurso no encontrado");
  } else if (error.response?.status === 500) {
    throw new Error("Error interno del servidor");
  } else if (error.code === 'ECONNABORTED') {
    throw new Error("Timeout: La solicitud tardó demasiado tiempo");
  } else if (error.request) {
    throw new Error("Error de conexión: No se pudo conectar con el servidor");
  } else {
    throw new Error(`Error en ${operation}: ${error.message}`);
  }
};

const tournamentService = {
  // ===========================
  //   OBTENER DETALLES DEL TORNEO
  // ===========================
  async getTournamentDetails(id: string): Promise<Tournament> {
    try {
      const response = await axios.get(
        `${API_URL}/${id}`, 
        getAuthHeaders()
      );
      console.log(`✅ Detalles del torneo ${id} obtenidos correctamente`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, `obtener detalles del torneo ${id}`);
      throw error; // Re-lanzar el error después de manejarlo
    }
  },

  // ===========================
  //   OBTENER PARTIDOS DEL TORNEO
  // ===========================
  async getMatches(tournamentId: string): Promise<Match[]> {
    try {
      const response = await axios.get(
        `${API_URL}/${tournamentId}/matches`, 
        getAuthHeaders()
      );
      console.log(`✅ Partidos del torneo ${tournamentId} obtenidos correctamente`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, `obtener partidos del torneo ${tournamentId}`);
      throw error;
    }
  },

  // ===========================
  //   OBTENER TABLA DE POSICIONES
  // ===========================
  async getStandings(tournamentId: string): Promise<TeamPosition[]> {
    try {
      const response = await axios.get(
        `${API_URL}/${tournamentId}/standings`, 
        getAuthHeaders()
      );
      console.log(`✅ Tabla de posiciones del torneo ${tournamentId} obtenida correctamente`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, `obtener tabla de posiciones del torneo ${tournamentId}`);
      throw error;
    }
  },

  // ===========================
  //   CREAR NUEVO TORNEO (SI ES NECESARIO)
  // ===========================
  async createTournament(tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> {
    try {
      const response = await axios.post(
        API_URL, 
        tournamentData, 
        getAuthHeaders()
      );
      console.log('✅ Torneo creado correctamente');
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'crear torneo');
      throw error;
    }
  },

  // ===========================
  //   ACTUALIZAR TORNEO
  // ===========================
  async updateTournament(id: string, tournamentData: Partial<Tournament>): Promise<Tournament> {
    try {
      const response = await axios.put(
        `${API_URL}/${id}`, 
        tournamentData, 
        getAuthHeaders()
      );
      console.log(`✅ Torneo ${id} actualizado correctamente`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, `actualizar torneo ${id}`);
      throw error;
    }
  },

  // ===========================
  //   ELIMINAR TORNEO
  // ===========================
  async deleteTournament(id: string): Promise<void> {
    try {
      await axios.delete(
        `${API_URL}/${id}`, 
        getAuthHeaders()
      );
      console.log(`✅ Torneo ${id} eliminado correctamente`);
    } catch (error: any) {
      handleApiError(error, `eliminar torneo ${id}`);
      throw error;
    }
  },

  // ===========================
  //   OBTENER TODOS LOS TORNEOS
  // ===========================
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      const response = await axios.get(
        API_URL, 
        getAuthHeaders()
      );
      console.log('✅ Lista de torneos obtenida correctamente');
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'obtener lista de torneos');
      throw error;
    }
  }
};

export default tournamentService;