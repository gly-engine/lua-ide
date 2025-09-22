"use client"

import { useModal } from "./modal-system"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Save } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useTheme } from "./theme-provider"

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "warning" | "danger" | "info"
  onConfirm: () => void
  onCancel?: () => void
}

export function useConfirmation() {
  const { showModal, hideModal } = useModal()
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  const showConfirmation = (options: ConfirmationOptions) => {
    const modalId = `confirmation-${Date.now()}`

    const handleConfirm = () => {
      options.onConfirm()
      hideModal(modalId)
    }

    const handleCancel = () => {
      options.onCancel?.()
      hideModal(modalId)
    }

    showModal({
      id: modalId,
      title: options.title,
      size: "sm",
      showCloseButton: false,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-full ${
                options.type === "danger"
                  ? "bg-red-100 text-red-600"
                  : options.type === "warning"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{options.message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText || t("cancel")}
            </Button>
            <Button variant={options.type === "danger" ? "destructive" : "default"} onClick={handleConfirm}>
              {options.confirmText || t("confirm")}
            </Button>
          </div>
        </div>
      ),
    })
  }

  return { showConfirmation }
}

export function useNewFileConfirmation() {
  const { showConfirmation } = useConfirmation()
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  const confirmNewFile = (hasUnsavedChanges: boolean, onConfirm: () => void) => {
    if (!hasUnsavedChanges) {
      onConfirm()
      return
    }

    showConfirmation({
      title: t("newCode"),
      message: t("confirmNewCode"),
      confirmText: t("newCode"),
      cancelText: t("cancel"),
      type: "warning",
      onConfirm,
    })
  }

  return { confirmNewFile }
}

export function useLoadFileConfirmation() {
  const { showConfirmation } = useConfirmation()
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  const confirmLoadFile = (hasUnsavedChanges: boolean, onConfirm: () => void) => {
    if (!hasUnsavedChanges) {
      onConfirm()
      return
    }

    showConfirmation({
      title: t("loadCode"),
      message: t("confirmNewCode"),
      confirmText: t("load"),
      cancelText: t("cancel"),
      type: "warning",
      onConfirm,
    })
  }

  return { confirmLoadFile }
}

export function useDeleteConfirmation() {
  const { showConfirmation } = useConfirmation()
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  const confirmDelete = (itemName: string, onConfirm: () => void) => {
    showConfirmation({
      title: t("delete"),
      message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: t("delete"),
      cancelText: t("cancel"),
      type: "danger",
      onConfirm,
    })
  }

  return { confirmDelete }
}

export function useSaveBeforeActionConfirmation() {
  const { showModal, hideModal } = useModal()
  const { settings } = useTheme()
  const { t } = useTranslation(settings.language)

  const confirmSaveBeforeAction = (
    actionName: string,
    onSave: () => void,
    onContinueWithoutSaving: () => void,
    onCancel?: () => void,
  ) => {
    const modalId = `save-before-action-${Date.now()}`

    const handleSave = () => {
      onSave()
      hideModal(modalId)
    }

    const handleContinue = () => {
      onContinueWithoutSaving()
      hideModal(modalId)
    }

    const handleCancel = () => {
      onCancel?.()
      hideModal(modalId)
    }

    showModal({
      id: modalId,
      title: t("save"),
      size: "sm",
      showCloseButton: false,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Save className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {t("confirmNewCode")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 md:flex-row md:justify-end">
            <Button variant="outline" onClick={handleCancel} className="order-3 md:order-1 bg-transparent">
              {t("cancel")}
            </Button>
            <Button variant="outline" onClick={handleContinue} className="order-2 bg-transparent">
              {t("continueWithoutSaving")}
            </Button>
            <Button onClick={handleSave} className="order-1 md:order-3">
              {t("save")}
            </Button>
          </div>
        </div>
      ),
    })
  }

  return { confirmSaveBeforeAction }
}