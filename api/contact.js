require('dotenv').config();
const { Resend } = require('resend');

// Export functionality for Vercel Serverless Function
module.exports = async (req, res) => {
    // 1. Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { 'full-name': name, email, phone, location, service, message } = req.body;

    // Basic validation
    if (!name || !email || !phone || !service || !message) {
        return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        return res.status(500).json({ success: false, error: 'Internal Server Error: API Key missing' });
    }

    const resend = new Resend(RESEND_API_KEY);

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
          <div class="value">${escapeHtml(message).replace(/\\n/g, '<br>')}</div>
        </div>
      </div>
    </div>
    <div class="footer">
      Amazing Tile Corp — amazingtilecorp@icloud.com
    </div>
  </div>
</body>
</html>`;

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const emailPayload = {
        from: 'contato@mail.amazingtilecorp.com',
        to: ['amazingtilecorp@icloud.com'],
        cc: ['igor@ahiperbole.com.br'],
        bcc: ['solimwebstudio@gmail.com'],
        reply_to: email,
        subject: 'New quote request from website',
        html: htmlBody,
    };

    try {
        const { data, error } = await resend.emails.send(emailPayload);
        if (error) {
            console.error('[ERROR] Resend rejection:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
        return res.status(200).json({ success: true, id: data.id });
    } catch (err) {
        console.error('[ERROR] Unexpected error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
