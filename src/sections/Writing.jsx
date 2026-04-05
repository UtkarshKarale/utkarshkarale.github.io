import { motion } from 'framer-motion'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { articles } from '../data/content'

export default function Writing() {
  return (
    <section id="writing" className="bg-slate-50 py-20 border-b border-slate-200 dark:bg-surface-800/60 dark:border-white/5">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionTitle
          eyebrow="Utkarsh Writes"
          title="Articles & Notes"
          caption="Fast takes on engineering and product."
          align="left"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {articles.map((article, idx) => (
            <Card key={article.title} className="border-slate-200 bg-white dark:border-white/5 dark:bg-surface-800/80">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex flex-col gap-2 text-left"
              >
                <span className="text-[11px] uppercase tracking-[0.22em] text-accent-500">Perspective</span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{article.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{article.preview}</p>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Read more →</span>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
