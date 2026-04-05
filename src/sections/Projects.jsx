import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { projects } from '../data/content'

export default function Projects() {
  return (
    <section id="projects" className="py-20 border-b border-slate-200 dark:border-white/5">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionTitle
          eyebrow="Projects"
          title="Built with purpose"
          caption="A few highlights from recent work."
          align="left"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((project, idx) => (
            <Card
              key={project.title}
              className="border-slate-200 bg-white transition duration-300 hover:border-accent-500/60 dark:border-white/5 dark:bg-surface-800/80"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-accent-500">Case study</p>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                  </div>
                  <div className="flex gap-2 text-slate-500 dark:text-slate-300">
                    <a
                      href={project.github}
                      aria-label="GitHub"
                      className="rounded-full border border-slate-200 p-2 transition hover:border-accent-500 hover:text-accent-500 dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
                    >
                      <FiGithub />
                    </a>
                    <a
                      href={project.live}
                      aria-label="Live demo"
                      className="rounded-full border border-slate-200 p-2 transition hover:border-accent-500 hover:text-accent-500 dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
                    >
                      <FiExternalLink />
                    </a>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-surface-900 dark:text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
