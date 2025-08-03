import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  try {
    // 1. Create a Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // From .env
        pass: process.env.EMAIL_PASS, // App-specific password
      },
    });

    // 2. Define Email Options
    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

export default sendEmail;
