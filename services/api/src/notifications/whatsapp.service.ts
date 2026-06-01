import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../config/env";

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get("WHATSAPP_ACCESS_TOKEN") &&
        this.config.get("WHATSAPP_PHONE_NUMBER_ID") &&
        this.config.get("WHATSAPP_OTP_TEMPLATE_NAME"),
    );
  }

  private shouldLogOtpInConsole(): boolean {
    return (
      this.config.get("NODE_ENV") !== "production" ||
      this.config.get("OTP_DEV_LOG") === true
    );
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    if (!this.isConfigured()) {
      if (this.shouldLogOtpInConsole()) {
        this.logger.warn(
          `WhatsApp not configured — OTP for ${phone}: ${code}`,
        );
      }
      return;
    }

    const version = this.config.get("WHATSAPP_API_VERSION");
    const phoneNumberId = this.config.get("WHATSAPP_PHONE_NUMBER_ID");
    const token = this.config.get("WHATSAPP_ACCESS_TOKEN");
    const template = this.config.get("WHATSAPP_OTP_TEMPLATE_NAME");

    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: phone.replace("+", ""),
      type: "template",
      template: {
        name: template,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`WhatsApp OTP failed: ${response.status} ${text}`);
      throw new Error("Failed to send OTP via WhatsApp");
    }
  }
}
