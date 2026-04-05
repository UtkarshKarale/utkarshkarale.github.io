import { useEffect, useState } from 'react'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Writing', href: '#writing' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur bg-white/95 border-b border-slate-200 dark:bg-surface-900/95 dark:border-white/5'
          : 'bg-white/90 border-b border-transparent dark:bg-surface-900/80'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <a href="#home" className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Utkarsh Karale
        </a>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-200">
          <div className="hidden items-center gap-5 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative text-slate-500 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-2 block h-[2px] origin-center scale-x-0 transform rounded-full bg-accent-500 transition duration-200 group-hover:scale-x-100" />
              </a>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-surface-800/80 dark:text-white"
          >
            {dark ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
