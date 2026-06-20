import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [hash])

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
