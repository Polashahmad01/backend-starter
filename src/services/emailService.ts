import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import colors from "colors";
import { IEmailService } from "../types";
import { appConfig } from "../config";

export class EmailService implements IEmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: appConfig.email.service,
      auth: {
        user: appConfig.email.user,
        pass: appConfig.email.password,
      }
    });
  }

  async sendVerificationEmail(email: string, token: string, fullName: string) {
    const verificationUrl = `${appConfig.application.frontendUrl}/verify-email?token=${token}`;
    const mailOptions: SendMailOptions = {
      from: appConfig.email.from,
      to: email,
      subject: `Welcome to ${appConfig.application.appName} - Verify Your Email`,
      html: this.getVerificationEmailTemplate(fullName, verificationUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(colors.bgRed.white.bold("Failed to send verification email: "), error);
      throw new Error("Failed to send verification email");
    }
  }

  // Email verification template
  private getVerificationEmailTemplate(firstName: string, verificationUrl: string) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Welcome to ${appConfig.application.appName}!</h1>
            
            <p>Hi ${firstName},</p>
            
            <p>Thank you for signing up! To complete your registration and start using ${appConfig.application.appName}, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7f8c8d;">${verificationUrl}</p>
            
            <p style="margin-top: 30px; font-size: 14px; color: #7f8c8d;">
              This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #95a5a6; text-align: center;">
              © ${new Date().getFullYear()} ${appConfig.application.appName}. All rights reserved.
            </p>
          </div>
        </body>
      </html>
      `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
