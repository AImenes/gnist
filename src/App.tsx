import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LangProvider, detectLang } from './i18n'
import type { Lang } from './i18n/strings'
import { Home } from './pages/Home'
import { CircuitsHome } from './pages/circuits/CircuitsHome'
import { CircuitLab } from './pages/circuits/CircuitLab'
import { OhmsLaw } from './pages/circuits/OhmsLaw'
import { Components } from './pages/circuits/Components'
import { OpAmp } from './pages/circuits/OpAmp'
import { StepResponse } from './pages/circuits/StepResponse'
import { SeriesParallel } from './pages/circuits/SeriesParallel'
import { SignalsHome } from './pages/signals/SignalsHome'
import { FourierEpicycles } from './pages/signals/FourierEpicycles'
import { SineBuilder } from './pages/signals/SineBuilder'
import { NotFound } from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function LangShell({ force }: { force?: Lang }) {
  const { lang: param } = useParams()
  const lang: Lang | null = force ?? (param === 'nb' || param === 'en' ? param : null)
  if (!lang) return <NotFoundShell />
  return (
    <LangProvider lang={lang}>
      <Layout>
        <ScrollToTop />
        <Outlet />
      </Layout>
    </LangProvider>
  )
}

function NotFoundShell() {
  return (
    <LangProvider lang="en">
      <Layout>
        <NotFound />
      </Layout>
    </LangProvider>
  )
}

/** "/" is prerendered as the English home; in the browser it hops to the visitor's language. */
function Root() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/${detectLang()}`, { replace: true })
  }, [navigate])
  return <LangShell force="en" />
}

export default function App() {
  const pages = (
    <>
      <Route index element={<Home />} />
      <Route path="circuits" element={<CircuitLab />} />
      <Route path="circuits/learn" element={<CircuitsHome />} />
      <Route path="circuits/ohm" element={<OhmsLaw />} />
      <Route path="circuits/components" element={<Components />} />
      <Route path="circuits/opamp" element={<OpAmp />} />
      <Route path="circuits/step" element={<StepResponse />} />
      <Route path="circuits/series-parallel" element={<SeriesParallel />} />
      <Route path="signals" element={<SignalsHome />} />
      <Route path="signals/fourier" element={<FourierEpicycles />} />
      <Route path="signals/builder" element={<SineBuilder />} />
      <Route path="*" element={<NotFound />} />
    </>
  )
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
      </Route>
      {/* old unprefixed links keep working */}
      <Route path="/circuits/*" element={<Navigate to={`/${detectLang()}/circuits`} replace />} />
      <Route path="/signals/*" element={<Navigate to={`/${detectLang()}/signals`} replace />} />
      <Route path="/:lang" element={<LangShell />}>
        {pages}
      </Route>
    </Routes>
  )
}
