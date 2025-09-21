"use client"

export const translations = {
  pt: {
    // Header
    run: "Rodar",
    share: "Compartilhar",
    newCode: "Novo Código",
    save: "Salvar",
    load: "Carregar",
    undo: "Desfazer",
    redo: "Refazer",
    settings: "Configurações",
    menu: "Menu",

    // Console
    consoleTitle: "Console de Saída",
    clear: "Limpar",
    execute: "Executar",
    waitingInput: "Aguardando entrada",
    enterInput: "Digite sua entrada e pressione Enter...",
    inputDisabled: "Entrada desabilitada",
    useIoRead: "Use io.read() no código para ativar entrada durante execução",

    // Settings
    settingsTitle: "Configurações",
    appearance: "Aparência",
    windowTheme: "Tema da janela",
    editorTheme: "Tema do editor",
    language: "Idioma",
    editor: "Editor",
    fontSize: "Tamanho da fonte",
    tabSize: "Tamanho da tabulação",
    wordWrap: "Quebra de linha",
    minimap: "Minimapa",
    autoSave: "Salvamento automático",
    resetSettings: "Restaurar padrões",
    close: "Fechar",

    // Themes
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",

    // Languages
    portuguese: "Português",
    english: "English",

    // File operations
    saveCode: "Salvar Código",
    loadCode: "Carregar Código",
    shareCode: "Compartilhar Código",
    whereSave: "Onde salvar?",
    browser: "Navegador (localStorage)",
    downloadFile: "Baixar arquivo",
    filename: "Nome do arquivo",
    cancel: "Cancelar",
    saving: "Salvando...",
    loading: "Carregando...",
    whereLoad: "De onde carregar?",
    localFile: "Arquivo local",
    selectFile: "Selecionar arquivo",
    urlFile: "URL do arquivo",
    shareableUrl: "URL compartilhável",
    copyUrl: "Copiar URL",

    // Messages
    codeSaved: "Código salvo com sucesso!",
    codeLoaded: "Código carregado com sucesso!",
    urlCopied: "URL copiada!",
    newCodeCreated: "Novo código criado",
    confirmNewCode: "Tem certeza que deseja criar um novo arquivo? O código atual será perdido.",
    settingsReset: "Configurações restauradas",
    errorSaving: "Erro ao salvar",
    errorLoading: "Erro ao carregar",
    errorCopying: "Erro ao copiar",
  },
  en: {
    // Header
    run: "Run",
    share: "Share",
    newCode: "New Code",
    save: "Save",
    load: "Load",
    undo: "Undo",
    redo: "Redo",
    settings: "Settings",
    menu: "Menu",

    // Console
    consoleTitle: "Output Console",
    clear: "Clear",
    execute: "Execute",
    waitingInput: "Waiting for input",
    enterInput: "Enter your input and press Enter...",
    inputDisabled: "Input disabled",
    useIoRead: "Use io.read() in code to enable input during execution",

    // Settings
    settingsTitle: "Settings",
    appearance: "Appearance",
    windowTheme: "Window theme",
    editorTheme: "Editor theme",
    language: "Language",
    editor: "Editor",
    fontSize: "Font size",
    tabSize: "Tab size",
    wordWrap: "Word wrap",
    minimap: "Minimap",
    autoSave: "Auto save",
    resetSettings: "Reset to defaults",
    close: "Close",

    // Themes
    light: "Light",
    dark: "Dark",
    system: "System",

    // Languages
    portuguese: "Português",
    english: "English",

    // File operations
    saveCode: "Save Code",
    loadCode: "Load Code",
    shareCode: "Share Code",
    whereSave: "Where to save?",
    browser: "Browser (localStorage)",
    downloadFile: "Download file",
    filename: "Filename",
    cancel: "Cancel",
    saving: "Saving...",
    loading: "Loading...",
    whereLoad: "Where to load from?",
    localFile: "Local file",
    selectFile: "Select file",
    urlFile: "File URL",
    shareableUrl: "Shareable URL",
    copyUrl: "Copy URL",

    // Messages
    codeSaved: "Code saved successfully!",
    codeLoaded: "Code loaded successfully!",
    urlCopied: "URL copied!",
    newCodeCreated: "New code created",
    confirmNewCode: "Are you sure you want to create a new file? Current code will be lost.",
    settingsReset: "Settings reset to defaults",
    errorSaving: "Error saving",
    errorLoading: "Error loading",
    errorCopying: "Error copying",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof (typeof translations)["pt"]

export function useTranslation(language: Language) {
  return {
    t: (key: TranslationKey): string => {
      return translations[language][key] || translations.pt[key] || key
    },
    language,
  }
}
