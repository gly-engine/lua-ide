"use client"

export interface HistoryState {
  code: string
  timestamp: number
  cursor?: { line: number; column: number }
}

export class HistoryManager {
  private history: HistoryState[] = []
  private currentIndex = -1
  private maxHistorySize = 50

  constructor(initialCode = "") {
    if (initialCode) {
      this.addState(initialCode)
    }
  }

  addState(code: string, cursor?: { line: number; column: number }): void {
    // Don't add if the code is the same as the current state
    if (this.history[this.currentIndex]?.code === code) {
      return
    }

    // Remove any states after current index (when adding after undo)
    this.history = this.history.slice(0, this.currentIndex + 1)

    // Add new state
    const newState: HistoryState = {
      code,
      timestamp: Date.now(),
      cursor,
    }

    this.history.push(newState)
    this.currentIndex++

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }
  }

  undo(): HistoryState | null {
    if (this.canUndo()) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  redo(): HistoryState | null {
    if (this.canRedo()) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getCurrentState(): HistoryState | null {
    return this.history[this.currentIndex] || null
  }

  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  getHistorySize(): number {
    return this.history.length
  }
}
