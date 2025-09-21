# Gly Engine Lua IDE

Uma IDE completa para desenvolvimento em Lua com Monaco Editor, interpretador integrado e sistema de arquivos local.

## Funcionalidades

- **Editor Monaco**: Syntax highlighting, autocomplete e IntelliSense para Lua
- **Interpretador Lua**: Execute código Lua diretamente no navegador usando Fengari
- **Sistema de Arquivos**: Salve e carregue arquivos localmente no navegador
- **Console Interativo**: Visualize saídas e erros em tempo real
- **Bibliotecas Integradas**: Acesso a bibliotecas Lua populares
- **Temas**: Suporte a tema claro e escuro
- **Responsivo**: Interface otimizada para desktop e mobile

## Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages. Para configurar:

1. **Habilite GitHub Pages no seu repositório**:
   - Vá em Settings > Pages
   - Em "Source", selecione "GitHub Actions"

2. **Configure o nome do repositório**:
   - Se o seu repositório não se chama `gly-engine-lua-ide`, edite o `basePath` e `assetPrefix` no `next.config.mjs`
   - Substitua `gly-engine-lua-ide` pelo nome do seu repositório

3. **Push para a branch main**:
   - O workflow será executado automaticamente
   - O site estará disponível em `https://[seu-usuario].github.io/[nome-do-repo]/`

## Desenvolvimento Local

\`\`\`bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
\`\`\`

## Tecnologias

- **Next.js 14** - Framework React
- **Monaco Editor** - Editor de código
- **Fengari** - Interpretador Lua para JavaScript
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes de interface
- **TypeScript** - Tipagem estática
