import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { strings, type Lang, type StringKey } from './strings'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
  /** Voltage symbol: "U" in Norwegian convention, "V" in English. */
  V: string
}

const LangContext = createContext<Ctx | null>(null)

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem('gnist.lang')
    if (stored === 'nb' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('nb') || nav.startsWith('nn') || nav.startsWith('no') ? 'nb' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('gnist.lang', l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<Ctx>(() => {
    const dict = strings[lang]
    const t = (key: StringKey, vars?: Record<string, string | number>) => {
      let s: string = dict[key] ?? strings.en[key] ?? key
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
      return s
    }
    return { lang, setLang, t, V: lang === 'nb' ? 'U' : 'V' }
  }, [lang, setLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useT() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT must be used inside LangProvider')
  return ctx
}
