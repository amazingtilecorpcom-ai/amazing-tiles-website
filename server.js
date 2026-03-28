require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// ── DEBUG: verify API key is loaded ──────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
    console.error('[FATAL] RESEND_API_KEY is not set. Check your .env file.');
    process.exit(1);
}
console.log('[DEBUG] RESEND_API_KEY loaded:', RESEND_API_KEY.substring(0, 8) + '...');

const resend = new Resend(RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files so the whole site still works from the same server
app.use(express.static(__dirname));

/* =============================================
   POST /api/contact
   ============================================= */
app.post('/api/contact', async (req, res) => {
    const { 'full-name': name, email, phone, location, service, message } = req.body;

    // Basic validation
    if (!name || !email || !phone || !service || !message) {
        return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }

    const serviceLabels = {
        bathroom: 'Bathroom Remodel',
        kitchen: 'Kitchen Backsplash / Floors',
        flooring: 'General Tile Flooring',
        custom: 'Custom Installation',
    };
    const serviceLabel = serviceLabels[service] || service;

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .header { background: #1a1a1a; padding: 32px 40px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: #aaaaaa; margin: 6px 0 0; font-size: 13px; }
    .body { padding: 36px 40px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1a1a1a; line-height: 1.5; }
    .divider { border: none; border-top: 1px solid #eeeeee; margin: 24px 0; }
    .message-box { background: #f9f9f9; border-left: 3px solid #c9a96e; padding: 16px 20px; border-radius: 4px; }
    .footer { background: #f4f4f4; padding: 20px 40px; font-size: 12px; color: #aaaaaa; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Quote Request</h1>
      <p>Submitted via Amazing Tile Corp website</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Full Name</div>
        <div class="value">${escapeHtml(name)}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${escapeHtml(email)}" style="color:#c9a96e;">${escapeHtml(email)}</a></div>
      </div>
      <div class="field">
        <div class="label">Phone</div>
        <div class="value">${escapeHtml(phone)}</div>
      </div>
      <div class="field">
        <div class="label">Project Location</div>
        <div class="value">${escapeHtml(location || 'Not provided')}</div>
      </div>
      <div class="field">
        <div class="label">Service Requested</div>
        <div class="value">${escapeHtml(serviceLabel)}</div>
      </div>
      <hr class="divider">
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">
          <div class="value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    </div>
    <div class="footer">
      Amazing Tile Corp — amazingtilecorp@icloud.com
    </div>
  </div>
</body>
</html>`;

    // ── DEBUG: log exact payload ─────────────────────────────────────────────
    const emailPayload = {
        from: 'contato@mail.amazingtilecorp.com',
        to: ['amazingtilecorp@icloud.com'],
        cc: ['igor@ahiperbole.com.br'],
        bcc: ['solimwebstudio@gmail.com'],
        reply_to: email,
        subject: 'New quote request from website',
        html: htmlBody,
    };
    console.log('[DEBUG] Sending email to real recipients...');

    try {
        const { data, error } = await resend.emails.send(emailPayload);

        console.log('[DEBUG] Resend raw data:', JSON.stringify(data, null, 2));
        console.log('[DEBUG] Resend raw error:', JSON.stringify(error, null, 2));

        if (error) {
            console.error('[ERROR] Resend rejected the request:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Resend rejected the request.',
                resend_error: error,   // full error visible in browser response during debug
            });
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (err) {
        console.error('[ERROR] Unexpected server error:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Server error. Please try again later.',
            stack: err.stack,   // visible in browser during debug
        });
    }
});

/* =============================================
   Helper: Escape HTML special characters
   ============================================= */
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[ERROR] Port ${PORT} is already in use.`);
        console.error(`Run this to fix it:  lsof -ti :${PORT} | xargs kill -9`);
        process.exit(1);
    } else {
        throw err;
    }
});
