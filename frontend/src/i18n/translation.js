import id from './locales/id.js'
import en from './locales/en.js'

export const DEFAULT_LANGUAGE = 'id'

export const SUPPORTED_LANGUAGES = ['id', 'en']

export const translations = { id, en }

const resolveKey = (dictionary, key) =>
  String(key).split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), dictionary)

export function translate(dictionary, key, vars) {
  const value = resolveKey(dictionary, key)
  const fallback = resolveKey(id, key)
  const raw = typeof value === 'string' ? value : typeof fallback === 'string' ? fallback : key

  if (!vars) return raw

  return raw.replace(/\{(\w+)\}/g, (match, token) =>
    vars[token] != null ? String(vars[token]) : match,
  )
}

export const localeFor = (lang) => (lang === 'en' ? 'en-US' : 'id-ID')
