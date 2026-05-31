import { CampaignWizardProvider } from "@/providers/campaign-wizard";

export default function CampaignWizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CampaignWizardProvider>{children}</CampaignWizardProvider>;
}
