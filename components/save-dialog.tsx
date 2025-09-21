"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileManager } from "@/lib/file-manager"
import { useToast } from "@/hooks/use-toast"
import { Save, Download, HardDrive } from "lucide-react"

interface SaveDialogProps {
  isOpen: boolean
  onClose: () => void
  code: string
}

export function SaveDialog({ isOpen, onClose, code }: SaveDialogProps) {
  const [saveLocation, setSaveLocation] = useState<"localStorage" | "device">("localStorage")
  const [filename, setFilename] = useState("codigo.lua")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await FileManager.save(code, {
        location: saveLocation,
        filename: saveLocation === "device" ? filename : undefined,
      })

      if (result.success) {
        toast({
          title: "Código salvo com sucesso!",
          description: saveLocation === "localStorage" ? "Código salvo no navegador" : `Arquivo ${filename} baixado`,
        })
        onClose()
      } else {
        toast({
          title: "Erro ao salvar",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro inesperado ao salvar o código",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Salvar Código
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Onde salvar?</Label>
            <RadioGroup value={saveLocation} onValueChange={(value) => setSaveLocation(value as any)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="localStorage" id="localStorage" />
                <Label htmlFor="localStorage" className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Navegador (localStorage)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="device" id="device" />
                <Label htmlFor="device" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar arquivo
                </Label>
              </div>
            </RadioGroup>
          </div>

          {saveLocation === "device" && (
            <div>
              <Label htmlFor="filename">Nome do arquivo</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="codigo.lua"
                className="mt-1"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
