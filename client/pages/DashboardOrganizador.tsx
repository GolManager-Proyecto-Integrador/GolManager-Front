// DashboardOrganizador.tsx - MEJORADO
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService";
import { 
  LayoutGrid,
  Trophy, 
  Users, 
  Calendar, 
  BarChart3,
  LogOut, 
  Plus,
  TrendingUp,
  Menu,
  X,
  Flag,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { 
  fetchDashboardStats, 
  fetchOrganizerInfo, 
  DashboardStats, 
  OrganizerInfo 
} from "../services/orgdashboardService";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [organizer, setOrganizer] = useState<OrganizerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando datos del dashboard...');
        const [statsData, organizerData] = await Promise.all([
          fetchDashboardStats(),
          fetchOrganizerInfo()
        ]);
        
        setStats(statsData);
        setOrganizer(organizerData);
        console.log('✅ Datos del dashboard cargados exitosamente');
        
      } catch (err: any) {
        console.error("Error cargando datos del dashboard:", err);
        setError(err.message || "Error al cargar el dashboard");
        
        // Datos de ejemplo en caso de error
        setStats({
          numTournaments: 5,
          numTournamentsCreateThisMonth: 2,
          numTournamentsInProgress: 2,
          numMatchesThisWeek: 8,
          numTeamsRegistered: 24,
          userName: "Organizador"
        });
        setOrganizer({
          id: '1',
          name: 'Organizador Principal',
          email: 'organizador@torneos.com'
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    document.title = `Panel de Organizador`;
  }, []);

  const navigationItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard-organizador" },
    { icon: Trophy, label: "Torneos", href: "/gestion-competencias" },
    { icon: Calendar, label: "Calendario", href: "/calendario" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#007BFF" }}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Torneos FC</h2>
                <p className="text-sm text-gray-500">Panel Organizador</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navigationItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${active
                    ? "text-white font-semibold shadow-md"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
                `}
                style={active ? { backgroundColor: "#007BFF" } : {}}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 -mt-0.5">
                      Panel central de gestión de torneos
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Organizador</p>
                  <p className="font-semibold text-gray-900">
                    {stats?.userName ?? "Organizador"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                      {stats?.userName ? stats.userName.substring(0, 2).toUpperCase() : "OR"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* Mensaje de error */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">Aviso del sistema</p>
                  <p className="text-yellow-700 text-sm">
                    {error} - Mostrando datos de ejemplo para desarrollo.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-yellow-700 border-yellow-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Botón crear competencia */}
          <div className="flex justify-start">
            <Link to="/gestion-competencias">
              <Button
                size="lg"
                className="text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                style={{ backgroundColor: "#007BFF" }}
              >
                <Plus className="w-6 h-6 mr-3" />
                Crear nueva competencia
              </Button>
            </Link>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/gestion-competencias">
              <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Competencias creadas
                    </CardTitle>
                    <Trophy className="w-8 h-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.numTournaments ?? 0}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">
                      +{stats?.numTournamentsCreateThisMonth ?? 0} este mes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gestion-competencias">
              <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Competencias activas
                    </CardTitle>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.numTournamentsInProgress ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">En curso actualmente</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/calendario">  
              <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Próximos partidos
                    </CardTitle>
                    <Flag className="w-8 h-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.numMatchesThisWeek ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">Esta semana</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tournament/20/teams-manage">
              <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Equipos inscritos
                    </CardTitle>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.numTeamsRegistered ?? 0}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">
                        +5 nueva inscripción
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}