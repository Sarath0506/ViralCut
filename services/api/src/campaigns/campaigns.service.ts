import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CampaignStatus } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateCampaignDto, UpdateCampaignDto } from "./dto/campaign.dto";

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getBrandProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Brand profile required",
      });
    }
    return profile.id;
  }

  async listLiveForCreators() {
    const campaigns = await this.prisma.campaign.findMany({
      where: { status: CampaignStatus.live },
      orderBy: { createdAt: "desc" },
    });
    return campaigns.map((c) => this.formatCampaign(c));
  }

  async getLiveForCreator(campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, status: CampaignStatus.live },
    });
    if (!campaign) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }
    return this.formatCampaign(campaign);
  }

  async listForBrand(userId: string) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const campaigns = await this.prisma.campaign.findMany({
      where: { brandProfileId },
      orderBy: { createdAt: "desc" },
    });

    return campaigns.map((c) => this.formatCampaign(c));
  }

  async getForBrand(userId: string, campaignId: string) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, brandProfileId },
      include: {
        _count: { select: { submissions: true } },
      },
    });
    if (!campaign) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }
    return {
      ...this.formatCampaign(campaign),
      submissionCount: campaign._count.submissions,
    };
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const campaign = await this.prisma.campaign.create({
      data: {
        brandProfileId,
        title: dto.title,
        category: dto.category,
        platform: dto.platform ?? "instagram_reels",
        status: CampaignStatus.live,
        brief: dto.brief,
        productUrl: dto.productUrl,
        ratePer1kPaise: dto.ratePer1kPaise,
        maxPayoutPaise: dto.maxPayoutPaise,
        budgetPaise: dto.budgetPaise,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });
    return this.formatCampaign(campaign);
  }

  async update(userId: string, campaignId: string, dto: UpdateCampaignDto) {
    const brandProfileId = await this.getBrandProfileId(userId);
    const existing = await this.prisma.campaign.findFirst({
      where: { id: campaignId, brandProfileId },
    });
    if (!existing) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Campaign not found",
      });
    }

    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: dto.status,
        title: dto.title,
        brief: dto.brief,
      },
    });
    return this.formatCampaign(campaign);
  }

  private formatCampaign(c: {
    id: string;
    title: string;
    category: string | null;
    platform: string;
    status: CampaignStatus;
    brief: string;
    productUrl: string | null;
    ratePer1kPaise: number;
    maxPayoutPaise: number;
    budgetPaise: number;
    budgetUsedPaise: number;
    endsAt: Date | null;
    createdAt: Date;
  }) {
    const poolPercent =
      c.budgetPaise > 0
        ? Math.round((c.budgetUsedPaise / c.budgetPaise) * 100)
        : 0;

    return {
      id: c.id,
      title: c.title,
      category: c.category,
      platform: c.platform,
      status: c.status,
      brief: c.brief,
      productUrl: c.productUrl,
      ratePer1kPaise: c.ratePer1kPaise,
      ratePer1kDisplay: `₹${c.ratePer1kPaise / 100} / 1K views`,
      maxPayoutPaise: c.maxPayoutPaise,
      budgetPaise: c.budgetPaise,
      budgetUsedPaise: c.budgetUsedPaise,
      poolPercent,
      poolRemainingPercent: 100 - poolPercent,
      endsAt: c.endsAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    };
  }
}
