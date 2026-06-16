import { createContext, useContext, useState, useEffect } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { settingsDoc } from '../firebase/collections'

const DEFAULTS = {
  academyName: 'Tiptoe Sports Hub',
  tagline: 'A Home for Future Players',
  phone: '+977 980-0000000',
  email: 'info@tiptoesportshub.com',
  address: 'Tarkeshwar, Kathmandu, Nepal',
  whatsapp: '9779800000000',
  logoURL: '/logo.jpeg',
  mapsEmbedURL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.58!2d85.3047!3d27.7368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb199a534fb789%3A0x9b5cd5299ace8bc!2sTarkeshwar%2C+Kathmandu!5e0!3m2!1sen!2snp!4v1',
  mapsLink: 'https://maps.app.goo.gl/qSVDwXY53wtm5F576',
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
