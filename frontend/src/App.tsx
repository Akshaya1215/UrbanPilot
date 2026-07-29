import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { RecommendationPage } from './pages/RecommendationPage'
import { SplashPage } from './pages/SplashPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<SplashPage />} />
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="processing" element={<Navigate to="/" replace />} />
          <Route path="recommendation" element={<RecommendationPage />} />
          <Route path="compare" element={<Navigate to="/recommendation" replace />} />
          <Route path="journey" element={<Navigate to="/recommendation" replace />} />
          <Route path="map" element={<MapPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
