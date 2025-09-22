"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileManager } from "@/lib/file-manager"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Check } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useTheme } from "./theme-provider"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  code: string
}

export function ShareDialog({ isOpen, onClose, code }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  // Generate URL when dialog opens
  useEffect(() => {
    if (isOpen && code) {
      try {
        const url = FileManager.createShareableUrl(code)
        setShareUrl(url)
      } catch (error) {
        toast({
          title: t("errorCopying"),
          description: "Não foi possível criar a URL compartilhável",
          variant: "destructive",
        })
      }
    }
  }, [isOpen, code, toast, t])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast({
        title: t("urlCopied"),
        description: "A URL foi copiada para a área de transferência",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        title: t("errorCopying"),
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
            {t("shareCode")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t("shareableUrl")}</Label>
            <div className="flex flex-col gap-2 mt-1 md:flex-row">
              <Input value={shareUrl} readOnly placeholder={t("loading")} className="flex-1" />
              <Button size="sm" variant="outline" onClick={copyToClipboard} disabled={!shareUrl}>
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("shareableUrl")}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <Button variant="outline" onClick={onClose}>
              {t("close")}
            </Button>
            <Button onClick={copyToClipboard} disabled={!shareUrl}>
              {t("copyUrl")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}