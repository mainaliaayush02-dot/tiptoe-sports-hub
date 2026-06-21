async function notify(type, data) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
  } catch (e) {
    console.warn('Email notification failed:', e)
  }
}

export const sendEnrollmentEmail = (data) => notify('enroll', data)
export const sendContactEmail    = (data) => notify('contact', data)
