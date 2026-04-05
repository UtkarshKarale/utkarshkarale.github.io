import { FiGithub, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-900/90 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-400 md:flex-row md:px-8">
        <p>© {new Date().getFullYear()} Utkarsh Karale. Built with React & Tailwind.</p>
        <div className="flex gap-3">
          <a href="https://github.com/" className="rounded-full border border-white/10 p-2 transition hover:border-white/30 hover:text-white">
            <FiGithub />
          </a>
          <a href="https://www.linkedin.com/" className="rounded-full border border-white/10 p-2 transition hover:border-white/30 hover:text-white">
            <FiLinkedin />
          </a>
        </div>
      </div>
    </footer>
  )
}
