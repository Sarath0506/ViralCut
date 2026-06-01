import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

import { formatDurationLabel } from "../common/parse-duration";
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
    const baseUrl = this.config
      .get("BRAND_WEB_URL", { infer: true })
      .replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const ttlLabel = formatDurationLabel(
      this.config.get("PASSWORD_RESET_TTL", { infer: true }),
    );
    const subject = "Reset your ViralCut brand password";
    const text = `Use this link to reset your password (valid ${ttlLabel}): ${resetUrl}`;

    if (!this.isConfigured()) {
      if (this.config.get("NODE_ENV") !== "production") {
        this.logger.warn(
          `[dev] SMTP not configured — password reset for ${email}\n  BRAND_WEB_URL=${baseUrl}\n  Link: ${resetUrl}`,
        );
      } else {
        this.logger.error(
          `SMTP not configured in production — password reset not sent to ${email}`,
        );
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
    this.logger.log(`Password reset email sent to ${email}`);
  }
}
