import nodemailer from "nodemailer";
import { env } from "../config/env";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
      if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
        throw new Error("SMTP not configured");
      }
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        secure: false,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
    }
    return this.transporter;
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.getTransporter().sendMail({
        from: env.SMTP_FROM ?? env.SMTP_USER,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("[Email] Failed to send:", error);
    }
  }

  async sendNotificationEmail(to: string, title: string, body: string, actionUrl?: string) {
    const actionLink = actionUrl ? `<p><a href="${actionUrl}">View notification</a></p>` : "";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>${body}</p>
        ${actionLink}
        <hr/>
        <p style="color: #666; font-size: 12px;">Edurus - Student Marketplace</p>
      </div>
    `;
    await this.sendEmail(to, title, html);
  }
}

export const emailService = new EmailService();
