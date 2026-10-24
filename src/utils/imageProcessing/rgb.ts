import type { RgbColor } from '@/interfaces/image'

/** Color RGB en componentes discretas 0..255. */
export type { RgbColor as RgbColor }
export const rgbKey = ({ r, g, b }: RgbColor): number =>
  (r << 16) | (g << 8) | b

export const hexFrom = ({ r, g, b }: RgbColor): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
