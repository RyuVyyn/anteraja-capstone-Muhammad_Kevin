import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext } from './context'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, localeFor, translate, translations } from './translation'

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANGUAGE)

  const setLang = useCallback((next) => {
    if (SUPPORTED_LANGUAGES.includes(next)) {
      setLangState(next)
    }
  }, [])

  const dictionary = translations[lang] ?? translations[DEFAULT_LANGUAGE]

  const t = useCallback((key, vars) => translate(dictionary, key, vars), [dictionary])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = translate(dictionary, 'app.title')
  }, [dictionary, lang])

  const value = useMemo(() => ({
    lang,
    locale: localeFor(lang),
    setLang,
    t,
  }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
