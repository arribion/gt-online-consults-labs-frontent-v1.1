import { Activity } from "lucide-react";
import { PageHeader, Panel, PanelHeader, StatusBadge } from "@/components/common";
import { PasswordPanel, ProfilePanel } from "@/components/settings/SettingsPanels";
import { useAsync } from "@/hooks/useAsync";
import { healthService, type HealthStatus } from "@/services/health.service";
import { API_ROOT } from "@/services";

export default function AdminSettings() {
  const { data, loading, error } = useAsync<HealthStatus | null>(
    () => healthService.check(),
    [],
    null,
  );

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your own profile and password, plus the state of the API this dashboard is talking to."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <ProfilePanel />

        <div className="space-y-4">
          <PasswordPanel />

          <Panel>
            <PanelHeader
              title="API status"
              description="Where this dashboard is pointed, and whether it's answering."
            />
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">Endpoint</dt>
                <dd className="truncate text-right font-mono text-xs text-frost">{API_ROOT}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-mist">Health</dt>
                <dd>
                  {loading ? (
                    <span className="text-xs text-dim">Checking…</span>
                  ) : error || !data ? (
                    <StatusBadge status="SUSPENDED" label="Unreachable" size="sm" />
                  ) : (
                    <StatusBadge status="ACTIVE" label={data.status} size="sm" />
                  )}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">Environment</dt>
                <dd className="flex items-center gap-1.5 text-frost">
                  <Activity className="h-3.5 w-3.5 text-sky2" />
                  {data?.env ?? "unknown"}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
