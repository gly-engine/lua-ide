"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileManager } from "@/lib/file-manager"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Check } from "lucide-react"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  code: string
}

export function ShareDialog({ isOpen, onClose, code }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  // Generate URL when dialog opens
  useEffect(() => {
    if (isOpen && code) {
      try {
        const url = FileManager.createShareableUrl(code)
        setShareUrl(url)
      } catch (error) {
        toast({
          title: "Erro ao gerar URL",
          description: "Não foi possível criar a URL compartilhável",
          variant: "destructive",
        })
      }
    }
  }, [isOpen, code, toast])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast({
        title: "URL copiada!",
        description: "A URL foi copiada para a área de transferência",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full rounded-none border-0 p-4 md:w-auto md:h-auto md:max-w-md md:rounded-lg md:border md:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Código
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>URL compartilhável</Label>
            <div className="flex flex-col gap-2 mt-1 md:flex-row">
              <Input value={shareUrl} readOnly placeholder="Gerando URL..." className="flex-1" />
              <Button size="sm" variant="outline" onClick={copyToClipboard} disabled={!shareUrl}>
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Esta URL contém seu código codificado em base64. Qualquer pessoa com este link poderá visualizar e
              executar seu código.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={copyToClipboard} disabled={!shareUrl}>
              Copiar URL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
