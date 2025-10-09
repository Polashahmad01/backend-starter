import { Resend } from "resend";
import { IEmailServiceResend } from "../types";
import { appConfig } from "../config";

export class ResendEmailService implements IEmailServiceResend {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(appConfig.resendEmailProvider.apiKey);
  }

  private async sendEmail(email: string, subject: string, html: string) {
    await this.resend.emails.send({
      from: appConfig.resendEmailProvider.emailFrom,
      to: email,
      subject,
      html,
    });
  }

  async sendVerificationEmail(email: string, token: string, fullName: string) {
    const verificationUrl = `${appConfig.application.frontendUrl}/verify-email?token=${token}`;
    await this.sendEmail(email, "Verify Your Email", this.getVerificationEmailTemplate(fullName, verificationUrl));
  }

  async sendPasswordResetEmail(email: string, token: string, fullName: string) {
    const resetUrl = `${appConfig.application.frontendUrl}/reset-password?token=${token}`;
    await this.sendEmail(email, "Reset Your Password", this.getPasswordResetEmailTemplate(fullName, resetUrl));
  }

  /**
   * Email verification template
   */
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

  /**
   * Password reset email template
   */
  private getPasswordResetEmailTemplate(fullName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #e74c3c; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
          
          <p>Hi ${fullName},</p>
          
          <p>We received a request to reset your password for your ${appConfig.application.appName} account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7f8c8d;">${resetUrl}</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #7f8c8d;">
            This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
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

export const resendEmailService = new ResendEmailService();
