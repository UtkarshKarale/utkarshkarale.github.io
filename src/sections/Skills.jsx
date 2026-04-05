import { motion } from 'framer-motion'
import { FiCpu, FiDatabase, FiTool } from 'react-icons/fi'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { skills } from '../data/content'

const icons = {
  frontend: <FiCpu className="h-4 w-4" />,
  backend: <FiDatabase className="h-4 w-4" />,
  tools: <FiTool className="h-4 w-4" />,
}

export default function Skills() {
  return (
    <section id="skills" className="bg-slate-50 py-20 border-b border-slate-200 dark:bg-surface-800/60 dark:border-white/5">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionTitle
          eyebrow="Skills"
          title="Full-stack toolkit"
          caption="Production-ready across frontend, backend, and DevEx."
          align="left"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {Object.entries(skills).map(([category, items], idx) => (
            <Card key={category} className="h-full border-slate-200 bg-white dark:border-white/5 dark:bg-surface-800/80">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-slate-100 p-2 text-slate-900 dark:bg-white/5 dark:text-white">
                    {icons[category]}
                  </span>
                  <span>{category}</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  {items.map((skill) => (
                    <li
                      key={skill.name}
                      className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/5 dark:bg-white/5"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{skill.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{skill.level}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
