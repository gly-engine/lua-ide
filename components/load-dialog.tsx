"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileManager } from "@/lib/file-manager"
import { useToast } from "@/hooks/use-toast"
import { FolderOpen, Upload, Link, HardDrive } from "lucide-react"

interface LoadDialogProps {
  isOpen: boolean
  onClose: () => void
  onCodeLoad: (code: string, filename?: string) => void
}

export function LoadDialog({ isOpen, onClose, onCodeLoad }: LoadDialogProps) {
  const [loadSource, setLoadSource] = useState<"localStorage" | "file" | "url">("localStorage")
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleLoad = async () => {
    setIsLoading(true)
    try {
      let result

      if (loadSource === "localStorage") {
        result = await FileManager.load({ source: "localStorage" })
      } else if (loadSource === "file") {
        const file = fileInputRef.current?.files?.[0]
        if (!file) {
          toast({
            title: "Nenhum arquivo selecionado",
            description: "Por favor, selecione um arquivo para carregar",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        result = await FileManager.load({ source: "file", file })
      } else if (loadSource === "url") {
        if (!url.trim()) {
          toast({
            title: "URL não informada",
            description: "Por favor, informe uma URL válida",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        result = await FileManager.load({ source: "url", url })
      }

      if (result?.success && result.code) {
        onCodeLoad(result.code, result.filename)
        toast({
          title: "Código carregado com sucesso!",
          description: result.filename ? `Arquivo: ${result.filename}` : "Código carregado",
        })
        onClose()
      } else {
        toast({
          title: "Erro ao carregar",
          description: result?.error || "Erro desconhecido",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Erro inesperado ao carregar o código",
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
            <FolderOpen className="w-5 h-5" />
            Carregar Código
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>De onde carregar?</Label>
            <RadioGroup value={loadSource} onValueChange={(value) => setLoadSource(value as any)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="localStorage" id="localStorage-load" />
                <Label htmlFor="localStorage-load" className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Navegador (localStorage)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Arquivo local
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  URL
                </Label>
              </div>
            </RadioGroup>
          </div>

          {loadSource === "file" && (
            <div>
              <Label htmlFor="file-input">Selecionar arquivo</Label>
              <Input id="file-input" type="file" accept=".lua,.txt" ref={fileInputRef} className="mt-1" />
            </div>
          )}

          {loadSource === "url" && (
            <div>
              <Label htmlFor="url-input">URL do arquivo</Label>
              <Input
                id="url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com/codigo.lua"
                className="mt-1"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleLoad} disabled={isLoading}>
              {isLoading ? "Carregando..." : "Carregar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
