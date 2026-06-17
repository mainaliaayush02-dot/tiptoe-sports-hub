import { collection, doc } from 'firebase/firestore'
import { db } from './config'

export const programsCol = collection(db, 'programs')
export const coachesCol = collection(db, 'coaches')
export const scheduleCol = collection(db, 'schedule')
export const eventsCol = collection(db, 'events')
export const galleryCol = collection(db, 'gallery')
export const blogCol = collection(db, 'blog')
export const testimonialsCol = collection(db, 'testimonials')
export const inquiriesCol = collection(db, 'inquiries')
export const settingsDoc = doc(db, 'settings', 'main')
export const sportsCol = collection(db, 'sports')
export const pricingCol = collection(db, 'pricing')
export const faqCol = collection(db, 'faq')
