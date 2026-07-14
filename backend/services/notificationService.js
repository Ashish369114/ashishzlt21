const nodemailer = require('nodemailer');
const { formatCurrency } = require('../utils/currencyFormatter');

// Configure email transporter (use your email service)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    let activeTransporter = transporter;
    const hasConfig = process.env.EMAIL_USER && 
                      process.env.EMAIL_USER !== 'your_email@gmail.com' && 
                      process.env.EMAIL_USER !== 'your_email' &&
                      process.env.EMAIL_PASSWORD && 
                      process.env.EMAIL_PASSWORD !== 'your_app_password' &&
                      process.env.EMAIL_PASSWORD !== 'your_password';

    if (!hasConfig) {
      console.log('EMAIL_USER/EMAIL_PASSWORD not configured or default. Generating temporary Ethereal test email account on-the-fly...');
      const testAccount = await nodemailer.createTestAccount();
      activeTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await activeTransporter.sendMail({
        from: '"EduManage Onboarding" <no-reply@edumanage.com>',
        to,
        subject,
        html,
      });

      console.log(`Test email sent successfully to ${to}`);
      console.log(`Preview Test Email URL: ${nodemailer.getTestMessageUrl(info)}`);
      return;
    }

    try {
      await activeTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log(`Real email sent successfully to ${to}`);
    } catch (realMailError) {
      console.error('Failed to send real email (falling back to Ethereal):', realMailError.message);
      const testAccount = await nodemailer.createTestAccount();
      const fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      const info = await fallbackTransporter.sendMail({
        from: '"EduManage Onboarding (Fallback)" <no-reply@edumanage.com>',
        to,
        subject,
        html,
      });
      console.log(`Fallback test email sent successfully to ${to}`);
      console.log(`Preview Test Email URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('Error in sendEmail wrapper:', error);
  }
};

const sendAdmissionNotification = async (parentEmail, studentName, status) => {
  const html = `
    <h2>Admission Status Update</h2>
    <p>Dear Parent,</p>
    <p>The admission status for <strong>${studentName}</strong> is: <strong>${status.toUpperCase()}</strong></p>
    <p>Please log in to your account for more details.</p>
  `;
  await sendEmail(parentEmail, `Admission ${status.toUpperCase()}`, html);
};

const sendFeeReminder = async (parentEmail, studentName, amount, dueDate) => {
  const html = `
    <h2>Fee Payment Reminder</h2>
    <p>Dear Parent,</p>
    <p>This is a reminder that fees for <strong>${studentName}</strong> of amount <strong>${formatCurrency(amount)}</strong> are due on <strong>${dueDate}</strong></p>
    <p>Please make the payment as soon as possible.</p>
  `;
  await sendEmail(parentEmail, 'Fee Payment Reminder', html);
};

const sendHomeworkNotification = async (studentEmail, subject, dueDate) => {
  const html = `
    <h2>New Homework Assigned</h2>
    <p>Dear Student,</p>
    <p>You have been assigned homework in <strong>${subject}</strong></p>
    <p>Due Date: <strong>${dueDate}</strong></p>
    <p>Please submit on time.</p>
  `;
  await sendEmail(studentEmail, 'New Homework Assigned', html);
};

const sendExamScheduleNotification = async (studentEmail, examName, date, time, subject) => {
  const html = `
    <h2>Exam Schedule</h2>
    <p>Dear Student,</p>
    <p>Your exam schedule is as follows:</p>
    <p><strong>Exam:</strong> ${examName}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
    <p>Please be prepared and arrive on time.</p>
  `;
  await sendEmail(studentEmail, `Exam Schedule - ${subject}`, html);
};

const sendTransportAlertNotification = async (parentEmail, studentName, message) => {
  const html = `
    <h2>Transport Alert</h2>
    <p>Dear Parent,</p>
    <p>Alert regarding <strong>${studentName}</strong>: ${message}</p>
    <p>Please check the transport tracking for more details.</p>
  `;
  await sendEmail(parentEmail, 'Transport Alert', html);
};

const sendLibraryNotification = async (studentEmail, bookTitle, dueDate) => {
  const html = `
    <h2>Library Due Date Reminder</h2>
    <p>Dear Student,</p>
    <p>Please return the book <strong>${bookTitle}</strong> by <strong>${dueDate}</strong></p>
    <p>Late returns may incur fine charges.</p>
  `;
  await sendEmail(studentEmail, 'Library Book Due Date Reminder', html);
};

const sendMarkNotification = async (studentEmail, subject, marks, total) => {
  const html = `
    <h2>Marks Notification</h2>
    <p>Dear Student,</p>
    <p>Your marks have been published in <strong>${subject}</strong></p>
    <p><strong>Marks Obtained:</strong> ${marks}/${total}</p>
    <p>Log in to your account to view detailed results.</p>
  `;
  await sendEmail(studentEmail, `Marks Published - ${subject}`, html);
};

module.exports = {
  sendEmail,
  sendAdmissionNotification,
  sendFeeReminder,
  sendHomeworkNotification,
  sendExamScheduleNotification,
  sendTransportAlertNotification,
  sendLibraryNotification,
  sendMarkNotification,
};
