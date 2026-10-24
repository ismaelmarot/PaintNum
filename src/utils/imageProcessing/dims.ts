/** Cálculo de dimensiones de escala (helper puro compartido). */

export function axesDims(
  naturalWidth: number,
  naturalHeight: number,
  maxSide: number,
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    throw new RangeError('Dimensiones inválidas')
  }
  const longest = Math.max(naturalWidth, naturalHeight)
  if (longest <= maxSide) {
    return { width: naturalWidth, height: naturalHeight }
  }
  const ratio = maxSide / longest
  return {
    width: Math.max(1, Math.round(naturalWidth * ratio)),
    height: Math.max(1, Math.round(naturalHeight * ratio)),
  }
}
