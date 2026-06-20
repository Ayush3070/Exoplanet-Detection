import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Work', href: '/#work' },
  { name: 'Journal', href: '/#journal' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 transition-shadow duration-300 ${scrolled ? 'shadow-md shadow-black/10' : ''}`}>
      <div className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-all duration-300 ${scrolled ? 'shadow-md shadow-black/10' : ''}`}>
        <Link to="/" className="group relative w-9 h-9 rounded-full overflow-hidden cursor-pointer">
          <div className="absolute inset-0 rounded-full accent-gradient transition-all duration-500 group-hover:scale-x-[-1]" />
          <div className="absolute inset-[2px] rounded-full bg-bg flex items-center justify-center">
            <span className="font-display italic text-[13px] text-text-primary">Ex</span>
          </div>
        </Link>

        <div className="w-px h-5 bg-stroke mx-1 hidden sm:block" />

        {navItems.map((item) => {
          const isActive = isHome && item.href === '/' ? true : !isHome && item.href.startsWith('/#') ? false : false
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors ${
                isActive ? 'text-text-primary bg-stroke/50' : 'text-muted hover:text-text-primary hover:bg-stroke/50'
              }`}
            >
              {item.name}
            </Link>
          )
        })}

        <div className="w-px h-5 bg-stroke mx-1" />

        <a
          href={isHome ? '#contact' : '/#contact'}
          className="relative text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-muted hover:text-text-primary group/btn"
        >
          <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity accent-gradient" />
          <span className="relative bg-surface rounded-full backdrop-blur-md flex items-center gap-1 z-10">
            Say hi <span className="inline-block">↗</span>
          </span>
        </a>
      </div>
    </nav>
  )
}
