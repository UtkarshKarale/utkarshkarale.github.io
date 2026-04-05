import { motion } from 'framer-motion'

export default function Button({ href, children, variant = 'primary' }) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

  const styles = {
    primary:
      'bg-accent-500 text-slate-900 shadow-glow hover:shadow-[0_12px_50px_-16px_rgba(245,197,66,0.7)] focus-visible:outline-accent-500',
    ghost:
      'border border-slate-200 text-slate-800 hover:border-accent-500 hover:text-accent-500 focus-visible:outline-accent-500 dark:border-white/12 dark:text-slate-100 dark:hover:border-accent-500 dark:hover:text-accent-400',
  }

  if (href) {
    return (
      <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} href={href} className={`${base} ${styles[variant]}`}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className={`${base} ${styles[variant]}`}>
      {children}
    </motion.button>
  )
}
