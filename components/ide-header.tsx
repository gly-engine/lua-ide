"use client"

import { Button } from "@/components/ui/button"
import { Play, Share2, FileText, Save, FolderOpen, Undo2, Redo2, Settings, Menu } from "lucide-react"
import { useState } from "react"
import { MobileMenu } from "./mobile-menu"
import { EnhancedSaveDialog } from "./enhanced-save-dialog"
import { EnhancedLoadDialog } from "./enhanced-load-dialog"
import { ShareDialog } from "./share-dialog"
import { SettingsDialog } from "./settings-dialog"
import { useToast } from "@/hooks/use-toast"
import { useNewFileConfirmation } from "./confirmation-modal"
import { EnhancedFileManager } from "@/lib/enhanced-file-manager"
import { IDESettings } from "@/lib/settings"

interface IDEHeaderProps {
  code: string
  onCodeChange: (code: string) => void
  onRunCode: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onSettingsChange: (settings: IDESettings) => void
}

export function IDEHeader({
  code,
  onCodeChange,
  onRunCode,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSettingsChange,
}: IDEHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const { toast } = useToast()
  const { confirmNewFile } = useNewFileConfirmation()

  const handleNewCode = () => {
    const hasUnsavedChanges = EnhancedFileManager.hasUnsavedChanges(code)

    confirmNewFile(hasUnsavedChanges, () => {
      onCodeChange(getDefaultCode())
      EnhancedFileManager.markAsSaved()
      toast({
        title: "Novo código criado",
        description: "Editor limpo para novo arquivo",
      })
    })
  }

  const getDefaultCode = () => `-- Novo arquivo Lua
print("Olá, mundo!")

-- Escreva seu código aqui...`

  const handleSave = (location: "localStorage" | "device", filename?: string) => {
    if (location === "localStorage" && !filename?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "É necessário fornecer um nome para salvar no navegador",
        variant: "destructive",
      })
      return
    }

    if (location === "localStorage") {
      EnhancedFileManager.saveToLocalStorage(code, filename!)
      toast({
        title: "Arquivo salvo",
        description: `"${filename}" foi salvo no navegador`,
      })
    } else {
      EnhancedFileManager.downloadFile(code, filename || "codigo.lua")
      toast({
        title: "Download iniciado",
        description: "Arquivo baixado para seu dispositivo",
      })
    }
  }

  const handleLoad = (source: string, filename?: string) => {
    if (source === "localStorage" && filename) {
      const loadedCode = EnhancedFileManager.loadFromLocalStorage(filename)
      if (loadedCode) {
        onCodeChange(loadedCode)
        toast({
          title: "Arquivo carregado",
          description: `"${filename}" foi carregado com sucesso`,
        })
      }
    }
  }

  return (
    <>
      <header className="border-b border-border bg-card px-2 sm:px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile: Space for logo */}
            <div className="w-8 h-8 sm:hidden flex items-center justify-center">
              {/* Space reserved for Lua logo */}
              <div className="w-6 h-6 bg-primary/10 rounded border border-primary/20"></div>
            </div>
            {/* Desktop: Text logo */}
            <div className="hidden sm:block text-xl font-bold text-primary">Gly Engine</div>
            <div className="text-sm text-muted-foreground hidden md:block">Lua IDE</div>
          </div>

          {/* Desktop Toolbar */}
          <div className="hidden md:flex items-center gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={onRunCode}>
              <Play className="w-4 h-4 mr-2" />
              Rodar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button size="sm" variant="ghost" onClick={handleNewCode}>
              <FileText className="w-4 h-4 mr-2" />
              Novo Código
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsSaveDialogOpen(true)}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsLoadDialogOpen(true)}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Carregar
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onRedo} disabled={!canRedo}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsSettingsDialogOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <Button size="sm" className="bg-primary hover:bg-primary/90 px-2" onClick={onRunCode}>
              <Play className="w-4 h-4 mr-1" />
              Rodar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="px-2 bg-transparent"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="px-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNewCode={handleNewCode}
          onSave={() => setIsSaveDialogOpen(true)}
          onLoad={() => setIsLoadDialogOpen(true)}
          onUndo={onUndo}
          onRedo={onRedo}
          onSettings={() => setIsSettingsDialogOpen(true)}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </header>

      {/* Dialogs */}
      <EnhancedSaveDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSave}
        defaultFilename=""
      />
      <EnhancedLoadDialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen} onLoad={handleLoad} />
      <ShareDialog isOpen={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} code={code} />
      <SettingsDialog isOpen={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} onSettingsChange={onSettingsChange} />
    </>
  )
}