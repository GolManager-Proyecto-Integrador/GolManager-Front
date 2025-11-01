import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { organizerService } from "@/services/organizerService";
import { dashboardService } from "@/services/admdashboardService"; // 👈 Se usa para traer el nombre del admin

interface Organizer {
  id: string;
  name: string;
  email: string;
  numTournaments: number;
}

interface EditingOrganizer extends Organizer {
  password: string;
  newEmail?: string;
}

export default function OrganizerManagement() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] =
    useState<EditingOrganizer | null>(null);
  const [organizerToDelete, setOrganizerToDelete] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [adminName, setAdminName] = useState("Cargando..."); // 👈 nombre dinámico del admin

  // 🔹 Cargar organizadores
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ No se encontró un token válido. Inicia sesión nuevamente.");
        navigate("/login");
        return;
      }
      try {
        // Trae organizadores
        const data = await organizerService.getAll(token);
        setOrganizers(data);

        // Trae nombre del admin
        const dashboardData = await dashboardService.getDashboardData(token);
        setAdminName(dashboardData.userName);
      } catch (error) {
        alert("Error al cargar los datos. Intenta nuevamente.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Editar organizador
  const handleEditClick = (organizer: Organizer) => {
    setEditingOrganizer({
      ...organizer,
      password: "",
      newEmail: organizer.email,
    });
    setIsEditDialogOpen(true);
  };

  // 🔹 Guardar cambios (PUT)
  const handleSaveChanges = async () => {
    if (!editingOrganizer) return;

    const token = localStorage.getItem("token");

    const payload = {
      actualEmail: editingOrganizer.email,
      newEmail: editingOrganizer.newEmail ?? editingOrganizer.email,
      newName: editingOrganizer.name,
      newPassword: editingOrganizer.password,
    };

    try {
      await organizerService.update(payload, token);

      // 🔄 Refrescar lista
      const updatedOrganizers = await organizerService.getAll(token);
      setOrganizers(updatedOrganizers);

      alert("✅ Cambios guardados correctamente.");
      setIsEditDialogOpen(false);
      setEditingOrganizer(null);
      setShowPassword(false);
    } catch (error) {
      alert("❌ Error al actualizar el organizador.");
      console.error("Error al actualizar organizador:", error);
    }
  };

  // 🔹 Eliminar organizador
  const handleDeleteClick = (organizerId: string) => {
    setOrganizerToDelete(organizerId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!organizerToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const org = organizers.find((o) => o.id === organizerToDelete);
      if (!org) return;

      await organizerService.remove(org.email, token);
      setOrganizers((prev) => prev.filter((o) => o.id !== organizerToDelete));
      alert("🗑️ Organizador eliminado correctamente.");
    } catch (error) {
      alert("❌ Error al eliminar el organizador.");
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setOrganizerToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando organizadores...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (restaurado exactamente como pediste) */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Organizadores
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Administra los usuarios encargados de gestionar torneos
                </p>
              </div>
            </div>

            {/* 👇 Aquí reemplazamos el nombre fijo por el dinámico */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Administrador
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {adminName}
                </p>
              </div>
              <Avatar className="h-12 w-12 border border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {adminName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Action Bar */}
        <Card className="mb-8 bg-white rounded-2xl shadow-md border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar organizador por nombre o correo…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-300"
                />
              </div>
              <Button
                onClick={() => navigate("/admin/organizers/register")}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Organizador
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table or Empty State */}
        {filteredOrganizers.length > 0 ? (
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Organizadores Registrados ({filteredOrganizers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Correo electrónico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Torneos creados
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrganizers.map((organizer) => (
                      <tr
                        key={organizer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {organizer.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {organizer.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {organizer.numTournaments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(organizer)}
                            className="border-primary text-primary hover:bg-primary/5 rounded-lg"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(organizer.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl shadow-md border-0">
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">🧩</div>
              <p className="text-lg font-medium text-gray-900">
                No hay organizadores registrados todavía.
              </p>
              <p className="mt-2 text-sm text-gray-500 mb-6">
                Comienza agregando un nuevo organizador al sistema.
              </p>
              <Button
                onClick={() => navigate("/admin/organizers/register")}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primer organizador
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Editar Organizador
            </DialogTitle>
            <DialogDescription>
              Actualiza la información del organizador
            </DialogDescription>
          </DialogHeader>

          {editingOrganizer && (
            <div className="space-y-4 py-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="newName" className="text-sm font-medium text-gray-700">
                  Nombre completo
                </Label>
                <Input
                  id="newName"
                  type="text"
                  placeholder="Ingrese nuevo nombre"
                  value={editingOrganizer.name}
                  onChange={(e) =>
                    setEditingOrganizer({
                      ...editingOrganizer,
                      name: e.target.value,
                    })
                  }
                  className="rounded-xl border-gray-300"
                />
              </div>

              {/* Correo actual */}
              <div className="space-y-2">
                <Label htmlFor="actualEmail" className="text-sm font-medium text-gray-700">
                  Correo actual
                </Label>
                <Input
                  id="actualEmail"
                  type="email"
                  value={editingOrganizer.email}
                  disabled
                  className="rounded-xl border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 italic">
                  *Este correo se usa para verificar la identidad del organizador.
                </p>
              </div>

              {/* Nuevo correo */}
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-sm font-medium text-gray-700">
                  Nuevo correo electrónico
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="Ingrese nuevo correo electrónico"
                  value={editingOrganizer.newEmail ?? editingOrganizer.email}
                  onChange={(e) =>
                    setEditingOrganizer({
                      ...editingOrganizer,
                      newEmail: e.target.value,
                    })
                  }
                  className="rounded-xl border-gray-300"
                />
                <p className="text-xs text-gray-500 italic">
                  *Si no desea cambiarlo, deje el mismo correo actual.
                </p>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese nueva contraseña"
                    value={editingOrganizer.password}
                    onChange={(e) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        password: e.target.value,
                      })
                    }
                    className="rounded-xl border-gray-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Eliminar Organizador
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              ¿Está seguro de que desea eliminar este organizador? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end pt-6">
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
