const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']

export function humanSize(bytes: number | undefined): string {
  if (bytes === undefined) return '—'
  let i = 0
  let v = bytes
  while (v >= 1024 && i < UNITS.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${UNITS[i]}`
}

export function money(price: number | undefined, currency: string | undefined): string {
  if (price === undefined) return '—'
  return `${price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency ?? ''}`.trim()
}
