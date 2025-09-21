"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ExternalI18nManager, type TranslationFile } from "@/lib/external-i18n"
import { Upload, Download, Languages, Trash2, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TranslationManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLanguageChange?: (languageId: string) => void
  currentLanguage?: string
}

export function TranslationManager({
  open,
  onOpenChange,
  onLanguageChange,
  currentLanguage = "pt",
}: TranslationManagerProps) {
  const [translationFiles, setTranslationFiles] = useState<TranslationFile[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)

  useEffect(() => {
    if (open) {
      setTranslationFiles(ExternalI18nManager.getTranslationFiles())
    }
  }, [open])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const result = await ExternalI18nManager.loadTranslationFile(file)

    if (result.success && result.translations) {
      const languageName = file.name.replace(/\.(po|csv|json)$/, "")
      const newFile: TranslationFile = {
        id: Date.now().toString(),
        name: languageName,
        language: languageName.toLowerCase(),
        translations: result.translations,
        createdAt: new Date(),
      }

      ExternalI18nManager.saveTranslationFile(newFile)
      setTranslationFiles(ExternalI18nManager.getTranslationFiles())
    } else {
      alert(result.error || "Erro ao carregar arquivo")
    }

    // Reset input
    event.target.value = ""
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm("Tem certeza que deseja excluir este arquivo de tradução?")) {
      ExternalI18nManager.deleteTranslationFile(fileId)
      setTranslationFiles(ExternalI18nManager.getTranslationFiles())
    }
  }

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId)
    ExternalI18nManager.setCurrentLanguage(languageId)
    onLanguageChange?.(languageId)
  }

  const handleExportTemplate = () => {
    // Create a template based on Portuguese translations
    const baseTranslations = {
      run: "Rodar",
      share: "Compartilhar",
      newCode: "Novo Código",
      save: "Salvar",
      load: "Carregar",
      settings: "Configurações",
      // Add more base translations as needed
    }

    const template = ExternalI18nManager.createTemplate(baseTranslations)
    const csvContent = ExternalI18nManager.exportToCSV(template)

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "translation-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const availableLanguages = [
    { id: "pt", name: "Português (Padrão)", isDefault: true },
    { id: "en", name: "English (Padrão)", isDefault: true },
    ...translationFiles.map((file) => ({
      id: file.language,
      name: file.name,
      isDefault: false,
    })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Gerenciador de Idiomas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium mb-1">Idioma Atual</h3>
              <p className="text-sm text-muted-foreground">
                {availableLanguages.find((l) => l.id === selectedLanguage)?.name || selectedLanguage}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
              <Label htmlFor="translation-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar Arquivo
                  </span>
                </Button>
              </Label>
              <Input
                id="translation-upload"
                type="file"
                accept=".po,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Idiomas Disponíveis</h3>
              <ScrollArea className="h-64 border rounded-md">
                <div className="p-2 space-y-1">
                  {availableLanguages.map((lang) => (
                    <div
                      key={lang.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedLanguage === lang.id ? "bg-muted border-primary" : ""
                      }`}
                      onClick={() => handleLanguageSelect(lang.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lang.name}</span>
                            {lang.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Padrão
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">ID: {lang.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h3 className="font-medium mb-3">Arquivos Carregados</h3>
              <ScrollArea className="h-64 border rounded-md">
                <div className="p-2 space-y-1">
                  {translationFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum arquivo carregado</p>
                      <p className="text-xs">Carregue arquivos .po, .csv ou .json</p>
                    </div>
                  ) : (
                    translationFiles.map((file) => (
                      <div key={file.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.language}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {Object.keys(file.translations).length} traduções
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(file.createdAt, { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p>
                <strong>Formatos suportados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>.po</strong> - Arquivos GNU gettext (msgid/msgstr)
                </li>
                <li>
                  <strong>.csv</strong> - Formato CSV com colunas "key,translation"
                </li>
                <li>
                  <strong>.json</strong> - Objeto JSON com pares chave-valor
                </li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Aplicar Mudanças</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
