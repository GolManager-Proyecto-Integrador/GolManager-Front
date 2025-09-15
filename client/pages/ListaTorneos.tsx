import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  Calendar,
  Trophy,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

// Tipos para el estado del torneo
type TournamentStatus = "pendiente" | "en_curso" | "finalizado";

interface Tournament {
  id: number;
  name: string;
  startDate: string;
  status: TournamentStatus;
}

// Datos simulados de torneos
const initialTournaments: Tournament[] = [
  {
    id: 1,
    name: "Copa Primavera 2024",
    startDate: "2024-03-15",
    status: "en_curso"
  },
  {
    id: 2,
    name: "Liga Regional Antioquia",
    startDate: "2024-04-20",
    status: "pendiente"
  },
  {
    id: 3,
    name: "Torneo Intermunicipal",
    startDate: "2024-02-10",
    status: "finalizado"
  },
  {
    id: 4,
    name: "Copa Juvenil 2024",
    startDate: "2024-05-05",
    status: "pendiente"
  },
  {
    id: 5,
    name: "Liga Empresarial",
    startDate: "2024-01-20",
    status: "finalizado"
  },
  {
    id: 6,
    name: "Torneo de Verano",
    startDate: "2024-03-25",
    status: "en_curso"
  },
  {
    id: 7,
    name: "Copa Ciudad",
    startDate: "2024-06-10",
    status: "pendiente"
  },
  {
    id: 8,
    name: "Liga Amateur",
    startDate: "2024-04-15",
    status: "pendiente"
  },
  {
    id: 9,
    name: "Torneo Navideño 2023",
    startDate: "2023-12-15",
    status: "finalizado"
  },
  {
    id: 10,
    name: "Copa Barrios Unidos",
    startDate: "2024-03-30",
    status: "en_curso"
  },
  {
    id: 11,
    name: "Liga Estudiantil",
    startDate: "2024-05-20",
    status: "pendiente"
  },
  {
    id: 12,
    name: "Torneo Relámpago",
    startDate: "2024-07-01",
    status: "pendiente"
  }
];

export default function ListaTorneos() {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(initialTournaments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const tournamentsPerPage = 6;

  // Función para obtener el color del estado
  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_curso":
        return "bg-green-100 text-green-800 border-green-200";
      case "finalizado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: TournamentStatus) => {
    switch (status) {
      case "pendiente":
        return "Pendiente";
      case "en_curso":
        return "En curso";
      case "finalizado":
        return "Finalizado";
      default:
        return "Desconocido";
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrar torneos
  const applyFilters = () => {
    setIsLoading(true);
    
    // Simular tiempo de carga
    setTimeout(() => {
      let filtered = tournaments;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        filtered = filtered.filter(tournament =>
          tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtrar por estado
      if (statusFilter !== "todos") {
        filtered = filtered.filter(tournament => tournament.status === statusFilter);
      }

      // Filtrar por fecha de inicio
      if (startDateFilter) {
        filtered = filtered.filter(tournament => tournament.startDate >= startDateFilter);
      }

      // Filtrar por fecha de fin
      if (endDateFilter) {
        filtered = filtered.filter(tournament => tournament.startDate <= endDateFilter);
      }

      setFilteredTournaments(filtered);
      setCurrentPage(1);
      setIsLoading(false);
    }, 500);
  };

  // Simular actualización automática (nuevos torneos)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular que aparece un nuevo torneo cada 30 segundos
      const newTournament: Tournament = {
        id: Date.now(),
        name: `Nuevo Torneo ${Math.floor(Math.random() * 1000)}`,
        startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: ["pendiente", "en_curso", "finalizado"][Math.floor(Math.random() * 3)] as TournamentStatus
      };

      setTournaments(prev => [newTournament, ...prev]);
      
      // Aplicar filtros automáticamente
      if (searchTerm === "" && statusFilter === "todos" && !startDateFilter && !endDateFilter) {
        setFilteredTournaments(prev => [newTournament, ...prev]);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [searchTerm, statusFilter, startDateFilter, endDateFilter]);

  // Paginación
  const indexOfLastTournament = currentPage * tournamentsPerPage;
  const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage;
  const currentTournaments = filteredTournaments.slice(indexOfFirstTournament, indexOfLastTournament);
  const totalPages = Math.ceil(filteredTournaments.length / tournamentsPerPage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8FA' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Torneos Disponibles
            </h1>
            <p className="text-gray-600 text-lg">
              Descubre y participa en los torneos de fútbol de tu región
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5" style={{ color: '#007BFF' }} />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Campo de búsqueda */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por nombre
                </label>
                <Input
                  placeholder="Nombre del torneo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                    <SelectItem value="en_curso">En curso</SelectItem>
                    <SelectItem value="finalizado">Finalizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <Input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <Input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Botón de búsqueda */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={applyFilters}
                disabled={isLoading}
                className="px-8 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                style={{ backgroundColor: '#007BFF' }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#007BFF' }} />
            <p className="text-gray-600">Buscando torneos...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && currentTournaments.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ⚠️ Aún no hay torneos registrados
            </h3>
            <p className="text-gray-600 text-lg">
              {filteredTournaments.length === 0 && tournaments.length > 0
                ? "No se encontraron torneos que coincidan con tus filtros."
                : "Pronto habrá nuevos torneos disponibles. ¡Vuelve más tarde!"}
            </p>
          </div>
        )}

        {/* Tournament Cards */}
        {!isLoading && currentTournaments.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentTournaments.map((tournament) => (
                <Card 
                  key={tournament.id}
                  className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" style={{ color: '#007BFF' }} />
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                          {tournament.name}
                        </CardTitle>
                      </div>
                      <Badge 
                        className={`${getStatusColor(tournament.status)} border`}
                        variant="outline"
                      >
                        {getStatusText(tournament.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Inicio: {formatDate(tournament.startDate)}
                      </span>
                    </div>
                    
                    <Link to={`/torneo/${tournament.id}`}>
                      <Button 
                        className="w-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                        style={{ backgroundColor: '#007BFF' }}
                      >
                        Ver Detalles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Statistics */}
        {!isLoading && filteredTournaments.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Mostrando {currentTournaments.length} de {filteredTournaments.length} torneos
              {filteredTournaments.length !== tournaments.length && 
                ` (${tournaments.length} total)`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
