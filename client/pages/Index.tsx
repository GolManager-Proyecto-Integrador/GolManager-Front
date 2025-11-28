import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, ChevronRight, LogIn, Eye } from "lucide-react";

useEffect(() => {
  document.title = `GolManager`;
}, );

export default function Index() {
  // Mock data for featured tournaments
  const featuredTournaments = [
    {
      id: 1,
      name: "Copa Primavera 2025",
      startDate: "25 de Diciembre, 2025",
      status: "en curso",
      statusColor: "bg-blue-500 text-white",
    },
    {
      id: 2,
      name: "Liga Juvenil Bogotá",
      startDate: "22 de Diciembre, 2025", 
      status: "pendiente",
      statusColor: "bg-yellow-500 text-white",
    },
    {
      id: 3,
      name: "Torneo de Verano",
      startDate: "12 de Diciembre, 2025",
      status: "finalizado",
      statusColor: "bg-green-500 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header Section */}
      <header className="container mx-auto px-4 py-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-blue-600 rounded-full shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Gestor Web de Torneos de Fútbol
            </h1>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Consulta torneos, resultados y posiciones. Administra tus competencias de forma fácil y rápida
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">   
          <Link to="/login">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </header>

      {/* Featured Tournaments Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Torneos Destacados</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredTournaments.map((tournament) => (
            <Card key={tournament.id} className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-6 h-6 text-blue-600" />
                  <Badge className={tournament.statusColor}>
                    {tournament.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-gray-900 leading-tight">
                  {tournament.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{tournament.startDate}</span>
                </div>
                
                <Link to={`/torneo/${tournament.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Ver Detalles
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Tournaments Button */}
        <div className="text-center">
          <Link to="/lista-torneos">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              Ver todos los torneos
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white/80 backdrop-blur-sm py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Torneos Activos</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600 font-medium">Equipos Registrados</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,500+</div>
              <div className="text-gray-600 font-medium">Partidos Programados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">TorneoManager</span>
              </div>
              <p className="text-gray-400">
                La plataforma más completa para gestionar torneos de fútbol de manera profesional y eficiente.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <div className="space-y-2">
                <Link to="/contacto" className="block text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
                <Link to="/politicas" className="block text-gray-400 hover:text-white transition-colors">
                  Políticas
                </Link>
                <Link to="/ayuda" className="block text-gray-400 hover:text-white transition-colors">
                  Ayuda
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <p className="text-gray-400 mb-2">¿Necesitas ayuda?</p>
              <p className="text-blue-400">soportegolmanager@integradoruno.com</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Integrador Uno - Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
