const nodemailer = require('nodemailer');

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
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
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
    <p>This is a reminder that fees for <strong>${studentName}</strong> of amount <strong>₹${amount}</strong> are due on <strong>${dueDate}</strong></p>
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
