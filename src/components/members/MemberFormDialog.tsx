import { useEffect, useState, type FormEvent } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormGrid, Modal, SelectField, TextField } from "@/components/common";
import { useMutation } from "@/hooks/useAsync";
import { membersService } from "@/services";
import {
  MEMBER_ROLES,
  MEMBER_STATUSES,
  type Member,
  type MemberCreate,
  type MemberRole,
} from "@/types";

const STATUS_OPTIONS = MEMBER_STATUSES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

const EMPTY: MemberCreate = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  role: "TASKER",
  status: "ACTIVE",
  payment_rate: 0,
};

/**
 * Create or edit a member.
 *
 * The role tier is enforced server-side — an ADMIN may only touch TASKERs — so
 * the role options are narrowed to match. Showing a SUPERADMIN option to an
 * ADMIN would just produce a 403 after they'd filled the whole form in.
 */
export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  actorRole,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create. */
  member?: Member | null;
  actorRole: MemberRole;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<MemberCreate>(EMPTY);
  const [error, setError] = useState("");

  const canManageAdmins = actorRole === "SUPERADMIN";
  const roleOptions = MEMBER_ROLES.filter((role) => canManageAdmins || role === "TASKER").map(
    (value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }),
  );

  useEffect(() => {
    if (!open) return;
    setError("");
    setValues(
      member
        ? {
            full_name: member.full_name,
            email: member.email,
            password: "",
            phone: member.phone ?? "",
            role: member.role,
            status: member.status,
            payment_rate: member.payment_rate,
          }
        : EMPTY,
    );
  }, [open, member]);

  const { mutate: save, pending } = useMutation(
    () => {
      if (member) {
        const { password: _password, ...update } = values;
        return membersService.update(member.id, update);
      }
      return membersService.create(values);
    },
    {
      success: member ? "Member updated." : "Member created.",
      onDone: () => {
        onSaved();
        onOpenChange(false);
      },
    },
  );

  const set = <K extends keyof MemberCreate>(key: K, value: MemberCreate[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.full_name.trim()) return setError("Enter the member's full name.");
    if (!values.email.trim()) return setError("Enter an email address.");
    if (!member && values.password.length < 8)
      return setError("Set a starting password of at least 8 characters.");
    if (values.payment_rate < 0 || values.payment_rate > 100)
      return setError("The payment rate is a percentage between 0 and 100.");
    setError("");
    await save();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={member ? "Edit member" : "New member"}
      description={
        member
          ? "Changing the email changes how they sign in."
          : "Accounts are invite-only — this is the only way one gets created."
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}

        <FormGrid>
          <TextField
            label="Full name"
            required
            value={values.full_name}
            onChange={(event) => set("full_name", event.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            required
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
          />
          {!member && (
            <TextField
              label="Starting password"
              type="password"
              required
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => set("password", event.target.value)}
              hint="Share it with them; they can change it in their settings."
              wrapperClassName="sm:col-span-2"
            />
          )}
          <TextField
            label="Phone"
            type="tel"
            value={values.phone ?? ""}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="07XXXXXXXX"
          />
          <SelectField
            label="Role"
            required
            value={values.role}
            onChange={(event) => set("role", event.target.value as MemberRole)}
            options={roleOptions}
            hint={canManageAdmins ? undefined : "Only a superadmin can create admin accounts."}
          />
          <SelectField
            label="Status"
            required
            value={values.status}
            onChange={(event) => set("status", event.target.value as Member["status"])}
            options={STATUS_OPTIONS}
            hint="Only ACTIVE taskers can be assigned to projects."
          />
          <TextField
            label="Payment rate (%)"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={values.payment_rate || ""}
            onChange={(event) => set("payment_rate", Number(event.target.value))}
            hint="Their revenue share, applied to invoices by default."
          />
        </FormGrid>

        {values.role === "TASKER" && (
          <p className="flex items-start gap-2 rounded-lg border border-line bg-ink2/40 px-3 py-2.5 text-xs text-mist">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky2" />
            Taskers can't change their own payment rate — set it here, and it's what their generated
            invoices use unless an admin overrides it per invoice.
          </p>
        )}
      </form>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" form="member-form" disabled={pending}>
          {pending ? "Saving…" : member ? "Save changes" : "Create member"}
        </Button>
      </div>
    </Modal>
  );
}

export function ResetPasswordDialog({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPassword("");
    setConfirm("");
    setError("");
  }, [member]);

  const { mutate: reset, pending } = useMutation(
    () =>
      membersService.resetPassword(member!.id, {
        new_password: password,
        confirm_new_password: confirm,
      }),
    { success: "Password reset.", onDone: onClose },
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setError("");
    await reset();
  };

  return (
    <Modal
      open={!!member}
      onOpenChange={(open) => !open && onClose()}
      title="Reset password"
      description={`Set a new password for ${member?.full_name ?? "this member"}. They aren't notified — pass it on yourself.`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}
        <TextField
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextField
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Resetting…" : "Reset password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
