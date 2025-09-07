import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,    
      debug: true,     
    });

    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(' Email sent successfully!');
  } catch (error) {
    console.error(' Error sending email:', error);
  }
};

export default sendEmail;
