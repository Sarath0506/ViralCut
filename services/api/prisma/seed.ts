import { PrismaClient, UserRole, CampaignStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const brandPasswordHash = await bcrypt.hash("DemoBrand123!", 12);

  const brandUser = await prisma.user.upsert({
    where: { email: "brand@demo.viralcut.in" },
    update: { passwordHash: brandPasswordHash },
    create: {
      role: UserRole.brand,
      email: "brand@demo.viralcut.in",
      passwordHash: brandPasswordHash,
      displayName: "boAt Demo",
      brandProfile: {
        create: { companyName: "boAt Lifestyle" },
      },
    },
    include: { brandProfile: true },
  });

  if (!brandUser.brandProfile) {
    throw new Error("Brand profile missing after seed");
  }

  await prisma.campaign.upsert({
    where: { id: "seed-campaign-boat" },
    update: {},
    create: {
      id: "seed-campaign-boat",
      brandProfileId: brandUser.brandProfile.id,
      title: "boAt Airdopes 800 — Instagram Reels",
      category: "Electronics",
      platform: "instagram_reels",
      status: CampaignStatus.live,
      brief:
        "Create high-energy lifestyle Reels featuring Airdopes 800. Natural product use, trending audio.",
      productUrl: "https://www.boat-lifestyle.com",
      ratePer1kPaise: 5000,
      maxPayoutPaise: 5_000_000,
      budgetPaise: 10_000_000,
      budgetUsedPaise: 8_200_000,
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  const demoCreators = [
    {
      phone: "+919876543210",
      email: "pragnatej@demo.viralcut.in",
      displayName: "Pragnatej",
      username: "pragnatej",
      fixedOtpCode: "000000",
    },
    {
      phone: "+916281068402",
      email: "creator@demo.viralcut.in",
      displayName: "Demo Creator",
      username: "democreator",
      fixedOtpCode: "000000",
    },
  ] as const;

  for (const demo of demoCreators) {
    const creator = await prisma.user.upsert({
      where: { phone: demo.phone },
      update: {
        email: demo.email,
        displayName: demo.displayName,
        username: demo.username,
        fixedOtpCode: demo.fixedOtpCode,
      },
      create: {
        role: UserRole.creator,
        phone: demo.phone,
        email: demo.email,
        displayName: demo.displayName,
        username: demo.username,
        fixedOtpCode: demo.fixedOtpCode,
        creatorProfile: { create: { tier: "silver" } },
        wallet: {
          create: {
            availablePaise: 3_517_000,
            pendingPaise: 522_000,
            lifetimePaise: 4_039_000,
          },
        },
      },
      include: { wallet: true },
    });

    if (creator.wallet) {
      await prisma.payoutMethod.upsert({
        where: { id: `seed-payout-${demo.username}` },
        update: {},
        create: {
          id: `seed-payout-${demo.username}`,
          userId: creator.id,
          type: "bank",
          label: "HDFC Bank",
          accountMasked: "•••• 1234",
          isDefault: true,
        },
      });
    }
  }

  console.log("Seed complete:");
  console.log("  Brand login: brand@demo.viralcut.in / DemoBrand123!");
  console.log("  Demo creators (fixed OTP 000000, stored in DB — no WhatsApp):");
  for (const demo of demoCreators) {
    console.log(
      `    ${demo.displayName} — ${demo.phone} — ${demo.email}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
