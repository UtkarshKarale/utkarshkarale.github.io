import { motion } from 'framer-motion'

export default function Card({ children, className = '' }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_70px_-50px_rgba(0,0,0,0.25)] transition-colors dark:border-white/8 dark:bg-surface-800/80 dark:shadow-[0_18px_70px_-50px_rgba(0,0,0,0.8)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
