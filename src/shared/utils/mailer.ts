import { globalLogger as Logger } from '@/shared/utils/logger';
import nodemailer from 'nodemailer';

export const sendAccountActiveEmail = async (email: string, name: string) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      Logger.error('SMTP configuration is missing', 'shared/utils/mailer.ts - sendAccountActiveEmail');
      return false;
    }

    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; line-height: 1.6;">
        ${
          process.env.LOGO
            ? `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.LOGO}" alt="Badalin logo" style="max-width: 250px; height: auto;">
        </div>
        `
            : ''
        }

        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f57d28; margin: 0; font-size: 24px;">Welcome to Badalin Ecosystem</h1>
        </div>
        
        <div style="background-color: #feedd6; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #f57d28;">
          <h2 style="margin-top: 0; color: #f57d28; font-size: 20px;">Account Activated!</h2>
          <p style="margin-bottom: 10px;">Dear <strong>${name}</strong>,</p>
          <p style="margin: 0; color: #3c5a5e;">Congratulations! Your account in the <strong>Badalin Ecosystem</strong> has been successfully activated and is now ready for use.</p>
        </div>

        <p style="margin-bottom: 10px;">You can now log in to the platform through the following link:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://badalin.com/auth/login" 
             style="background-color: #f57d28; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(245, 125, 40, 0.2);">
            Login to Your Account
          </a>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Note:</strong> If you did not register for this account, please ignore this email or contact our support.</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
          <p style="margin: 5px 0;">This is an automated notification from Badalin Ecosystem.</p>
          <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Badalin</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Badalin | Visa Tracker" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Badalin Ecosystem - Account Activated',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    Logger.info('Account activation email sent successfully', `Email: ${email}`);

    return true;
  } catch (error: any) {
    Logger.error(
      `Failed to send account activation email to ${email}`,
      error.message,
      'shared/utils/mailer.ts - sendAccountActiveEmail',
    );
    return false;
  }
};

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      Logger.error('SMTP configuration is missing', 'shared/utils/mailer.ts - sendResetPasswordEmail');
      return false;
    }

    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; line-height: 1.6;">
        ${
          process.env.LOGO
            ? `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.LOGO}" alt="Badalin logo" style="max-width: 250px; height: auto;">
        </div>
        `
            : ''
        }

        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f57d28; margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        
        <div style="background-color: #feedd6; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #f57d28;">
          <h2 style="margin-top: 0; color: #f57d28; font-size: 20px;">Forgot Your Password?</h2>
          <p style="margin-bottom: 10px;">We received a request to reset your password for the <strong>Badalin Ecosystem</strong>.</p>
          <p style="margin: 0; color: #3c5a5e;">This password reset link will expire in <strong>10 minutes</strong>.</p>
        </div>

        <p style="margin-bottom: 10px;">Click the button below to choose a new password:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetLink}" 
             style="background-color: #f57d28; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(245, 125, 40, 0.2);">
            Reset Password
          </a>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Note:</strong> If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
          <p style="margin: 5px 0;">This is an automated notification from Badalin Ecosystem.</p>
          <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Badalin</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Badalin | Visa Tracker" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - Badalin Ecosystem',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    Logger.info('Password reset email sent successfully', `Email: ${email}`);

    return true;
  } catch (error: any) {
    Logger.error(
      `Failed to send password reset email to ${email}`,
      error.message,
      'shared/utils/mailer.ts - sendResetPasswordEmail',
    );
    return false;
  }
};
