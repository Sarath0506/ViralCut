import { Injectable, NotFoundException } from "@nestjs/common";
import { AgencyBrandStatus, UserRole } from "@prisma/client";

import { BrandAccessService } from "../access/brand-access.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly brandAccess: BrandAccessService,
  ) {}

  async getLinkedAgency(userId: string, role: UserRole) {
    const brandIds = await this.brandAccess.listAccessibleBrandProfileIds(
      userId,
      role,
    );
    if (brandIds.length === 0) {
      return { agency: null };
    }

    const link = await this.prisma.agencyBrand.findFirst({
      where: {
        brandProfileId: brandIds[0],
        status: AgencyBrandStatus.active,
      },
      include: { agency: true },
    });

    if (!link) {
      return { agency: null };
    }

    return {
      agency: {
        id: link.agency.id,
        companyName: link.agency.companyName,
        linkedAt: link.createdAt.toISOString(),
      },
    };
  }

  async revokeAgency(userId: string, role: UserRole) {
    const brandIds = await this.brandAccess.listAccessibleBrandProfileIds(
      userId,
      role,
    );
    if (brandIds.length === 0) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "No brand workspace found",
      });
    }

    const brandProfileId = brandIds[0]!;
    const link = await this.prisma.agencyBrand.findFirst({
      where: {
        brandProfileId,
        status: AgencyBrandStatus.active,
      },
    });

    if (!link) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "No agency linked to this brand",
      });
    }

    await this.prisma.agencyBrand.update({
      where: { id: link.id },
      data: { status: AgencyBrandStatus.revoked },
    });

    return { revoked: true };
  }
}
