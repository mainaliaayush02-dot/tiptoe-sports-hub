import nodemailer from 'nodemailer'

const TO = 'tiptoesportshub@gmail.com'

// ── Shared CSS ─────────────────────────────────────────────────────────────────
const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#F4F5FA;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937}
  .wrap{max-width:600px;margin:32px auto;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)}
  .header{background:linear-gradient(135deg,#030A2E 0%,#06145F 100%);padding:40px 40px 32px;text-align:center}
  .pill{display:inline-block;background:#FFC700;color:#030A2E;font-size:11px;font-weight:800;padding:5px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:16px}
  .header h1{color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px}
  .header p{color:rgba(255,255,255,0.5);font-size:13px}
  .body{background:#fff;padding:36px 40px}
  .alert{background:#EEF2FF;border-left:4px solid #06145F;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px}
  .alert p{font-size:14px;color:#06145F;font-weight:600;line-height:1.5}
  .lbl-row{font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px}
  table.grid{width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:20px}
  table.grid td{background:#F9FAFB;border:1px solid #f3f4f6;border-radius:10px;padding:13px 15px;width:50%;vertical-align:top}
  .cell-lbl{font-size:10px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px}
  .cell-val{font-size:14px;color:#111827;font-weight:600}
  .tag{display:inline-block;background:rgba(6,20,95,0.1);color:#06145F;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px}
  .msg-box{background:#F9FAFB;border:1px solid #f3f4f6;border-radius:10px;padding:18px;margin-bottom:28px}
  .msg-box p{font-size:14px;color:#374151;line-height:1.7}
  .divider{height:1px;background:#f3f4f6;margin:22px 0}
  .cta-wrap{text-align:center;padding:10px 0 4px}
  .cta{display:inline-block;background:#FFC700;color:#030A2E;font-size:14px;font-weight:800;padding:15px 36px;border-radius:12px;text-decoration:none}
  .footer{background:#030A2E;padding:24px 40px;text-align:center}
  .footer p{color:rgba(255,255,255,0.3);font-size:12px;line-height:1.8}
  .footer a{color:rgba(255,255,255,0.45);text-decoration:none}
`

function page(pill, sub, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${CSS}</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="pill">${pill}</div>
    <h1>Tiptoe Sports Hub</h1>
    <p>${sub}</p>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    <p>Tiptoe Sports Hub &nbsp;·&nbsp; Tarkeshwar, Kathmandu, Nepal</p>
    <p style="margin-top:5px"><a href="https://tiptoesportshub.com">tiptoesportshub.com</a></p>
    <p style="margin-top:10px;font-size:11px">Sent automatically from the website form.</p>
  </div>
</div></body></html>`
}

function row(label, value) {
  return `<td><div class="cell-lbl">${label}</div><div class="cell-val">${value || '—'}</div></td>`
}

// ── Enrollment template ────────────────────────────────────────────────────────
function enrollHTML(d) {
  const body = `
    <div class="alert">
      <p>⚽&nbsp; New enrollment inquiry from <strong>${d.name}</strong>. Please call within 24 hours.</p>
    </div>

    <p class="lbl-row">Student Details</p>
    <table class="grid">
      <tr>${row('Student Name', d.name)}${row('Age', d.age ? `${d.age} years old` : null)}</tr>
      <tr>${row('Parent / Guardian', d.parentName)}${row('Phone', d.phone)}</tr>
      <tr>${row('Email', d.email)}${row('Sport', d.sport ? `<span class="tag">${d.sport}</span>` : null)}</tr>
      <tr>${row('Age Group', d.ageGroup)}${row('Preferred Schedule', d.preferredSchedule)}</tr>
    </table>

    ${d.message ? `<div class="divider"></div>
    <p class="lbl-row">Additional Message</p>
    <div class="msg-box"><p>${d.message}</p></div>` : ''}

    <div class="cta-wrap">
      <a href="tel:${d.phone}" class="cta">📞&nbsp; Call ${d.parentName || d.name}</a>
    </div>
  `
  return page('New Enrollment Inquiry', 'Someone submitted an enrollment form on the website', body)
}

// ── Contact template ───────────────────────────────────────────────────────────
function contactHTML(d) {
  const body = `
    <div class="alert">
      <p>💬&nbsp; New message from <strong>${d.name}</strong> via the Contact page.</p>
    </div>

    <p class="lbl-row">Contact Details</p>
    <table class="grid">
      <tr>${row('Name', d.name)}${row('Phone', d.phone)}</tr>
      <tr>${row('Email', d.email)}${row('Sport Interest', d.sport ? `<span class="tag">${d.sport}</span>` : null)}</tr>
    </table>

    ${d.message ? `<div class="divider"></div>
    <p class="lbl-row">Their Message</p>
    <div class="msg-box"><p>${d.message}</p></div>` : ''}

    <div class="cta-wrap">
      <a href="tel:${d.phone}" class="cta">📞&nbsp; Reply to ${d.name}</a>
    </div>
  `
  return page('New Contact Message', 'Someone sent a message via the website contact form', body)
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const appPass = process.env.GMAIL_APP_PASS
  if (!appPass) return res.status(500).json({ error: 'Email not configured on server.' })

  const { type, data } = req.body || {}
  if (!type || !data) return res.status(400).json({ error: 'Missing type or data.' })

  const isEnroll = type === 'enroll'
  const subject  = isEnroll
    ? `⚽ New Enrollment – ${data.name} (Age ${data.age})`
    : `💬 New Message – ${data.name}`
  const html = isEnroll ? enrollHTML(data) : contactHTML(data)

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: TO, pass: appPass },
    })
    await transporter.sendMail({ from: `"Tiptoe Sports Hub Website" <${TO}>`, to: TO, subject, html })
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Email send error:', e.message)
    res.status(500).json({ error: 'Failed to send email.' })
  }
}
