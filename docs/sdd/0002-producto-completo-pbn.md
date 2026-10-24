# SDD 0002 — Producto completo: generación, comparador, configuración, exportación y compartir

- **Fecha:** 2026-10-23
- **Estado:** Entregada — pendiente de revisión
- **Alcance:** Cubre las secciones 1–15 del SDD maestro sobre la base de `0001` (scaffold + footer v1). No duplica decisiones ya documentadas; solo registra decisiones nuevas y confirmaciones.

## 1. Resumen de entregas

 Producto local (todo el procesamiento en el navegador) en React 19 + TS estricto + Vite 7, con las etapas aprobadas:

| Etapa | Contenido | Archivos clave |
| --- | --- | --- |
| 1 | Núcleo puro de pbn (sin DOM) + tests | `src/utils/imageProcessing/*` |
| 2 | Carga de imagen (validación + decodificación) | `src/utils/imageProcessing/loadImage.ts`, `src/components/ImageUploader` |
| 3 | Render de la lámina + orquestación | `src/utils/imageProcessing/renderPainting.ts`, `src/components/PaintingCanvas`, `src/App.tsx` |
| 4 | Comparador con divisoria (puntero + teclado) | `src/components/ImageComparator` |
| 5 | Panel de configuración + tabla de colores | `src/components/ConfigPanel`, `src/components/ColorPaletteTable` |
| 6 | Exportar PDF / ZIP (página 1 original, página 2 lámina + tabla paginada) | `src/utils/exporting/*`, `src/components/ExportActions`, `src/components/ExportActions/useExportManager.ts` |
| 7 | Compartir (Web Share API + intents oficiales + aviso local + Instagram orientado a descarga) | `src/config/sharing.ts`, `src/components/ShareBar` |
| 8 | Footer §15 reescrito: 4 iconos SIEMPRE, pendientes no interactivos, sin efectos hover | `src/config/social.ts`, `src/components/Footer` |

## 2. Tipos compartidos (`src/interfaces/`)

- `image.ts` (`RgbColor`), `pbn.ts` (`PaintByNumberResult`, `PaletteColor`), `loading.ts` (`DecodedImage`, `LoadLimits`, `ImageUploadProgress`), `printing.ts` (`PaperConfig`, `PrintPageLayout`), `workspace.ts` (`WorkspaceConfig`, `GenerationConfig`, `DetailPresetId`), `index.ts` reexporta.
- Componentes: grupos §5 (`Componente/{Componente.tsx, .styles.ts, .test.tsx, index.ts, useContent.ts}`); geometría y gancho sólo donde hay lógica real.

## 3. Núcleo puro (sin DOM, cuantización + segmentación + números)

- Cuantización: **median cut** por bisagras; rotulado por color RGB más cercano; segmentación conectada **4-neighbor**; fusión de regiones pequeñas (área < `max(smallRegionMinPx, smallRegionRatio × total)`) al vecino con frontera más larga; numeración 1..n por cobertura descendiente (empate → índice de paleta ascendente).
- Constantes en `src/config/processing.ts` (`PROCESSING_LIMITS`, `DETAIL_PRESETS` `fine|balanced|coarse`).
- Precisión de las pruebas: fixtures en `src/utils/imageProcessing/__fixtures__/images.ts` con `ImageDataLike`; NO node-canvas, no excepciones DOM.

## 4. Render + comparador

- `renderPainting.ts`: `composePaintingImageData` (bloques + números), `computeNumberPlacements`, `drawPainting(ctx, result, { scale?, forScreen? })`.
- `PaintingCanvas`: test con stub de canvas en `src/test/setup.ts` (getContext → null; `jsdom` no renderiza píxeles).
- `ImageComparator`: divisoria con puntero/táctil/teclado (`ArrowLeft/Right ±2%`, `Home=8%`, `End=92%`); arrastre + `clip-path`; `Spacer` eliminado en favor de `aspect-ratio`.
- jsdom + user-event: sin `user.change` (usar `fireEvent.change`); `PointerEvent` polyfill; `Object.defineProperty(input, 'files', { configurable: true })`; transitorios `$prop` (styled v6).

## 5. Exportación

