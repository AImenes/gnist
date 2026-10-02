import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { strings, type Lang, type StringKey } from './strings'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
  /** Voltage symbol: "U" in Norwegian convention, "V" in English. */
  V: string
}

const LangContext = createContext<Ctx | null>(null)

/** Preferred language from a stored choice, else the browser locale. Client only. */
export function detectLang(): Lang {
  try {
    const stored = localStorage.getItem('gnist.lang')
    if (stored === 'nb' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || ''
  const l = nav.toLowerCase()
  return l.startsWith('nb') || l.startsWith('nn') || l.startsWith('no') ? 'nb' : 'en'
}

/** The language comes from the URL (/nb/… or /en/…); switching navigates to the same page in the other language. */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('gnist.lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const setLang = useCallback(
    (l: Lang) => {
      if (l === lang) return
      const rest = location.pathname.replace(/^\/(nb|en)(?=\/|$)/, '')
      navigate(`/${l}${rest}${location.search}${location.hash}`)
    },
    [lang, location, navigate],
  )

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
