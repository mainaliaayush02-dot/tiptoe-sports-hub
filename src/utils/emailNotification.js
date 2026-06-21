import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ── Shared styles ─────────────────────────────────────────────────────────────
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
  .section-label{font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
  .cell{background:#F9FAFB;border-radius:10px;padding:14px 16px;border:1px solid #f3f4f6}
  .cell .lbl{font-size:10px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px}
  .cell .val{font-size:14px;color:#111827;font-weight:600}
  .full{grid-column:1/-1}
  .msg-box{background:#F9FAFB;border-radius:10px;padding:18px;border:1px solid #f3f4f6;margin-bottom:28px}
  .msg-box p{font-size:14px;color:#374151;line-height:1.7}
  .divider{height:1px;background:#f3f4f6;margin:24px 0}
  .cta-wrap{text-align:center;padding:8px 0 4px}
  .cta{display:inline-block;background:#FFC700;color:#030A2E;font-size:14px;font-weight:800;padding:15px 36px;border-radius:12px;text-decoration:none;letter-spacing:-0.2px}
  .footer{background:#030A2E;padding:24px 40px;text-align:center}
  .footer p{color:rgba(255,255,255,0.3);font-size:12px;line-height:1.8}
  .footer a{color:rgba(255,255,255,0.5);text-decoration:none}
  .tag{display:inline-block;background:rgba(255,199,0,0.15);color:#FFC700;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px}
`

function wrap(pill, heading, subheading, bodyHTML) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="pill">${pill}</div>
    <h1>Tiptoe Sports Hub</h1>
    <p>${subheading}</p>
  </div>
  <div class="body">${bodyHTML}</div>
  <div class="footer">
    <p>Tiptoe Sports Hub &nbsp;·&nbsp; Tarkeshwar, Kathmandu, Nepal</p>
    <p style="margin-top:6px"><a href="https://tiptoesportshub.com">tiptoesportshub.com</a></p>
    <p style="margin-top:10px;font-size:11px">This notification was sent from the website contact form.</p>
  </div>
</div></body></html>`
}

// ── Enrollment email ──────────────────────────────────────────────────────────
function buildEnrollHTML(d) {
  const body = `
    <div class="alert">
      <p>⚽ &nbsp;New enrollment inquiry from <strong>${d.name}</strong>. Please call within 24 hours to confirm.</p>
    </div>

    <p class="section-label">Student Information</p>
    <div class="grid">
      <div class="cell"><div class="lbl">Student Name</div><div class="val">${d.name}</div></div>
      <div class="cell"><div class="lbl">Age</div><div class="val">${d.age} years old</div></div>
      <div class="cell"><div class="lbl">Parent / Guardian</div><div class="val">${d.parentName || '—'}</div></div>
      <div class="cell"><div class="lbl">Phone Number</div><div class="val">${d.phone}</div></div>
      <div class="cell"><div class="lbl">Email</div><div class="val">${d.email || 'Not provided'}</div></div>
      <div class="cell"><div class="lbl">Sport of Interest</div><div class="val"><span class="tag">${d.sport}</span></div></div>
      <div class="cell"><div class="lbl">Age Group</div><div class="val">${d.ageGroup || 'Not specified'}</div></div>
      <div class="cell"><div class="lbl">Preferred Schedule</div><div class="val">${d.preferredSchedule || 'Not specified'}</div></div>
    </div>

    ${d.message ? `<div class="divider"></div>
    <p class="section-label">Additional Message</p>
    <div class="msg-box"><p>${d.message}</p></div>` : ''}

    <div class="cta-wrap">
      <a href="tel:${d.phone}" class="cta">📞 &nbsp;Call ${d.parentName || d.name} Now</a>
    </div>
  `
  return wrap('New Enrollment', 'Tiptoe Sports Hub', 'A new enrollment inquiry has been submitted via the website', body)
}

// ── Contact email ─────────────────────────────────────────────────────────────
function buildContactHTML(d) {
  const body = `
    <div class="alert">
      <p>💬 &nbsp;New message from <strong>${d.name}</strong> via the Contact page.</p>
    </div>

    <p class="section-label">Contact Details</p>
    <div class="grid">
      <div class="cell"><div class="lbl">Name</div><div class="val">${d.name}</div></div>
      <div class="cell"><div class="lbl">Phone Number</div><div class="val">${d.phone}</div></div>
      <div class="cell"><div class="lbl">Email</div><div class="val">${d.email || 'Not provided'}</div></div>
      <div class="cell"><div class="lbl">Sport Interest</div><div class="val">${d.sport ? `<span class="tag">${d.sport}</span>` : '—'}</div></div>
    </div>

    ${d.message ? `<div class="divider"></div>
    <p class="section-label">Their Message</p>
    <div class="msg-box"><p>${d.message}</p></div>` : ''}

    <div class="cta-wrap">
      <a href="tel:${d.phone}" class="cta">📞 &nbsp;Reply to ${d.name}</a>
    </div>
  `
  return wrap('New Message', 'Tiptoe Sports Hub', 'Someone reached out via the website contact form', body)
}

// ── Send helpers ──────────────────────────────────────────────────────────────
async function send(subject, html_body) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, { subject, html_body }, { publicKey: PUBLIC_KEY })
}

export async function sendEnrollmentEmail(data) {
  try {
    await send(`⚽ New Enrollment – ${data.name} (Age ${data.age})`, buildEnrollHTML(data))
  } catch (e) {
    console.warn('Enrollment email failed:', e)
  }
}

export async function sendContactEmail(data) {
  try {
    await send(`💬 New Message – ${data.name}`, buildContactHTML(data))
  } catch (e) {
    console.warn('Contact email failed:', e)
  }
}
