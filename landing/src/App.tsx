import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import HomePage from './components/HomePage'
import JournalDetail from './components/JournalDetail'

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    if (!isLoading && isHome) {
      window.scrollTo(0, 0)
    }
  }, [isLoading, isHome])

  if (isLoading && isHome) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/journal/:slug" element={<JournalDetail />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Layout>
      <AppContent />
    </Layout>
  )
}
