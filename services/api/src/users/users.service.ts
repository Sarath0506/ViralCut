import { NotFoundException, Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: true,
        brandProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      username: user.username,
      kycStatus: user.kycStatus,
      tier: user.creatorProfile?.tier ?? null,
      companyName: user.brandProfile?.companyName ?? null,
    };
  }
}
