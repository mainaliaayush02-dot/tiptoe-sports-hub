import { createContext, useContext, useState, useEffect } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { settingsDoc } from '../firebase/collections'

const DEFAULTS = {
  academyName: 'Tiptoe Sports Hub',
  tagline: 'A Home for Future Players',
  phone: '+977 984-1416893',
  email: 'tiptoesportshub@gmail.com',
  address: 'Tarakeshwar, Kathmandu, Nepal',
  whatsapp: '9779800000000',
  logoURL: '/logo.jpeg',
  academyLogoURL: '/academy-logo.jpeg',
  mapsEmbedURL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.58!2d85.3047!3d27.7368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb199a534fb789%3A0x9b5cd5299ace8bc!2sTarakeshwar%2C+Kathmandu!5e0!3m2!1sen!2snp!4v1',
  mapsLink: 'https://maps.app.goo.gl/GXdjUV3qQX4Rm61o7',
  hoursWeekdays: '6 AM – 9 PM',
  hoursSaturday: '6 AM – 8 PM',
  hoursSunday: '7 AM – 12 PM',
  socialLinks: {
    instagram: 'https://www.instagram.com/tiptoesportshub',
    facebook: 'https://www.facebook.com/tiptoeacademy',
    tiktok: 'https://www.tiktok.com/@tiptoesportshub1504',
  },
}

const SiteContext = createContext(DEFAULTS)

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)

  useEffect(() => {
    const unsub = onSnapshot(
      settingsDoc,
      snap => {
        if (snap.exists()) {
          const data = snap.data()
          setSettings({
            ...DEFAULTS,
            ...data,
            logoURL: data.logoURL || DEFAULTS.logoURL,
            academyLogoURL: data.academyLogoURL || DEFAULTS.academyLogoURL,
            hoursWeekdays: data.hoursWeekdays || DEFAULTS.hoursWeekdays,
            hoursSaturday: data.hoursSaturday || DEFAULTS.hoursSaturday,
            hoursSunday: data.hoursSunday || DEFAULTS.hoursSunday,
            socialLinks: { ...DEFAULTS.socialLinks, ...(data.socialLinks || {}) },
          })
        }
      },
      () => {}
    )
    return unsub
  }, [])

  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
