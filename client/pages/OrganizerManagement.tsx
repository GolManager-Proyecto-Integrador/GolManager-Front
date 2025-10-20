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

interface Organizer {
  id: string;
  name: string;
  email: string;
  tournamentsCreated: number;
}

interface EditingOrganizer extends Organizer {
  password: string;
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

  // 🔹 Obtener lista de organizadores al cargar
  useEffect(() => {
    const fetchOrganizers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ No se encontró un token válido. Inicia sesión nuevamente.");
        navigate("/login");
        return;
      }
      try {
        const data = await organizerService.getAll(token);
        setOrganizers(data);
      } catch (error) {
        alert("Error al cargar los organizadores. Intenta nuevamente.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizers();
  }, [navigate]);

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (organizer: Organizer) => {
    setEditingOrganizer({
      ...organizer,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  // 🔹 Guardar cambios (actualizar organizador)
  const handleSaveChanges = async () => {
    if (!editingOrganizer) return;
    try {
      const token = localStorage.getItem("token");
      await organizerService.update(
        {
          email: editingOrganizer.email,
          name: editingOrganizer.name,
          password: editingOrganizer.password || "",
        },
        token
      );

      setOrganizers((prev) =>
        prev.map((org) =>
          org.id === editingOrganizer.id
            ? {
                ...org,
                name: editingOrganizer.name,
                email: editingOrganizer.email,
              }
            : org
        )
      );

      alert("✅ Cambios guardados correctamente.");
      setIsEditDialogOpen(false);
      setEditingOrganizer(null);
    } catch (error) {
      alert("❌ Error al actualizar el organizador.");
      console.error(error);
    }
  };

  const handleDeleteClick = (organizerId: string) => {
    setOrganizerToDelete(organizerId);
    setIsDeleteDialogOpen(true);
  };

  // 🔹 Confirmar eliminación
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
      {/* Header */}
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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Administrador
                </p>
                <p className="text-base font-semibold text-gray-900">
                  Mateo Vargas
                </p>
              </div>
              <Avatar className="h-12 w-12 border border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  MV
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
                          {organizer.tournamentsCreated}
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
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre completo
                </Label>
                <Input
                  id="name"
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

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingOrganizer.email}
                  onChange={(e) =>
                    setEditingOrganizer({
                      ...editingOrganizer,
                      email: e.target.value,
                    })
                  }
                  className="rounded-xl border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  value={editingOrganizer.password}
                  onChange={(e) =>
                    setEditingOrganizer({
                      ...editingOrganizer,
                      password: e.target.value,
                    })
                  }
                  className="rounded-xl border-gray-300"
                />
              </div>
            </div>
          )}

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

