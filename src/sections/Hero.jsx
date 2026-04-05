import { motion } from 'framer-motion'
import Button from '../components/Button'

const tags = ['React', 'Java', 'Spring Boot', 'Tailwind', 'Cloudflare', 'Automation']

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden border-b border-slate-200 dark:border-white/5">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-surface-800/80 dark:text-slate-300"
            >
              Full Stack Developer • Pune, India
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl"
            >
              Building scalable web apps & AI-powered products for real-world automation.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-lg text-slate-600 md:text-xl dark:text-slate-300"
            >
              I architect, ship, and iterate fast across React frontends and Java/Spring backends—optimizing for
              performance, maintainability, and product impact.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button href="#projects">View Projects</Button>
              <Button href="#contact" variant="ghost">
                Contact Me
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-2"
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-white/10 dark:bg-surface-800/80 dark:text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-60px_rgba(0,0,0,0.25)] dark:border-white/12 dark:bg-surface-800/90 dark:shadow-[0_28px_80px_-60px_rgba(0,0,0,0.9)]">
              <div className="relative space-y-5">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-surface-900">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current Focus</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">AI-led SaaS automation</p>
                  </div>
                  <span className="rounded-full border border-accent-500/60 bg-accent-500/15 px-3 py-1 text-xs text-accent-500">
                    Available
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  {[
                    ['20+', 'Projects shipped'],
                    ['3', 'SaaS products'],
                    ['5 yrs', 'Full-stack experience'],
                  ].map(([stat, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-5 dark:border-white/10 dark:bg-surface-900"
                    >
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat}</p>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-surface-900">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    “Utkarsh blends solid backend fundamentals with sharp React execution. He ships quickly without
                    sacrificing code quality.”
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Recent feedback
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
