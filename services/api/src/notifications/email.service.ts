import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

import type { Env } from "../config/env";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get("SMTP_HOST") &&
        this.config.get("SMTP_USER") &&
        this.config.get("SMTP_PASS") &&
        this.config.get("EMAIL_FROM"),
    );
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const from = this.config.get("EMAIL_FROM");
    const baseUrl = this.config.get("BRAND_WEB_URL", { infer: true }).replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const subject = "Reset your ViralCut brand password";
    const text = `Use this link to reset your password (valid 1 hour): ${resetUrl}`;

    if (!this.isConfigured()) {
      if (this.config.get("NODE_ENV") !== "production") {
        this.logger.warn(`SMTP not configured — reset for ${email}: ${text}`);
      }
      return;
    }

    const transport = nodemailer.createTransport({
      host: this.config.get("SMTP_HOST"),
      port: this.config.get("SMTP_PORT"),
      secure: this.config.get("SMTP_PORT") === 465,
      auth: {
        user: this.config.get("SMTP_USER"),
        pass: this.config.get("SMTP_PASS"),
      },
    });

    await transport.sendMail({ from, to: email, subject, text });
  }
}
