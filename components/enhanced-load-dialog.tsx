"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { EnhancedFileManager, type SavedFile } from "@/lib/enhanced-file-manager"
import { Upload, Link, HardDrive, File, Trash2, Code, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR, enUS, es } from "date-fns/locale"
import { useTranslation } from "@/lib/i18n"
import { useTheme } from "./theme-provider"

interface EnhancedLoadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoad: (source: "localStorage" | "file" | "url", data?: any) => void
}

export function EnhancedLoadDialog({ open, onOpenChange, onLoad }: EnhancedLoadDialogProps) {
  const [source, setSource] = useState<"localStorage" | "file" | "url">("localStorage")
  const [url, setUrl] = useState("")
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<SavedFile | null>(null)
  const { settings } = useTheme()
  const { t, language } = useTranslation(settings.language)

  const locales: { [key: string]: Locale } = { pt: ptBR, en: enUS, es };

  useEffect(() => {
    if (open) {
      setSavedFiles(EnhancedFileManager.getSavedFiles())
    }
  }, [open])

  const handleLoad = () => {
    if (source === "url") {
      onLoad("url", { url })
    } else if (source === "localStorage" && selectedFile) {
      onLoad("localStorage", selectedFile.name)
    } else if (source === "file") {
      // File input will handle this
      return
    }
    onOpenChange(false)
    setUrl("")
    setSelectedFile(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const code = e.target?.result as string
        onLoad("file", { code, filename: file.name })
        onOpenChange(false)
      }
      reader.readAsText(file)
    }
  }

  const handleDeleteFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm(t("confirmNewCode"))) {
      EnhancedFileManager.deleteSavedFile(fileId)
      setSavedFiles(EnhancedFileManager.getSavedFiles())
      if (selectedFile?.id === fileId) {
        setSelectedFile(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("loadCode")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={source}
            onValueChange={(value) => setSource(value as any)}
            className="grid grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="localStorage" id="localStorage" />
              <Label htmlFor="localStorage" className="flex items-center gap-2 cursor-pointer">
                <HardDrive className="h-4 w-4" />
                {t("browser")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="file" id="file" />
              <Label htmlFor="file" className="flex items-center gap-2 cursor-pointer">
                <File className="h-4 w-4" />
                {t("localFile")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="url" id="url" />
              <Label htmlFor="url" className="flex items-center gap-2 cursor-pointer">
                <Link className="h-4 w-4" />
                {t("urlFile")}
              </Label>
            </div>
          </RadioGroup>

          {source === "localStorage" && (
            <div className="space-y-2">
              <Label>{t("selectFile")}</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ScrollArea className="h-64 border rounded-md">
                  <div className="p-2 space-y-1">
                    {savedFiles.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t("errorLoading")}</p>
                    ) : (
                      savedFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedFile?.id === file.id ? "bg-muted border-primary" : ""
                          }`}
                          onClick={() => setSelectedFile(file)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{file.name}</span>
                                {file.isAutoSave && (
                                  <Badge variant="secondary" className="text-xs">
                                    Auto
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(file.updatedAt, { addSuffix: true, locale: locales[language] })}
                              </p>
                            </div>
                            {!file.isAutoSave && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteFile(file.id, e)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {selectedFile && (
                  <div className="border rounded-md p-4 space-y-3">
                    <h4 className="font-medium">Detalhes do arquivo</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>Versão Lua: {selectedFile.luaVersion || "5.4"}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4" />
                          <span>Bibliotecas utilizadas:</span>
                        </div>
                        {selectedFile.libraries && selectedFile.libraries.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedFile.libraries.map((lib) => (
                              <Badge key={lib} variant="outline" className="text-xs">
                                {lib}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs">Nenhuma biblioteca detectada</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Criado: {selectedFile.createdAt.toLocaleDateString(language)}</p>
                        <p>Modificado: {selectedFile.updatedAt.toLocaleDateString(language)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {source === "file" && (
            <div>
              <Label htmlFor="file-upload">{t("selectFile")}</Label>
              <Input id="file-upload" type="file" accept=".lua,.txt" onChange={handleFileUpload} className="mt-1" />
            </div>
          )}

          {source === "url" && (
            <div>
              <Label htmlFor="url-input">{t("urlFile")}</Label>
              <Input
                id="url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com/arquivo.lua"
                className="mt-1"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleLoad}
              disabled={(source === "url" && !url) || (source === "localStorage" && !selectedFile)}
            >
              {t("load")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}