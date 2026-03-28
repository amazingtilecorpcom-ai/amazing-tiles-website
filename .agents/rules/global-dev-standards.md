---
trigger: always_on
---

# Padrões Globais de Desenvolvimento
​
- **Interatividade:** Todo elemento clicável deve ter transition-all e um feedback visual de active:scale-95.
​
- **Código:** Prefira funções puras e utilize nomes de variáveis que descrevam claramente o propósito (ex.: userPreferences em vez de prefs).
​
- **Acessibilidade:** Garanta que todos os inputs tenham <label> associado e que as cores tenham contraste alto conforme padrão WCAG.

- **Breakpoints:** Use sempre os breakpoints conforme abaixo:

Widescreen: min-width: 2400px.

Desktop: de 1367px até antes de 2400px.

Laptop: até 1366px.

Tablet: até 1024px.

Mobile Portrait: até 767px.

- **Largura do conteúdo por breakpoint:**
Layout: Todo conteúdo principal deve estar dentro de um container centralizado (margin: 0 auto).

Desktop e Widescreen: o container deve ter largura máxima de 1216px (max-width: 1216px), centralizado na página.

Laptop, Tablet e Mobile: o container deve ocupar 90% da largura da página (width: 90%), também centralizado.