- `src/utils/exporting/canvases.ts`: `exportScale` (cap 4×; `maxSide` = `PRINTING_DEFAULTS.maxExportSidePx` (default 2480 px @300 dpi)), `paintingCanvas`, `originalCanvas`, `pageDimensionsMm`, `canvasToBlob`.
- `src/utils/exporting/paletteCsv.ts`: CSV con BOM + encabezado `numero,hex,rgb,rgba,superficie_pct,pixeles`.
- `src/utils/exporting/paintingPdf.ts`: primero página 1 imagen original, página 2 lámina preparada para pintar; luego páginas de tabla (parámetros `drawTablePage` para indexing con `contentHeight` dinámico); `\uFEFF` para el Excel; `fitRect` respeta proporciones.
- `src/utils/exporting/exportZip.ts`: contenedor ZIP con `imagen-original.{ext}`, `pintura-por-numeros.png`, `tabla-de-colores.csv`, `paintnum-preparado-para-imprimir.pdf` + `downloadBlob` (URL.createObjectURL, ancla + revoke).
- `useExportManager`: dos botones (PDF / ZIP), estados idle/«Generando archivo…»/error (freerolled `alert`), sin opciones falsamente «completas» (no simulamos éxito mientras la grabación sigue en curso).
- Dependencias agregadas: `jspdf` + `jszip` (únicas autorizadas). **Advertencia de build:** el bundle supera 500 kB minificado por jspdf/jszip; si molesta, dividir con `vite.config.ts` `manualChunks` o `import()`. NO se hizo (fuera de alcance aprobado).

## 6. Compartir (§11)

- `src/config/sharing.ts` — capacidades reales, sin APIs privadas:
  - WhatsApp: `https://wa.me/?text={text}`
  - Telegram: `https://t.me/share/url?url={url}&text={text}`
  - X: `https://twitter.com/intent/tweet?text={text}&url={url}`
  - Pinterest: `https://pinterest.com/pin/create/button/?url={url}&description={text}`
  - Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}`
- **Limitación documentada en UI:** al ejecutarse en localhost el mensaje incluye el aviso «la URL no es pública todavía» — no simulamos publicación cuando no es posible.
- Web Share API Level 2 (share files) — `sharePaintingFiles` (AbortError = éxito por cancel del usuario).
- **Instagram:** sin intent de publicación web; se descarga el PNG + orientación explícita (no automatizamos).
- `copyLink` vía Clipboard API con feedback real (éxito/fallo).

## 7. Footer §15

- `src/config/social.ts` — `getAllSocialLinks()` (los cuatro, si includes pending) + `getAvailableSocialLinks()` (compat: los resueltos).
- `Footer.styles.ts`: **sin transiciones ni `:hover` de cualquier tipo** (color/opacity/bg/tamaño/transform/sombra — nada); accesibilidad de teclado preservada vía `:focus-visible`.
- Pendiente (`pending: true`) → `SocialPending` `<span>` no interactivo (no `<a href="">` roto) con `title` + `aria-label` accesible («Perfil de X pendiente de configurar»).
- Sin supuestos de URL inventadas (compromeso: «Instagram / Facebook: `""` + TODO»).

## 8. Ronda de correcciones (2026-10-23, feedback del desarrollador)

Correcciones y mejoras posteriores a la primer versión del producto, todas aprobadas por el desarrollador antes de ejecutar. Sin commits (autorización pendiente).

| # | Corrección | Implementación |
| --- | --- | --- |
| 1 | **“Reemplazar imagen” no hacía nada** (bug) | El `<input type="file">` vivía dentro de `ImageUploader`, que se desmonta al cargar la primera imagen → `inputRef.click()` sobre input desmontado. Fix: input a nivel `App.tsx` (siempre montado), compartido por uploader (drag&drop) y TopBar (reemplazar). |
| 2 | **Números gigantes** (bug, dos pasadas) | `computeNumberPlacements` sin techo: 60% del alto de envolvente. Final: `fontByHeight = boundH×0.35` + tope `NUMBER_MAX_FONT_FRACTION = 0.06` (6% del lado mayor de trabajo) + umbral mínimo para descartar glifos ilegibles en regiones chicas. Constantes exportadas para ajuste fino. |
| 3 | **Lámina debe ser blanco y negro** (para poder pintarse) | `composePaintingImageData` → relleno blanco uniforme (`PLATE_BACKGROUND`); contornos gris absoluto (`PLATE_CONTOUR`); números siempre oscuros (`PLATE_NUMBER_FILL`) — la lógica de luminancia/color se elimina. Los colores viven solo en la tabla; el comparador mantiene la foto original a color del lado izquierdo. |
| 4 | **Papel: más tamaños + personalizado** | `PAPER_SIZES_MM` + **A5 148×210, A2 420×594, Oficio 216×356, Doble carta 279×432** + **`Custom`** con ancho×alto libre (mm, 50–1000, `CUSTOM_PAPER_LIMITS` + `isValidCustomSize` + `resolvePaperSizeMm`). `pageDimensionsMm`/PDF/export respetan custom (fallback A4 si custom inválido); `ConfigPanel` muestra campos numéricos con advertencia live (`role="alert"`). |
| 5 | **Compartir: solo iconos, estilo footer** | `ShareBar` icon-only (8): Web Share, WhatsApp, Telegram, X, Pinterest, Facebook, copiar enlace, Instagram-descarga. Iconos **sólidos `fill=currentColor`** mismo estilo de los del footer. Accesibilidad: `aria-label` + `title`. Avisos (localhost, guía Instagram, feedback de copiado) quedan como texto debajo. |
| 6 | **Descargar: botones con icono** | PDF con icono documento, ZIP con icono archivo (trazo 1.6, estética Apple) + indicador giratorio (spinner) mientras genera. |
| 7 | **Botones del panel redondeados** | `SegmentedButton` pasa de `radius.medium` a `radius.round` (píldora, coherente con “Descargar PDF”). |
| 8 | **Footer: © año + URLs reales** | `© {año dinámico} Ismael Marot` (reemplaza al handle). URLs provistas por el desarrollador: GitHub `github.com/ismaelmarot`, LinkedIn `linkedin.com/in/ismael-marot/`, Instagram `instagram.com/ismaelmarot/` (ya no pendiente), **Facebook temporal → `https://www.facebook.com/`** (landing; TODO perfil real). El mecanismo §15 pendiente-no-interactivo queda en código para futuros vacíos. |

