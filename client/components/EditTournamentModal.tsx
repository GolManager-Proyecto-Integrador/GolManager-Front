import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import gcompetenciaService, { Tournament } from "@/services/gcompetenciaService";

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string | null;
  onUpdated: () => void; // callback para refrescar lista
}

export function EditTournamentModal({ isOpen, onClose, tournamentId, onUpdated }: EditTournamentModalProps) {
  const [tournament, setTournament] = useState<Partial<Tournament>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tournamentId && isOpen) {
      const fetchData = async () => {
        try {
          const data = await gcompetenciaService.getTournamentDetails(tournamentId);
          setTournament(data);
        } catch (error) {
          console.error("Error cargando torneo:", error);
        }
      };
      fetchData();
    }
  }, [tournamentId, isOpen]);

  const handleChange = (key: keyof Tournament, value: any) => {
    setTournament((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      await gcompetenciaService.updateTournament(tournamentId, tournament);
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error actualizando torneo:", error);
      alert("❌ No se pudo guardar la actualización.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Torneo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre del torneo</Label>
            <Input
              value={tournament.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Fecha de inicio</Label>
              <Input
                type="date"
                value={tournament.startDate || ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Fecha de fin</Label>
              <Input
                type="date"
                value={tournament.endDate || ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Formato</Label>
            <Select
              value={tournament.format || ""}
              onValueChange={(value) => handleChange("format", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAGUE">Liga</SelectItem>
                <SelectItem value="DIRECT_ELIMINATION">Eliminatoria</SelectItem>
                <SelectItem value="PLAY_OFF">Repechaje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Número de equipos</Label>
            <Input
              type="number"
              value={tournament.numberOfTeams || ""}
              onChange={(e) => handleChange("numberOfTeams", Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-primary text-white">
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
