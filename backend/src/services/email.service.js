// src/services/email.service.js
const nodemailer = require('nodemailer');

// ─── Transporter (lazy-init to avoid startup errors if env vars missing) ───────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
};

// ─── HTML email template ───────────────────────────────────────────────────────
const buildReminderHTML = ({ medicineName, dosage, notes, time, patientName }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Medicine Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 18px;margin-bottom:12px;">
                    <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:1px;">Rx CareBridge</span>
                  </div>
                  <div style="color:#93c5fd;font-size:12px;font-weight:500;">Smart Digital Prescription Platform</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Pill icon row -->
        <tr>
          <td style="background:#fff;padding:0;text-align:center;">
            <div style="margin-top:-1px;padding:28px 32px 0;">
              <div style="width:64px;height:64px;background:#eff6ff;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:32px;">💊</span>
              </div>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1e293b;">
                Medicine Reminder
              </h1>
              <p style="margin:0;font-size:14px;color:#64748b;">
                Hi <strong style="color:#1e3a8a;">${patientName || 'there'}</strong>, it's time for your medicine!
              </p>
            </div>
          </td>
        </tr>

        <!-- Time badge -->
        <tr>
          <td style="background:#fff;padding:20px 32px 0;text-align:center;">
            <div style="display:inline-block;background:#eff6ff;border:2px solid #bfdbfe;border-radius:50px;padding:10px 28px;">
              <span style="font-size:28px;font-weight:900;color:#1d4ed8;letter-spacing:2px;">⏰ ${time}</span>
            </div>
          </td>
        </tr>

        <!-- Medicine card -->
        <tr>
          <td style="background:#fff;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1.5px solid #bbf7d0;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    Medicine Name
                  </div>
                  <div style="font-size:20px;font-weight:800;color:#14532d;margin-bottom:${dosage ? '14px' : '0'};">
                    ${medicineName}
                  </div>
                  ${dosage ? `
                  <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    Dosage
                  </div>
                  <div style="font-size:15px;font-weight:600;color:#166534;">
                    ${dosage}
                  </div>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${notes ? `
        <!-- Notes -->
        <tr>
          <td style="background:#fff;padding:0 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;">
              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-size:10px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">
                    📋 Doctor's Note
                  </div>
                  <div style="font-size:13px;color:#78350f;line-height:1.6;">
                    ${notes}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- Tips row -->
        <tr>
          <td style="background:#fff;padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" align="center" style="padding:8px;">
                  <div style="font-size:20px;">💧</div>
                  <div style="font-size:11px;color:#64748b;margin-top:4px;">Take with water</div>
                </td>
                <td width="33%" align="center" style="padding:8px;">
                  <div style="font-size:20px;">🍽️</div>
                  <div style="font-size:11px;color:#64748b;margin-top:4px;">Check meal timing</div>
                </td>
                <td width="33%" align="center" style="padding:8px;">
                  <div style="font-size:20px;">📅</div>
                  <div style="font-size:11px;color:#64748b;margin-top:4px;">Stay consistent</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e3a8a;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:#93c5fd;font-size:12px;">
              This is an automated reminder from <strong style="color:#fff;">CareBridge</strong>.
            </p>
            <p style="margin:0;color:#60a5fa;font-size:11px;">
              To manage your reminders, log in at <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color:#93c5fd;">CareBridge Platform</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Send medicine reminder email ──────────────────────────────────────────────
/**
 * @param {Object} opts
 * @param {string} opts.to          - recipient email
 * @param {string} opts.patientName - patient's display name
 * @param {string} opts.medicineName
 * @param {string} opts.dosage      - e.g. "500mg"
 * @param {string} opts.notes       - optional doctor note
 * @param {string} opts.time        - e.g. "08:00 AM"
 */
const sendReminderEmail = async ({ to, patientName, medicineName, dosage, notes, time }) => {
  const transporter = getTransporter();

  const formattedTime = (() => {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${String(hr).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
  })();

  const info = await transporter.sendMail({
    from:    `"CareBridge 💊" <${process.env.SMTP_USER}>`,
    to,
    subject: `⏰ Medicine Reminder: ${medicineName} at ${formattedTime}`,
    html:    buildReminderHTML({ medicineName, dosage, notes, time: formattedTime, patientName }),
    text:    `Hi ${patientName}, it's time to take your medicine:\n\nMedicine: ${medicineName}\nDosage: ${dosage || 'As prescribed'}\nTime: ${formattedTime}\n\n${notes ? `Note: ${notes}` : ''}`,
  });

  return info;
};

// ─── Send password reset OTP email ──────────────────────────────────────────────
const sendPasswordResetOtpEmail = async (to, otp) => {
  const transporter = getTransporter();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="margin:0;padding:0;background:#f0f9ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;margin-top:32px;">
      <h2 style="color:#1e293b;margin-bottom:16px;text-align:center;">Password Reset Request</h2>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin-bottom:24px;text-align:center;">
        We received a request to reset your CareBridge password. Enter the following 6-digit code to continue:
      </p>
      <div style="background:#eff6ff;padding:20px;border-radius:12px;text-align:center;margin-bottom:24px;">
        <span style="font-size:32px;font-weight:900;letter-spacing:6px;color:#1d4ed8;">${otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center;">
        This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.
      </p>
    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from:    `"CareBridge Security 🔒" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your CareBridge Password Reset Code: ${otp}`,
    html,
    text:    `Your CareBridge password reset code is: ${otp}\n\nThis code expires in 10 minutes.`,
  });
};

/**
 * Verify transporter connection (for startup checks)
 */
const verifyEmailConnection = async () => {
  const transporter = getTransporter();
  return transporter.verify();
};

module.exports = { sendReminderEmail, sendPasswordResetOtpEmail, verifyEmailConnection };
