"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { FileText, Save, FolderOpen, Undo2, Redo2, Settings, CodeXml } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useTranslation } from "@/lib/i18n"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onNewCode: () => void
  onSave: () => void
  onLoad: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSettings: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function MobileMenu({
  isOpen,
  onClose,
  onNewCode,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  onSettings,
  canUndo = false,
  canRedo = false,
}: MobileMenuProps) {
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-80 p-0 flex flex-col m-0 max-w-none border-0 rounded-none">
        <SheetHeader className="px-3 py-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-left">
            <CodeXml className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold">Lua IDE</div>
              <div className="text-sm text-muted-foreground font-normal">Menu de Ferramentas</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-3">
            {/* File Operations */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Arquivo</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="justify-start w-full h-10" onClick={() => handleAction(onNewCode)}>
                  <FileText className="w-4 h-4 mr-3" />
                  {t("newCode")}
                </Button>
                <Button variant="ghost" className="justify-start w-full h-10" onClick={() => handleAction(onSave)}>
                  <Save className="w-4 h-4 mr-3" />
                  {t("save")}
                </Button>
                <Button variant="ghost" className="justify-start w-full h-10" onClick={() => handleAction(onLoad)}>
                  <FolderOpen className="w-4 h-4 mr-3" />
                  {t("load")}
                </Button>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Edit Operations */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Editar</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="justify-start w-full h-10"
                  onClick={() => handleAction(onUndo || (() => {}))}
                  disabled={!canUndo}
                >
                  <Undo2 className="w-4 h-4 mr-3" />
                  <span className="flex-1 text-left">{t("undo")}</span>
                  {canUndo && <span className="text-xs text-muted-foreground">Ctrl+Z</span>}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start w-full h-10"
                  onClick={() => handleAction(onRedo || (() => {}))}
                  disabled={!canRedo}
                >
                  <Redo2 className="w-4 h-4 mr-3" />
                  <span className="flex-1 text-left">{t("redo")}</span>
                  {canRedo && <span className="text-xs text-muted-foreground">Ctrl+Y</span>}
                </Button>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Settings */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Configurações</h3>
              <Button variant="ghost" className="justify-start w-full h-10" onClick={() => handleAction(onSettings)}>
                <Settings className="w-4 h-4 mr-3" />
                {t("settings")}
              </Button>
            </div>

            <div className="border-t border-border" />

            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">💡 Dicas para Mobile</h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Use dois dedos para zoom no editor</li>
                <li>• Toque e segure para seleção</li>
                <li>• Console em tela cheia</li>
                <li>• Gire para mais espaço</li>
              </ul>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
