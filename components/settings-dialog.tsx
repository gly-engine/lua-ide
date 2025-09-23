"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { SettingsManager, EDITOR_THEMES, type IDESettings } from "@/lib/settings"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { Settings, RotateCcw, Trash2, Package, ExternalLink } from "lucide-react"
import { EnhancedFileManager } from "@/lib/enhanced-file-manager"
import { useConfirmation } from "./confirmation-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange?: (settings: IDESettings) => void
}

export function SettingsDialog({ isOpen, onClose, onSettingsChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<IDESettings>(SettingsManager.getSettings())
  const [showLibraries, setShowLibraries] = useState(false)
  const { t } = useTranslation(settings.language)
  const { toast } = useToast()
  const { showConfirmation } = useConfirmation()
  const isMobile = useMobile()
  const { isInstallable, promptInstall } = usePwaInstall()

  const showFontSizeWarning = isMobile && settings.fontSize < 16 && !settings.keyboard.enabled;

  useEffect(() => {
    if (isOpen) {
      setSettings(SettingsManager.getSettings())
    }
  }, [isOpen])

  const updateSetting = <K extends keyof IDESettings>(key: K, value: IDESettings[K]) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
  }

  const handleClose = () => {
    SettingsManager.saveSettings(settings)
    onSettingsChange?.(settings)

    // Apply theme changes immediately
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      // System theme
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", isDark)
    }

    toast({
      title: t("settingsAppliedTitle"),
      description: t("settingsAppliedDescription"),
    })

    onClose()
  }

  const resetSettings = () => {
    const defaultSettings = SettingsManager.resetSettings()
    setSettings(defaultSettings)
    toast({
      title: t("settingsReset"),
      description: t("settingsResetDescription"),
    })
  }

  const clearLocalStorage = () => {
    showConfirmation({
      title: t("clearBrowserDataTitle"),
      message:
        t("clearBrowserDataMessage"),
      confirmText: t("clearAll"),
      cancelText: t("cancel"),
      type: "danger",
      onConfirm: () => {
        EnhancedFileManager.clearAllData()
        toast({
          title: t("dataClearedTitle"),
          description: t("dataClearedDescription"),
        })
      },
    })
  }

  const availableLibraries = EnhancedFileManager.getAvailableLibraries()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full rounded-none border-0 p-4 overflow-y-auto md:w-auto md:h-auto md:max-w-2xl md:max-h-[80vh] md:rounded-lg md:border md:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t("settingsTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t("appearance")}</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Label htmlFor="theme">{t("windowTheme")}</Label>
                <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value as any)}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("light")}</SelectItem>
                    <SelectItem value="dark">{t("dark")}</SelectItem>
                    <SelectItem value="system">{t("system")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Label htmlFor="editorTheme">{t("editorTheme")}</Label>
                <Select value={settings.editorTheme} onValueChange={(value) => updateSetting("editorTheme", value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITOR_THEMES.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Label htmlFor="language">{t("language")}</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting("language", value as any)}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">{t("portuguese")}</SelectItem>
                    <SelectItem value="en">{t("english")}</SelectItem>
                    <SelectItem value="es">{t("spanish")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Editor Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t("editor")}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>{t("fontSize")}</Label>
                  <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting("fontSize", value)}
                  min={6}
                  max={24}
                  step={1}
                  className="w-full"
                />
                {showFontSizeWarning && (
                  <p className="text-xs text-amber-500 mt-2">
                    {t("fontSizeWarning")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="wordWrap">{t("wordWrap")}</Label>
                <Switch
                  id="wordWrap"
                  checked={settings.wordWrap}
                  onCheckedChange={(checked) => updateSetting("wordWrap", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="minimap">{t("minimap")}</Label>
                <Switch
                  id="minimap"
                  checked={settings.minimap}
                  onCheckedChange={(checked) => updateSetting("minimap", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lineNumbers">{t("lineNumbers")}</Label>
                <Switch
                  id="lineNumbers"
                  checked={settings.lineNumbers === "on"}
                  onCheckedChange={(checked) => updateSetting("lineNumbers", checked ? "on" : "off")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoSave">{t("autoSave")}</Label>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Virtual Keyboard Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t("virtualKeyboard")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="virtualKeyboard-enabled">{t("enableVirtualKeyboard")}</Label>
                <Switch
                  id="virtualKeyboard-enabled"
                  checked={settings.keyboard.enabled}
                  onCheckedChange={(checked) => updateSetting("keyboard", { ...settings.keyboard, enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hapticFeedback-enabled">{t("hapticFeedback")}</Label>
                <Switch
                  id="hapticFeedback-enabled"
                  checked={settings.keyboard.hapticFeedback}
                  onCheckedChange={(checked) => updateSetting("keyboard", { ...settings.keyboard, hapticFeedback: checked })}
                />
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Label htmlFor="keyboard-layout">{t("keyboardLayout")}</Label>
                <Select value={settings.keyboard.layout} onValueChange={(value) => updateSetting("keyboard", { ...settings.keyboard, layout: value as any })}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ansi">ANSI</SelectItem>
                    <SelectItem value="abnt2">ABNT2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("virtualKeyboardNotice")}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-sm font-medium">{t("availableLibraries")}</h3>
              <Button variant="outline" size="sm" onClick={() => setShowLibraries(!showLibraries)}>
                <Package className="w-4 h-4 mr-2" />
                {showLibraries ? t("hideLibraries") : t("showLibraries")}
              </Button>
            </div>

            {showLibraries && (
              <ScrollArea className="h-48 border rounded-md p-2 md:p-4">
                <div className="space-y-3">
                  {availableLibraries.map((lib) => (
                    <div
                      key={lib.name}
                      className="flex flex-col gap-2 p-2 border rounded md:flex-row md:items-start md:justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            require('{lib.name}')
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lib.description}</p>
                      </div>
                      <div className="flex gap-1 self-start">
                        {lib.github && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(lib.github, "_blank")}>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        {lib.docs && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(lib.docs, "_blank")}>
                            📖
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* PWA Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t("pwa")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t("pwaDescription")}
            </p>
            {isInstallable && (
              <Button onClick={promptInstall} className="w-full">
                {t("installPwa")}
              </Button>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">{t("dataManagement")}</h3>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <Label>{t("clearBrowserDataLabel")}</Label>
                <p className="text-xs text-muted-foreground">{t("clearBrowserDataDescription")}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={clearLocalStorage} className="self-start">
                <Trash2 className="w-4 h-4 mr-2" />
                {t("clearAll")}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-center">
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("resetSettings")}
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button onClick={handleClose}>{t("applyAndClose")}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
