import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

import type { Env } from "../config/env";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../notifications/email.service";
import type { AuthJwtPayload, AuthTokens } from "./auth.types";
import { hashRefreshToken, OtpService } from "./otp.service";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
import type { BrandLoginDto, BrandRegisterDto } from "./dto/brand-auth.dto";
import type { CreatorOtpVerifyDto } from "./dto/creator-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly otp: OtpService,
    private readonly email: EmailService,
  ) {}

  async registerBrand(dto: BrandRegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        role: UserRole.brand,
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName ?? dto.companyName,
        brandProfile: { create: { companyName: dto.companyName } },
      },
    });

    return this.issueTokens(user);
  }

  async loginBrand(dto: BrandLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user?.passwordHash || user.role !== UserRole.brand) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    return this.issueTokens(user);
  }

  async forgotBrandPassword(email: string): Promise<{ sent: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || user.role !== UserRole.brand) {
      return { sent: true };
    }

    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = hashRefreshToken(resetToken);

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    await this.email.sendPasswordReset(user.email!, resetToken);
    return { sent: true };
  }

  async resetBrandPassword(
    token: string,
    password: string,
  ): Promise<{ reset: boolean }> {
    const tokenHash = hashRefreshToken(token);
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !stored ||
      stored.usedAt ||
      stored.expiresAt < new Date() ||
      stored.user.role !== UserRole.brand
    ) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Invalid or expired reset link",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { reset: true };
  }

  async verifyCreatorOtp(dto: CreatorOtpVerifyDto) {
    await this.otp.verifyOtp(dto.phone, dto.code);

    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: { wallet: true },
    });

    if (!user) {
      if (!dto.displayName) {
        throw new BadRequestException({
          code: "VALIDATION_ERROR",
          message: "displayName required for new creators",
        });
      }
      user = await this.prisma.user.create({
        data: {
          role: UserRole.creator,
          phone: dto.phone,
          displayName: dto.displayName,
          username: dto.username,
          creatorProfile: { create: {} },
          wallet: { create: {} },
        },
        include: { wallet: true },
      });
    } else if (user.role !== UserRole.creator) {
      throw new ConflictException({
        code: "CONFLICT",
        message: "Phone registered with another account type",
      });
    } else if (!user.wallet) {
      await this.prisma.wallet.create({ data: { userId: user.id } });
      user = await this.prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { wallet: true },
      });
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      !stored.user
    ) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      });
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(user: {
    id: string;
    role: UserRole;
    email: string | null;
    phone: string | null;
    displayName: string | null;
  }) {
    const payload: AuthJwtPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    };

    const accessTtl = this.config.get("JWT_ACCESS_TTL", { infer: true });
    const refreshTtl = this.config.get("JWT_REFRESH_TTL", { infer: true });

    const accessToken = await this.jwt.signAsync(
      { ...payload },
      { expiresIn: accessTtl as `${number}${"s" | "m" | "h" | "d"}` },
    );

    const refreshToken = randomBytes(48).toString("base64url");
    const refreshDays = parseRefreshDays(refreshTtl);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      },
    });

    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    };

    return {
      tokens,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
      },
    };
  }
}

function parseRefreshDays(ttl: string): number {
  if (ttl.endsWith("d")) {
    return Number.parseInt(ttl.slice(0, -1), 10) || 7;
  }
  return 7;
}
