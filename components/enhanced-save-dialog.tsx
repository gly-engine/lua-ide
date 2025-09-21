"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Download, HardDrive, AlertCircle } from "lucide-react"

interface EnhancedSaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (location: "localStorage" | "device", filename?: string) => void
  defaultFilename?: string
}

export function EnhancedSaveDialog({ open, onOpenChange, onSave, defaultFilename }: EnhancedSaveDialogProps) {
  const [location, setLocation] = useState<"localStorage" | "device">("localStorage")
  const [filename, setFilename] = useState(defaultFilename || "")

  const handleSave = () => {
    if (location === "localStorage" && !filename.trim()) {
      return // Don't close dialog, show error in parent
    }

    onSave(location, filename.trim() || undefined)
    onOpenChange(false)
    setFilename("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setFilename("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Salvar Arquivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="filename">Nome do arquivo</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={location === "localStorage" ? "Nome obrigatório..." : "Digite o nome do arquivo..."}
              className="mt-1"
              required={location === "localStorage"}
            />
            {location === "localStorage" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Nome é obrigatório para salvar no navegador
              </div>
            )}
          </div>

          <div>
            <Label>Local de salvamento</Label>
            <RadioGroup
              value={location}
              onValueChange={(value) => setLocation(value as "localStorage" | "device")}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="localStorage" id="localStorage" />
                <Label htmlFor="localStorage" className="flex items-center gap-2 cursor-pointer">
                  <HardDrive className="h-4 w-4" />
                  Salvar no navegador (acesso rápido)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="device" id="device" />
                <Label htmlFor="device" className="flex items-center gap-2 cursor-pointer">
                  <Download className="h-4 w-4" />
                  Baixar para o dispositivo
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={location === "localStorage" && !filename.trim()}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
