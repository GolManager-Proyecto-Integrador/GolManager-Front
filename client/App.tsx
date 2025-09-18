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
import ListaTorneos from "./pages/ListaTorneos";
import CalendarioPartidos from "./pages/CalendarioPartidos";
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
            path="/lista-torneos"
            element={
              <ProtectedRoute role="USER">
                <ListaTorneos />
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

