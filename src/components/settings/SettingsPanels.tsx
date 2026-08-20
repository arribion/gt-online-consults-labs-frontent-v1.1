import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  FormActions,
  FormGrid,
  Panel,
  PanelHeader,
  TextField,
  UserAvatar,
} from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@/hooks/useAsync";
import { membersService } from "@/services";
import { formatDateTime, formatPercent } from "@/lib/format";
import { StatusBadge } from "@/components/common";

/** Name, phone, avatar. Email, role, status and payment rate are admin-only. */
export function ProfilePanel() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");

  const { mutate: save, pending } = useMutation(
    () => membersService.updateMe({ full_name: fullName.trim(), phone, avatar }),
    { success: "Profile updated.", onDone: () => void refreshUser() },
  );

  if (!user) return null;

  return (
    <Panel>
      <PanelHeader
        title="Profile"
        description="How your name appears on invoices, rosters and disputes."
      />

      <div className="mt-4 flex items-center gap-4">
        <UserAvatar name={fullName || user.full_name} src={avatar || user.avatar} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-frost">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={user.role} size="sm" />
            <StatusBadge status={user.status} size="sm" />
          </div>
        </div>
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void save();
        }}
      >
        <FormGrid>
          <TextField
            label="Full name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <TextField
            label="Phone"
            type="tel"
            value={phone ?? ""}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="07XXXXXXXX"
          />
          <TextField
            label="Avatar URL"
            type="url"
            value={avatar ?? ""}
            onChange={(event) => setAvatar(event.target.value)}
            placeholder="https://…"
            wrapperClassName="sm:col-span-2"
            hint="Optional. Leave blank to use your initials."
          />
        </FormGrid>

        <dl className="grid gap-3 rounded-xl border border-line bg-ink2/40 p-3.5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-dim">
              Payment rate
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-frost">
              {formatPercent(user.payment_rate)}
              <span className="ml-2 text-xs font-normal text-dim">set by an administrator</span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-dim">
              Last sign-in
            </dt>
            <dd className="mt-0.5 text-frost">{formatDateTime(user.last_login)}</dd>
          </div>
        </dl>

        <FormActions>
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" /> {pending ? "Saving…" : "Save profile"}
          </Button>
        </FormActions>
      </form>
    </Panel>
  );
}

/** Where payouts go. Stored as `payout_method` on the user record. */
export function PayoutPanel() {
  const { user, refreshUser } = useAuth();
  const [type, setType] = useState(user?.payout_method?.type ?? "mpesa");
  const [phone, setPhone] = useState(user?.payout_method?.phone ?? "");

  const { mutate: save, pending } = useMutation(
    () => membersService.updateMe({ payout_method: { type, phone } }),
    { success: "Payout details updated.", onDone: () => void refreshUser() },
  );

  return (
    <Panel>
      <PanelHeader
        title="Payout details"
        description="Where payments for your invoices should be sent."
      />
      <form
        className="mt-4 space-y-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void save();
        }}
      >
        <FormGrid>
          <TextField
            label="Method"
            value={type}
            onChange={(event) => setType(event.target.value)}
            placeholder="mpesa"
          />
          <TextField
            label="Phone / account"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="07XXXXXXXX"
          />
        </FormGrid>
        <FormActions>
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" /> {pending ? "Saving…" : "Save payout details"}
          </Button>
        </FormActions>
      </form>
    </Panel>
  );
}

export function PasswordPanel() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate: change, pending } = useMutation(
    () => membersService.changePassword({ oldPassword, newPassword, confirmNewPassword }),
    {
      success: "Password updated.",
      onDone: () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      },
    },
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) return setError("Use at least 8 characters.");
    if (newPassword !== confirmNewPassword) return setError("The two new passwords don't match.");
    setError("");
    void change();
  };

  return (
    <Panel>
      <PanelHeader title="Password" description="Changing this signs you out of nothing — your current session stays active." />
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}
        <TextField
          label="Current password"
          type="password"
          required
          autoComplete="current-password"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
        />
        <FormGrid>
          <TextField
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextField
            label="Confirm new password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
          />
        </FormGrid>
        <FormActions>
          <Button type="submit" disabled={pending}>
            <KeyRound className="h-4 w-4" /> {pending ? "Updating…" : "Update password"}
          </Button>
        </FormActions>
      </form>
    </Panel>
  );
}

export function DangerZonePanel() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { mutate: remove, pending } = useMutation(() => membersService.deleteMe(), {
    success: "Account deleted.",
    onDone: async () => {
      await logout();
      navigate("/", { replace: true });
    },
  });

  return (
    <>
      <Panel className="border-bad/40 bg-bad/[0.05]">
        <PanelHeader
          title="Delete account"
          description="Removes your login permanently. Task entries and invoices already on record are kept for accounting."
        />
        <Button variant="destructive" className="mt-4" onClick={() => setOpen(true)}>
          <AlertTriangle className="h-4 w-4" /> Delete my account
        </Button>
      </Panel>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete your account?"
        message="You'll be signed out immediately and won't be able to sign back in. This can't be undone — ask an administrator if you only need your access paused."
        confirmLabel="Delete account"
        pending={pending}
        onConfirm={() => void remove()}
      />
    </>
  );
}
