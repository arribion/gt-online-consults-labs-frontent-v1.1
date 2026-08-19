import { PageHeader } from "@/components/common";
import {
  DangerZonePanel,
  PasswordPanel,
  PayoutPanel,
  ProfilePanel,
} from "@/components/settings/SettingsPanels";

export default function Settings() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your profile, payout details and password."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <ProfilePanel />
          <PayoutPanel />
        </div>
        <div className="space-y-4">
          <PasswordPanel />
          <DangerZonePanel />
        </div>
      </div>
    </>
  );
}
