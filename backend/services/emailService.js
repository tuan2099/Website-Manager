import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = async (email, token, userName) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Hello ${userName}</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
};

export const sendWelcomeEmail = async (email, userName) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Website Manager',
    html: `
      <h1>Welcome ${userName}!</h1>
      <p>Thank you for joining Website Manager.</p>
      <p>You can now log in to your account at ${process.env.FRONTEND_URL}</p>
    `
  });
};
