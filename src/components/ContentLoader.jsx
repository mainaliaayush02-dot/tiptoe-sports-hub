import { motion } from 'framer-motion'
import LoadingSkeleton from './LoadingSkeleton'

export default function ContentLoader({ loading, count = 6, type = 'cards', skeleton, children }) {
  if (loading) return skeleton ?? <LoadingSkeleton count={count} type={type} />
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
