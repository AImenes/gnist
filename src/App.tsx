import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { CircuitsHome } from './pages/circuits/CircuitsHome'
import { OhmsLaw } from './pages/circuits/OhmsLaw'
import { Components } from './pages/circuits/Components'
import { StepResponse } from './pages/circuits/StepResponse'
import { SeriesParallel } from './pages/circuits/SeriesParallel'
import { SignalsHome } from './pages/signals/SignalsHome'
import { FourierEpicycles } from './pages/signals/FourierEpicycles'
import { SineBuilder } from './pages/signals/SineBuilder'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/circuits" element={<CircuitsHome />} />
        <Route path="/circuits/ohm" element={<OhmsLaw />} />
        <Route path="/circuits/components" element={<Components />} />
        <Route path="/circuits/step" element={<StepResponse />} />
        <Route path="/circuits/series-parallel" element={<SeriesParallel />} />
        <Route path="/signals" element={<SignalsHome />} />
        <Route path="/signals/fourier" element={<FourierEpicycles />} />
        <Route path="/signals/builder" element={<SineBuilder />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  )
}
