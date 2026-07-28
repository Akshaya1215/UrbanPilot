import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { ComparePage } from './pages/ComparePage'
import { HomePage } from './pages/HomePage'
import { JourneyPage } from './pages/JourneyPage'
import { MapPage } from './pages/MapPage'
import { ProcessingPage } from './pages/ProcessingPage'
import { RecommendationPage } from './pages/RecommendationPage'
import { SplashPage } from './pages/SplashPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<SplashPage />} />
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="processing" element={<ProcessingPage />} />
          <Route path="recommendation" element={<RecommendationPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="map" element={<MapPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
