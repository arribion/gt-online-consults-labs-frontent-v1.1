import { useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AsyncSection,
  ConfirmDialog,
  DataTable,
  DonutChart,
  EmptyState,
  FilterBar,
  PageHeader,
  Panel,
  SearchInput,
  SelectFilter,
  StatCard,
  StatGrid,
  StatusBadge,
  UserAvatar,
  seriesColor,
  type Column,
} from "@/components/common";
import { MemberFormDialog, ResetPasswordDialog } from "@/components/members/MemberFormDialog";
import { useMutation } from "@/hooks/useAsync";
import { useMembers } from "@/hooks/useLookups";
import { useAuth } from "@/hooks/useAuth";
import { membersService } from "@/services";
import { formatDate, formatPercent } from "@/lib/format";
import { MEMBER_ROLES, MEMBER_STATUSES, type Member } from "@/types";

const ROLE_OPTIONS = MEMBER_ROLES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));
const STATUS_OPTIONS = MEMBER_STATUSES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

export default function AdminMembers() {
  const { user } = useAuth();
  const { members, loading, error, refetch } = useMembers();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [resetting, setResetting] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  const actorRole = user?.role ?? "ADMIN";
  const canManageAdmins = actorRole === "SUPERADMIN";

  const { mutate: remove, pending: removing } = useMutation(
    (member: Member) => membersService.remove(member.id),
    { success: "Member deleted.", onDone: () => void refetch() },
  );

  /** An ADMIN can only act on TASKER rows; the server enforces the same rule. */
  const canManage = (member: Member) => canManageAdmins || member.role === "TASKER";

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return members.filter((member) => {
      if (role && member.role !== role) return false;
      if (status && member.status !== status) return false;
      if (needle && !`${member.full_name} ${member.email}`.toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [members, search, role, status]);

  const byRole = useMemo(
    () =>
      MEMBER_ROLES.map((value, index) => ({
        label: value.charAt(0) + value.slice(1).toLowerCase(),
        value: members.filter((member) => member.role === value).length,
        color: seriesColor(index),
      })).filter((slice) => slice.value > 0),
    [members],
  );

  const columns: Column<Member>[] = [
    {
      key: "full_name",
      header: "Member",
      mobile: "primary",
      sortValue: (member) => member.full_name,
      cell: (member) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar name={member.full_name} src={member.avatar} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-frost">{member.full_name}</p>
            <p className="truncate text-xs text-dim">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      mobile: "secondary",
      sortValue: (member) => member.role,
      cell: (member) => <StatusBadge status={member.role} size="sm" />,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (member) => member.status,
      cell: (member) => <StatusBadge status={member.status} size="sm" />,
    },
    {
      key: "payment_rate",
      header: "Payment rate",
      align: "right",
      sortValue: (member) => member.payment_rate,
      cell: (member) =>
        member.role === "TASKER" ? (
          <span className="tabular-nums">{formatPercent(member.payment_rate)}</span>
        ) : (
          <span className="text-dim">—</span>
        ),
    },
    {
      key: "phone",
      header: "Phone",
      sortValue: (member) => member.phone ?? "",
      cell: (member) => member.phone || <span className="text-dim">—</span>,
    },
    {
      key: "last_login",
      header: "Last seen",
      sortValue: (member) => member.last_login ?? "",
      cell: (member) => (
        <span className="whitespace-nowrap text-xs text-mist">{formatDate(member.last_login)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (member) =>
        canManage(member) ? (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit ${member.full_name}`}
              onClick={() => setEditing(member)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Reset password for ${member.full_name}`}
              onClick={() => setResetting(member)}
            >
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
            {member.id !== user?.id && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${member.full_name}`}
                className="text-bad hover:bg-bad/10"
                onClick={() => setDeleting(member)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <span
            className="text-[11px] text-dim"
            title="Only a superadmin can manage admin accounts"
          >
            Superadmin only
          </span>
        ),
    },
  ];

  const activeFilters = [search, role, status].filter(Boolean).length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Members"
        description={
          canManageAdmins
            ? "Create and manage every account, including other admins."
            : "Create and manage tasker accounts. Admin accounts are superadmin-only."
        }
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New member
          </Button>
        }
      />

      <StatGrid className="lg:grid-cols-4">
        <StatCard label="Members" value={members.length} icon={Users} />
        <StatCard
          label="Active taskers"
          value={
            members.filter((member) => member.role === "TASKER" && member.status === "ACTIVE").length
          }
          tone="good"
          icon={UserRound}
        />
        <StatCard
          label="Admins"
          value={members.filter((member) => member.role !== "TASKER").length}
          icon={ShieldCheck}
        />
        <StatCard
          label="Suspended or inactive"
          value={members.filter((member) => member.status !== "ACTIVE").length}
          tone={members.some((member) => member.status === "SUSPENDED") ? "warn" : "default"}
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="space-y-4 lg:col-span-2">
          <FilterBar
            active={activeFilters}
            onReset={() => {
              setSearch("");
              setRole("");
              setStatus("");
            }}
          >
            <SearchInput value={search} onChange={setSearch} placeholder="Name or email…" />
            <SelectFilter
              label="Role"
              value={role}
              onChange={setRole}
              options={ROLE_OPTIONS}
              allLabel="Any role"
            />
            <SelectFilter
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              allLabel="Any status"
            />
          </FilterBar>

          <AsyncSection
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={!rows.length}
            empty={
              <EmptyState
                icon={Users}
                title={members.length ? "Nothing matches these filters" : "No members yet"}
                description={
                  members.length
                    ? "Try clearing the role or status filter."
                    : "Create the first account to get started."
                }
              />
            }
          >
            <DataTable rows={rows} columns={columns} getRowKey={(member) => member.id} pageSize={15} />
          </AsyncSection>
        </Panel>

        <DonutChart
          title="Accounts by role"
          description="Everyone with a login, split by tier."
          data={byRole}
          total={members.length.toString()}
          totalLabel="accounts"
          emptyLabel="Add a member and this fills in."
        />
      </div>

      <MemberFormDialog
        open={creating}
        onOpenChange={setCreating}
        actorRole={actorRole}
        onSaved={refetch}
      />
      <MemberFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        member={editing}
        actorRole={actorRole}
        onSaved={refetch}
      />
      <ResetPasswordDialog member={resetting} onClose={() => setResetting(null)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this member?"
        confirmLabel="Delete member"
        pending={removing}
        message={
          <>
            <span className="font-semibold text-frost">{deleting?.full_name}</span> loses access
            immediately. If they're assigned to any project the server will refuse the delete —
            remove them from their projects first, or set their status to Inactive instead.
          </>
        }
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting);
          setDeleting(null);
        }}
      />
    </>
  );
}
