import { FiGithub, FiLinkedin } from 'react-icons/fi'
import SectionTitle from '../components/SectionTitle'
import Button from '../components/Button'

export default function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <SectionTitle
          eyebrow="Contact"
          title="Let’s build together"
          caption="Open to full-time roles and selective freelance."
          align="left"
        />
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_80px_-40px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-surface-800/90 dark:shadow-[0_20px_80px_-40px_rgba(0,0,0,0.7)]">
          <p className="text-lg text-slate-700 dark:text-slate-200">
            Ready for your next build? I can help architect, ship, and scale it—fast.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button href="mailto:your.email@example.com">Email Me</Button>
            <Button href="#projects" variant="ghost">
              View Work
            </Button>
          </div>
          <div className="mt-6 flex justify-center gap-4 text-slate-500 dark:text-slate-300">
            <a
              href="https://github.com/"
              className="rounded-full border border-slate-200 p-3 transition hover:border-accent-500 hover:text-accent-500 dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
            >
              <FiGithub className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/"
              className="rounded-full border border-slate-200 p-3 transition hover:border-accent-500 hover:text-accent-500 dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
            >
              <FiLinkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
