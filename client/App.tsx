import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardOrganizador from "./pages/DashboardOrganizador";
import ListaTorneosPublic from "./pages/ListaTorneosPublic";
import DetallesTorneoPublic from "./pages/DetallesTorneoPublic";
import TeamManagement from "./pages/TeamManagement";
import CalendarioPartidos from "./pages/CalendarioPartidos";
import GestionCompetencias from "./pages/GestionCompetencias";
import GestionDetallesTorneo from "./pages/GestionDetallesTorneo";
import ReglasTorneo from "./pages/ReglasTorneo";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized"; 


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/torneo/:id" element={<DetallesTorneoPublic/>} />
          <Route path="/lista-torneos" element={<ListaTorneosPublic/>} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Solo organizadores (USER) */}
          <Route
            path="/dashboard-organizador"
            element={
              <ProtectedRoute role="USER">
                <DashboardOrganizador />
              </ProtectedRoute>
            }
          />

          <Route
            /*path="/lista-torneos"
            element={
              <ProtectedRoute role="USER">
                <ListaTorneos />
              </ProtectedRoute>
            }*/
          />

          <Route
            /*path="//torneo/:id"   //Verificar id del Backend
            element={
              <ProtectedRoute role="USER">
                <DetallesTorneo />
              </ProtectedRoute>
            }*/ 
          /> 

          <Route
            path="/gestion-competencias/tournament/:idTournament/teams-manage"
            //path="/tournament/:idTournament/teams-manage"
            element={
              <ProtectedRoute role="USER">
                <TeamManagement />
              </ProtectedRoute>
            }
          />


          <Route
            path="/calendario"
            element={
              <ProtectedRoute role="USER">
                <CalendarioPartidos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-competencias"
            element={
              <ProtectedRoute role="USER">
                <GestionCompetencias />
              </ProtectedRoute>
            }
          />

          <Route
            path="/detalles-torneo/:id"
            element={
              <ProtectedRoute role="USER">
                <GestionDetallesTorneo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tournament/:id/reglas-competencias"
            element={
              <ProtectedRoute role="USER">
                <ReglasTorneo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tournament/:idTournament/teams"
            element={
              <ProtectedRoute role="USER">
                <Teams />
              </ProtectedRoute>
            }
          />


          <Route
            path="/tournament/:idTournament/team/:teamId"
            element={
             <ProtectedRoute role="USER">
              <TeamDetails />
            </ProtectedRoute>
           }
          />

          {/* Solo Admin (ADMIN) */}
          {/* <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

