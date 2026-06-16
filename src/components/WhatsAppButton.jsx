import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { useSite } from '../contexts/SiteContext'

const MSG = encodeURIComponent('Hi Tiptoe Sports Hub, I want to know more about your programs')

export default function WhatsAppButton() {
  const { whatsapp } = useSite()
  const number = whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '9779800000000'

  return (
    <motion.a
      href={`https://wa.me/${number}?text=${MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
      style={{ backgroundColor: '#25D366' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaWhatsapp size={28} color="#fff" />
    </motion.a>
  )
}
