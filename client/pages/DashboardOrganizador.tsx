import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid,
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus,
  TrendingUp,
  Menu,
  X,
  Flag
} from "lucide-react";
import { 
  fetchDashboardStats, 
  fetchOrganizerInfo, 
  DashboardStats, 
  OrganizerInfo 
} from "../services/dashboardService";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [organizer, setOrganizer] = useState<OrganizerInfo | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await fetchDashboardStats();
        const organizerData = await fetchOrganizerInfo();
        setStats(statsData);
        setOrganizer(organizerData);
      } catch (err) {
        console.error("Error cargando datos del dashboard:", err);
      }
    }
    loadData();
  }, []);

  const navigationItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Trophy, label: "Torneos", href: "/lista-torneos" },
    { icon: Users, label: "Equipos y jugadores", href: "/teams-manage" },
    { icon: Calendar, label: "Calendario", href: "/calendario" },
    { icon: BarChart3, label: "Resultados y posiciones", href: "/resultados" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8FA' }}>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:w-64 lg:flex-shrink-0
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#007BFF' }}>
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
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${item.active 
                  ? 'text-white' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              style={item.active ? { backgroundColor: '#007BFF' } : {}}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-0 flex-1">
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
                    {organizer?.name ?? "Cargando..."}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {organizer
                      ? organizer.name.split(" ").map(n => n[0]).join("").substring(0,2)
                      : "OC"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8">
          <div className="flex justify-start">
            <Link to="/crear-torneo">
              <Button 
                size="lg"
                className="text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                style={{ backgroundColor: '#007BFF' }}
              >
                <Plus className="w-6 h-6 mr-3" />
                Crear nuevo torneo
              </Button>
            </Link>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/lista-torneos">
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
                      {stats?.totalTournaments ?? 0}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">+2 este mes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/lista-torneos">
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
                      {stats?.activeTournaments ?? 0}
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
                      {stats?.upcomingMatches ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">Esta semana</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/teams">
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
                      {stats?.registeredTeams ?? 0}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">+5 nueva inscripción</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Navegación rápida */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Navegación rápida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link to="/lista-torneos">
                <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#007BFF20' }}>
                        <Trophy className="w-6 h-6" style={{ color: '#007BFF' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Gestionar Torneos</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/teams">
                <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#007BFF20' }}>
                        <Users className="w-6 h-6" style={{ color: '#007BFF' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Gestionar Equipos</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/resultados">
                <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#007BFF20' }}>
                        <BarChart3 className="w-6 h-6" style={{ color: '#007BFF' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Generar Reportes</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dashboard?section=perfil">
                <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#007BFF20' }}>
                        <Settings className="w-6 h-6" style={{ color: '#007BFF' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Configuración de Perfil</h4>
                        <p className="text-sm text-gray-600">Ajustes y preferencias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/login">
                <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer border-0 shadow-md bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#007BFF20' }}>
                        <LogOut className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Cerrar Sesión</h4>
                        <p className="text-sm text-gray-600">Salir del sistema</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
