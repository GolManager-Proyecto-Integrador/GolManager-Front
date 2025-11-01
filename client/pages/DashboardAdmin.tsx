import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/services/authService";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Trophy,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { dashboardService } from "@/services/admdashboardService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    userName: "Cargando...",
    numOrganizers: 0,
    numTournaments: 0,
    numTeams: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("⚠️ No se encontró el token de autenticación");
          navigate("/login");
          return;
        }

        const data = await dashboardService.getDashboardData(token);
        setDashboardData(data);
      } catch (err: any) {
        setError(
          `⚠️ ${err.messages || err.error || "Error al cargar el dashboard"}`
        );
      }
    };

    fetchDashboard();
  }, [navigate]);

  const summaryMetrics = [
    {
      id: "organizers",
      label: "Organizadores registrados",
      value: dashboardData.numOrganizers,
      description: "Registrados actualmente",
      icon: Users,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      id: "tournaments",
      label: "Torneos creados",
      value: dashboardData.numTournaments,
      description: "Creados en el sistema",
      icon: Trophy,
      accent: "bg-purple-100 text-purple-600",
    },
    {
      id: "teams",
      label: "Equipos registrados",
      value: dashboardData.numTeams,
      description: "Equipos",
      icon: Shield,
      accent: "bg-emerald-100 text-emerald-600",
    },
  ];

  const navigationLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/admin-dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    {
      id: "organizers",
      label: "Organizadores",
      path: "/organizers",
      icon: Users,
    },
    {
      id: "reports",
      label: "Reportes",
      path: "/reporte-sistema",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <aside className="bg-white border-b border-gray-200 shadow-sm lg:border-b-0 lg:border-r w-full lg:w-64">
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
              Panel administrativo
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900 flex items-center">
              <LayoutDashboard className="w-5 h-5 mr-2 text-primary" />
              Dashboard
            </h2>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationLinks.map(({ id, label, path, icon: Icon, active }) => (
              <Button
                key={id}
                variant="ghost"
                className={`w-full justify-start h-auto py-3 px-4 text-sm font-semibold rounded-xl transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-primary hover:bg-primary/5"
                }`}
                onClick={() => navigate(path)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {label}
              </Button>
            ))}
          </nav>

          <div className="px-4 py-6 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={() => {
                logout(); // 👈 elimina el token
                navigate("/login"); // redirige al login
              }}
              className="w-full justify-start h-auto py-3 px-4 text-sm font-semibold rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-10 space-y-10">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard del Administrador
              </h1>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                Monitorea el estado general del sistema y accede rápidamente a
                las funciones clave.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Administrador
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {dashboardData.userName}
                </p>
              </div>
              <Avatar className="h-12 w-12 border border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {dashboardData.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {summaryMetrics.map(
                ({ id, label, value, description, icon: Icon, accent }) => (
                  <Card
                    key={id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border-0"
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-0">
                      <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        {label}
                      </CardTitle>
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${accent}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 pb-8 text-center space-y-2">
                      <p className="text-5xl font-extrabold text-gray-900">
                        {value}
                      </p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