## 9. Verificaciones ejecutadas (ronda de correcciones y producto)

| Comando | Resultado |
| --- | --- |
| `npm run test` | PASS — 54/54 casos (11 suites, 0 fallos) |
| `npm run lint` | OK — 0 errores, 0 avisos |
| `npm run typecheck` (`tsc -b --noEmit`) | OK — sin errores |
| `npm run build` | OK — `dist/` (aviso de bundle > 500 kB por jspdf/jszip, ver §5) |

## 10. Ronda 2 de correcciones (2026-10-23)

| # | Corrección | Implementación |
| --- | --- | --- |
| 1 | **Números uniformes y chicos** | Modelo cambiado: `NUMBER_FONT_FRACTION = 0.02` (2% del lado mayor de trabajo) UNIFORME para todas las regiones (look de lámina comercial) — solo cambia el check de fit; regiones demasiado chicas quedan sin número (`renderPainting.test.ts`: tope, uniformidad, skip y relleno blanco). |
| 2 | **Más detalle** | Preset `ultrafino` (`smallRegionRatio 0.0006, smallRegionMinPx 12`) + `maxWorkSide 1600 → 2000` (más resolución de trabajo; ~56% más píxeles, más CPU/RAM local). |
| 3 | **Tabla por Nº 1,2,3…** | `ColorPaletteTable` y `buildPaletteCsv` ordenan ascendente por número (el orden interno sigue siendo por cobertura). |
| 4 | **Nombre personalizado al descargar** | Input pill (placeholder `paintnum`, sanitización de `\ / : * ? " < > |`) → `⌂{nombre}.pdf` / `⌂{nombre}.zip`; archivos internos del ZIP quedan estándar. `useExportManager` expone `filename/setFilename`. |
| 5 | **Compartir: 6 iconos oficiales** | Fuera Web Share (dispositivo) y “Copiar enlace”. Quedan WhatsApp `#25D366`, Telegram `#229ED9`, X `#000000`, Pinterest `#E60023`, Facebook `#1877F2`, Instagram `#E4405F` — glifos estilo simple-icons en blanco sobre fondo de marca en botón circular 36 px. Instagram = descarga la lámina (sin intent web) + confirmación y guía textual. `BRAND_COLORS` es fuente de verdad en `ShareBar.styles.ts`. |

**Verificación ronda 2:** 60/60 tests (12 suites) · lint OK · typecheck OK · build OK.

## 11. Pendientes / siguientes pasos

- **URL de Facebook real** (reemplazar el temporal `https://www.facebook.com/`).
- Sin commits ni push (esperando autorización explícita del desarrollador).
- Optimización opcional de bundle (code-split de export) — solo si se aprueba.
- Ajuste fino del tamaño de números vía constantes exportadas si se pide.
