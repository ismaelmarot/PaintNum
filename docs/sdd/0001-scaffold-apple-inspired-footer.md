# SDD 0001 — Scaffold Apple-inspired + Footer del desarrollador

- **Fecha:** 2026-10-23
- **Estado:** Entregada — pendiente de revisión
- **Alcance:** Primera entrega del proyecto PaintNum. Inspectoras: especificación, secciones 13 (identidad visual Apple-inspired) y 14 (footer del desarrollador). No incluye funcionalidad de pintura por números.

## 1. Contexto

Repositorio vacío al iniciar (sin commits ni configuración previa). Decisión de base aprobada por el cliente:

- Stack: **React 19 + TypeScript + Vite 7**, con `styled-components` para estilos.
- Imports internos con alias `@/*` → `src/*` (alias configurado en `tsconfig.app.json` y `vite.config.ts`).
- Dependencias mínimas: `react`, `react-dom`, `styled-components`; dev: Vite, Vitest, Testing Library, ESLint. Sin librerías de iconos.

## 2. Identidad visual (spec §13)

Tokens centralizados en **`src/styles/theme.ts`** (única fuente de verdad, sin sistema de diseño complejo):

- **Color:** paleta neutra (fondo `#ffffff`, superficies `#f7f7f8`/`#f2f2f4`, texto `#1d1d1f`/`#6e6e73`/`#aeaeb2`); acento discreto `#0a84ff` solo para estados.
- **Tipografía:** pila del sistema `-apple-system, BlinkMacSystemFont, "SF Pro Text", …`; escala con jerarquía (largeTitle → caption).
- **Espaciado:** escala 4 px (xxs 4px → xxxl 72px).
- **Radios:** three niveles consistentes (6/10/14 px).
- **Sombras:** dos sombras muy suaves, solo para profundidad.
- **Bordes:** sutiles (`1px solid #e5e5e7`).
- **Motion:** transiciones cortas (120–250 ms) con easing estándar, anuladas bajo `prefers-reduced-motion: reduce`.
- **Estados:** hover/focus definidos; ring de foco accesible global (`:focus-visible`, `src/styles/BaseStyles.ts`).
- La app es placeholder minimalista: imagen/lámina no implementadas todavía, la interfaz de precede sin competir visualmente.

## 3. Footer del desarrollador (spec §14)

Estructura:

```
src/components/Footer/
├─ Footer.tsx        # componente presentacional
├─ Footer.styles.ts  # styled-components ("Footer")
├─ Footer.test.tsx   # pruebas (sin snapshot)
└─ index.ts          # re-export público
```

- `useFooter.ts` **omitido por decisión del cliente**: sin lógica real que lo justifique en esta entrega.
- Configuración centralizada en **`src/config/social.ts`** (`SOCIAL_LINKS` + `getAvailableSocialLinks()`):
  - GitHub: `https://github.com/ismaelmarot` (URL verificada en el remoto del repo).
  - LinkedIn: `https://linkedin.com/in/ismael-marot-1aab33440` (URL documentada en el README del perfil de GitHub).
  - Instagram: `""` con `// TODO` — pendiente de URL oficial, **no se inventa**.
  - Facebook: `""` con `// TODO` — pendiente de URL oficial, **no se inventa**.
- Los redes con URL vacía **no se renderizan** (`getAvailableSocialLinks()` filtra cadenas vacías).
- Iconografía: 4 inline SVG propios (marcas GitHub/LinkedIn/Instagram/Facebook) en `Footer/icons.tsx`, `aria-hidden` + `focusable="false"`; nombre accesible en `aria-label` del enlace.
- Enlaces: `target="_blank" rel="noopener noreferrer"`; área táctil ≥ 44 px (44 en escritorio, 40 px mínimo en móvil).
- Layout: escritorio → fila horizontal (handle izquierda, redes derecha); móvil → columna centrada compacta; footer discreto con borde superior sutil y `max-width: 960px`.
- Enlaces de redes sociales del desarrollador, exclusivamente. Enlaces de redes sociales del producto PaintNum quedan excluidos por decisión del cliente.

## 4. Pruebas (spec §14, criterios de aceptación)

`Footer.test.tsx` (Vitest + Testing Library, jsdom; sin snapshot):

1. Renderiza el texto `@ismaelmarot`.
2. Total de enlaces == redes con URL definida.
3. GitHub y LinkedIn: `href` correcto, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` accesible.
4. Instagram/Facebook (URL vacía) no renderizan enlaces.
5. SVGs decorativos (`aria-hidden`) mientras el nombre accesible vive en el enlace.

Resultados completos en §6; la suite ejecutó 5/5 casos.

## 5. Decisiones y contras

| Decisión | Razón |
| --- | --- |
| Tokens en TS con `styled-components ThemeProvider` | Tipado del tema + acceso a tokens desde estilos, sin CSS global extra. |
| `BaseStyles.ts` `createGlobalStyle` global mínimo | Reset + pila tipográfica + `prefers-reduced-motion` + ring de foco; no duplica el estilado específico. |
| Iconos inline propios en lugar de lucide/react-icons | Evita dependencia; tamaño mínimo total; control total de la estética. |
| Redes vacías retiradas del DOM, no `disabled` | Evita enlaces "rotos" y refuerza el requisito `no inventar URLs`. |
| Sin `src/interfaces/` todavía | Cliente pidió crearla solo con interfaces reales compartidas; aún no existen. |
| Sin `useFooter.ts` | Cliente pidió omitir gancho vacíos; se incorporará si la lógica lo justifica. |

## 6. Verificaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm run test` | PASS — 5/5 casos (1 suite, 0 fallos) |
| `npm run lint` | OK — 0 errores, 0 avisos |
| `npm run typecheck` (`tsc -b --noEmit`) | OK — sin errores |
| `npm run build` | OK — `dist/` generado; bundle 261.61 kB (85.06 kB gzip) |

Enlaces para revisión del alcance de la verificación: los comandos se ejecutaron localmente; los inferiores quedaron en el archivo `dist/` generado (sin commit).

## 7. Pendientes / siguientes pasos

- URLs oficiales de **Instagram** y **Facebook** (completar TODOs en `src/config/social.ts`); al hacerlo, aparecen automáticamente en el footer (ya cubierto por pruebas).
- Revisión y aprobación del cliente de esta entrega antes de generar la lógica de pintura por números (spec resto, secciones 1–12).
- Sin commits ni push: la entrega queda sin versionar a la espera de autorización explícita.
