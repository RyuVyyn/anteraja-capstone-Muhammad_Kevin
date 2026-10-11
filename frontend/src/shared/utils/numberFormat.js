export const parseNumber = (value) => {
  const raw = String(value ?? '').replace(/\./g, '').replace(/,/g, '.').trim()
  if (!raw) return NaN
  const num = Number(raw)
  return Number.isFinite(num) ? num : NaN
}

export const formatRibuan = (value) => {
  const num = parseNumber(value)
  if (Number.isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}
