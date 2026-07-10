const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact  – send consultation request to business@zaynlevi.com
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  try {
    const hasConfig =
      process.env.EMAIL_USER &&
      process.env.EMAIL_USER !== 'your_email@gmail.com' &&
      process.env.EMAIL_PASSWORD &&
      process.env.EMAIL_PASSWORD !== 'your_app_password';

    let transporter;
    if (hasConfig) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      // Ethereal test account fallback
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const mailOptions = {
      from: `"School OS Inquiry" <${process.env.EMAIL_USER || 'noreply@schoolos.com'}>`,
      to: 'business@zaynlevi.com',
      replyTo: email,
      subject: subject || `New Consultation Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 1.5rem;">📋 New Consultation Request</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0;">School Operating System</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: 700; color: #374151; width: 130px;">👤 Name</td>
                <td style="padding: 10px; color: #1f2937;">${name}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding: 10px; font-weight: 700; color: #374151;">📧 Email</td>
                <td style="padding: 10px; color: #1f2937;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: 700; color: #374151;">📞 Phone</td>
                <td style="padding: 10px; color: #1f2937;">${phone || 'Not provided'}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding: 10px; font-weight: 700; color: #374151;">📌 Subject</td>
                <td style="padding: 10px; color: #1f2937;">${subject || 'General Inquiry'}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0 0 8px; font-weight: 700; color: #374151;">💬 Message</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div style="padding: 16px; background: #f3f4f6; text-align: center; font-size: 0.8rem; color: #6b7280;">
            This inquiry was submitted via the School OS contact form at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact inquiry sent:', info.messageId);
    if (!hasConfig) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    res.json({ success: true, message: 'Inquiry sent successfully.' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

module.exports = router;
