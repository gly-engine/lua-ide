"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"

interface ModalConfig {
  id: string
  title?: string
  description?: string
  content: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  showCloseButton?: boolean
  onClose?: () => void
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void
  hideModal: (id: string) => void
  hideAllModals: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalConfig[]>([])

  const showModal = (config: ModalConfig) => {
    setModals((prev) => [...prev.filter((m) => m.id !== config.id), config])
  }

  const hideModal = (id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id))
  }

  const hideAllModals = () => {
    setModals([])
  }

  return (
    <ModalContext.Provider value={{ showModal, hideModal, hideAllModals }}>
      {children}
      {modals.map((modal) => (
        <Dialog
          key={modal.id}
          open={true}
          onOpenChange={() => {
            modal.onClose?.()
            hideModal(modal.id)
          }}
        >
          <DialogContent
            className={`
            w-full h-full rounded-none border-0 p-4 md:w-auto md:h-auto md:rounded-lg md:border md:p-6
            ${modal.size === "sm" ? "md:max-w-md" : ""}
            ${modal.size === "md" ? "md:max-w-lg" : ""}
            ${modal.size === "lg" ? "md:max-w-2xl" : ""}
            ${modal.size === "xl" ? "md:max-w-4xl" : ""}
            ${!modal.size ? "md:max-w-lg" : ""}
          `}
          >
            {modal.showCloseButton !== false && (
              <button
                onClick={() => {
                  modal.onClose?.()
                  hideModal(modal.id)
                }}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            )}

            {(modal.title || modal.description) && (
              <DialogHeader>
                {modal.title && <DialogTitle>{modal.title}</DialogTitle>}
                {modal.description && <DialogDescription>{modal.description}</DialogDescription>}
              </DialogHeader>
            )}

            <div className="mt-4">{modal.content}</div>
          </DialogContent>
        </Dialog>
      ))}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}

export function CourseAnnouncementModal({
  title,
  description,
  thumbnail,
  courseUrl,
  onClose,
}: {
  title: string
  description: string
  thumbnail: string
  courseUrl: string
  onClose?: () => void
}) {
  const { showModal } = useModal()

  const showCourseModal = () => {
    showModal({
      id: "course-announcement",
      title: "Novo Curso Disponível!",
      size: "md",
      onClose,
      content: (
        <div className="space-y-4">
          <div
            className="relative cursor-pointer rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            onClick={() => window.open(courseUrl, "_blank")}
          >
            <img src={thumbnail || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <ExternalLink className="h-8 w-8 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Depois
            </Button>
            <Button onClick={() => window.open(courseUrl, "_blank")}>Ver Curso</Button>
          </div>
        </div>
      ),
    })
  }

  return { showCourseModal }
}

export function NoticeModal({
  title,
  message,
  type = "info",
  onClose,
}: {
  title: string
  message: string
  type?: "info" | "warning" | "success" | "error"
  onClose?: () => void
}) {
  const { showModal } = useModal()

  const showNoticeModal = () => {
    showModal({
      id: "notice-modal",
      title,
      size: "sm",
      onClose,
      content: (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              type === "info"
                ? "bg-blue-50 text-blue-900 border border-blue-200"
                : type === "warning"
                  ? "bg-yellow-50 text-yellow-900 border border-yellow-200"
                  : type === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : type === "error"
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-gray-50 text-gray-900 border border-gray-200"
            }`}
          >
            <p>{message}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Entendi</Button>
          </div>
        </div>
      ),
    })
  }

  return { showNoticeModal }
}
