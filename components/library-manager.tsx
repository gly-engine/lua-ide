"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Package, ExternalLink, Info } from "lucide-react"

interface Library {
  id: string
  name: string
  version: string
  description: string
  category: string
  url?: string
  enabled: boolean
  size?: string
}

const AVAILABLE_LIBRARIES: Library[] = [
  {
    id: "json",
    name: "JSON",
    version: "1.0.0",
    description: "JSON encoding and decoding library",
    category: "Data",
    enabled: false,
    size: "12KB",
  },
  {
    id: "http",
    name: "HTTP Client",
    version: "2.1.0",
    description: "HTTP requests and responses handling",
    category: "Network",
    enabled: false,
    size: "45KB",
  },
  {
    id: "crypto",
    name: "Crypto",
    version: "1.5.0",
    description: "Cryptographic functions and hashing",
    category: "Security",
    enabled: false,
    size: "78KB",
  },
  {
    id: "datetime",
    name: "DateTime",
    version: "3.0.0",
    description: "Date and time manipulation utilities",
    category: "Utilities",
    enabled: false,
    size: "23KB",
  },
  {
    id: "regex",
    name: "Regex",
    version: "1.2.0",
    description: "Regular expression pattern matching",
    category: "Text",
    enabled: false,
    size: "34KB",
  },
  {
    id: "base64",
    name: "Base64",
    version: "1.0.0",
    description: "Base64 encoding and decoding",
    category: "Encoding",
    enabled: false,
    size: "8KB",
  },
  {
    id: "uuid",
    name: "UUID",
    version: "2.0.0",
    description: "UUID generation and validation",
    category: "Utilities",
    enabled: false,
    size: "15KB",
  },
  {
    id: "xml",
    name: "XML Parser",
    version: "1.8.0",
    description: "XML parsing and generation",
    category: "Data",
    enabled: false,
    size: "67KB",
  },
]

const CATEGORIES = ["All", "Data", "Network", "Security", "Utilities", "Text", "Encoding"]

interface LibraryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLibrariesChange?: (libraries: Library[]) => void
}

export function LibraryManager({ open, onOpenChange, onLibrariesChange }: LibraryManagerProps) {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    const savedLibraries = localStorage.getItem("gly-ide-libraries")
    if (savedLibraries) {
      try {
        const parsed = JSON.parse(savedLibraries)
        setLibraries(parsed)
      } catch {
        setLibraries(AVAILABLE_LIBRARIES)
      }
    } else {
      setLibraries(AVAILABLE_LIBRARIES)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("gly-ide-libraries", JSON.stringify(libraries))
    onLibrariesChange?.(libraries)
  }, [libraries, onLibrariesChange])

  const filteredLibraries = libraries.filter((lib) => {
    const matchesSearch =
      lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || lib.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const enabledCount = libraries.filter((lib) => lib.enabled).length
  const totalSize = libraries
    .filter((lib) => lib.enabled)
    .reduce((total, lib) => {
      const size = Number.parseInt(lib.size?.replace("KB", "") || "0")
      return total + size
    }, 0)

  const toggleLibrary = (id: string) => {
    setLibraries((prev) => prev.map((lib) => (lib.id === id ? { ...lib, enabled: !lib.enabled } : lib)))
  }

  const enableAll = () => {
    setLibraries((prev) => prev.map((lib) => ({ ...lib, enabled: true })))
  }

  const disableAll = () => {
    setLibraries((prev) => prev.map((lib) => ({ ...lib, enabled: false })))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciador de Bibliotecas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{enabledCount}</span> de {libraries.length} bibliotecas ativas
              </div>
              <div className="text-sm text-muted-foreground">
                Tamanho total: <span className="font-medium">{totalSize}KB</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={disableAll}>
                Desativar Todas
              </Button>
              <Button variant="outline" size="sm" onClick={enableAll}>
                Ativar Todas
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar bibliotecas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredLibraries.map((library) => (
                <div
                  key={library.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox checked={library.enabled} onCheckedChange={() => toggleLibrary(library.id)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{library.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          v{library.version}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {library.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{library.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {library.size && <span className="text-xs text-muted-foreground">{library.size}</span>}
                    {library.url && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(library.url, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              As bibliotecas selecionadas serão carregadas automaticamente no seu código
            </div>
            <Button onClick={() => onOpenChange(false)}>Aplicar Mudanças</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
