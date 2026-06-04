import { BadRequestException } from "@nestjs/common";
import { BrandInviteStatus, UserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { BrandInviteService } from "./brand-invite.service";
import { hashRefreshToken } from "./otp.service";

describe("BrandInviteService", () => {
  const email = { sendBrandInvite: vi.fn() };
  const auth = {
    createSessionForUser: vi.fn().mockResolvedValue({
      tokens: { accessToken: "a", refreshToken: "r", expiresIn: "15m" },
      user: { id: "u1", role: "brand", email: "new@brand.in" },
    }),
  };
  const config = {
    get: vi.fn((key: string) => (key === "BRAND_INVITE_TTL" ? "7d" : "")),
  };

  it("marks preview invalid when token unknown", async () => {
    const prisma = {
      brandInvite: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const service = new BrandInviteService(
      prisma as never,
      config as never,
      email as never,
      auth as never,
    );
    const result = await service.preview("unknown");
    expect(result.valid).toBe(false);
  });

  it("accepts invite for new brand user", async () => {
    const token = "test-invite-token-32chars-minimum!!";
    const tokenHash = hashRefreshToken(token);
    const invite = {
      id: "inv1",
      email: "new@brand.in",
      status: BrandInviteStatus.pending,
      expiresAt: new Date(Date.now() + 60_000),
      brandProfileId: "bp1",
      agency: { companyName: "Agency" },
      brandProfile: { companyName: "Brand", userId: null },
    };

    const prisma = {
      brandInvite: {
        findUnique: vi.fn().mockResolvedValue(invite),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "u1" }),
      },
      brandProfile: {
        findUnique: vi.fn().mockResolvedValue(invite.brandProfile),
        update: vi.fn(),
      },
      brandMembership: { create: vi.fn() },
      wallet: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn() },
      $transaction: vi.fn().mockResolvedValue([]),
    };

    const service = new BrandInviteService(
      prisma as never,
      config as never,
      email as never,
      auth as never,
    );

    const result = await service.accept({
      token,
      password: "password123",
    });
    expect(result.accepted).toBe(true);
    expect(auth.createSessionForUser).toHaveBeenCalledWith("u1");
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: UserRole.brand, email: "new@brand.in" }),
      }),
    );
    expect(tokenHash).toBeTruthy();
  });

  it("rejects accept without password for new user", async () => {
    const invite = {
      id: "inv1",
      email: "new@brand.in",
      status: BrandInviteStatus.pending,
      expiresAt: new Date(Date.now() + 60_000),
      brandProfileId: "bp1",
      agency: { companyName: "Agency" },
      brandProfile: { companyName: "Brand" },
    };
    const prisma = {
      brandInvite: { findUnique: vi.fn().mockResolvedValue(invite) },
      user: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const service = new BrandInviteService(
      prisma as never,
      config as never,
      email as never,
      auth as never,
    );
    await expect(service.accept({ token: "t".repeat(40) })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
