import { useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormActions,
  FormGrid,
  Panel,
  PanelHeader,
  SelectField,
  TextField,
} from "@/components/common";
import { validateRow } from "@/lib/taskFile";
import { formatMinutes, toDateInput } from "@/lib/format";
import { tasksService } from "@/services";
import { useMutation } from "@/hooks/useAsync";
import {
  ACCOUNT_MAX_LENGTH,
  TASK_MAX_AGE_DAYS,
  type SelectOption,
  type TaskImportSummary,
} from "@/types";

/**
 * The picker's bounds, so an out-of-window date is unreachable rather than
 * rejected after the fact. The server decides for real — it reckons the window
 * in the business timezone rather than the browser's.
 */
const TODAY = toDateInput(new Date());
const EARLIEST_DATE = toDateInput(
  new Date(Date.now() - TASK_MAX_AGE_DAYS * 86_400_000),
);

const EMPTY = {
  taskId: "",
  taskStatus: "Completed",
  taskingDate: toDateInput(new Date()),
  taskDuration: "",
  paidDuration: "",
  account: "",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
  { value: "Pending", label: "Pending" },
];

/**
 * The "log as you go" path. Runs the same validation the bulk parser does, and
 * previews the billable figure before submitting, so the cap rule is visible
 * rather than something that only shows up on the invoice weeks later.
 */
export function SingleTaskForm({
  projectOptions,
  onCreated,
}: {
  projectOptions: SelectOption[];
  onCreated: (summary: TaskImportSummary) => void;
}) {
  const [projectId, setProjectId] = useState("");
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState(false);

  const parsed = useMemo(() => validateRow(values, 1), [values]);

  const { mutate: create, pending } = useMutation(
    () =>
      tasksService.create({
        projectId,
        taskId: values.taskId.trim(),
        taskStatus: values.taskStatus,
        taskingDate: values.taskingDate,
        taskDuration: values.taskDuration.trim(),
        paidDuration: values.paidDuration.trim(),
        account: values.account.trim(),
      }),
    {
      onDone: (summary) => {
        setValues({ ...EMPTY, taskingDate: values.taskingDate, account: values.account });
        setTouched(false);
        onCreated(summary);
      },
    },
  );

  const set = (key: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const errorFor = (needle: string) =>
    touched ? parsed.errors.find((message) => message.startsWith(needle)) : undefined;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!projectId || parsed.errors.length) return;
    void create();
  };

  return (
    <Panel>
      <PanelHeader
        title="Log one task"
        description="Same rules as the bulk upload — useful when you're logging as you finish."
      />

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <SelectField
          label="Project"
          required
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          options={projectOptions}
          placeholder={projectOptions.length ? "Choose a project…" : "No projects assigned to you"}
          disabled={!projectOptions.length}
          error={touched && !projectId ? "Pick the project this task belongs to" : undefined}
        />

        <FormGrid>
          <TextField
            label="Task ID"
            required
            value={values.taskId}
            onChange={set("taskId")}
            placeholder="The platform's task identifier"
            error={errorFor("TASK ID")}
          />
          <SelectField
            label="Task status"
            required
            value={values.taskStatus}
            onChange={set("taskStatus")}
            options={STATUS_OPTIONS}
            hint="Only Completed tasks are ever billed."
          />
          <TextField
            label="Tasking date"
            type="date"
            required
            min={EARLIEST_DATE}
            max={TODAY}
            value={values.taskingDate}
            onChange={set("taskingDate")}
            className="[color-scheme:dark]"
            hint={`Work must be logged within ${TASK_MAX_AGE_DAYS} days of being done.`}
            error={errorFor("TASKING DATE")}
          />
          <TextField
            label="Account"
            required
            maxLength={ACCOUNT_MAX_LENGTH}
            value={values.account}
            onChange={set("account")}
            placeholder="GT"
            hint={`Short client code, max ${ACCOUNT_MAX_LENGTH} characters.`}
            error={errorFor("ACCOUNT")}
          />
          <TextField
            label="Task duration"
            required
            value={values.taskDuration}
            onChange={set("taskDuration")}
            placeholder="6:45"
            hint="Exactly MM:SS."
            error={errorFor("TASK DURATION")}
          />
          <TextField
            label="Paid duration"
            required
            value={values.paidDuration}
            onChange={set("paidDuration")}
            placeholder="capped @5 minutes"
            hint="Declares the cap, not the payout."
            error={errorFor("PAID DURATION")}
          />
        </FormGrid>

        {!parsed.errors.length && values.taskDuration && values.paidDuration && (
          <p className="rounded-lg border border-line bg-ink2/50 px-3 py-2.5 text-sm text-mist">
            Billable:{" "}
            <span className="font-semibold text-frost">
              {formatMinutes(parsed.billableMinutes)}
            </span>{" "}
            — the lesser of the duration rounded up and the {parsed.capMinutes}-minute cap.
          </p>
        )}

        <FormActions>
          <Button type="submit" disabled={pending || !projectOptions.length}>
            <Plus className="h-4 w-4" />
            {pending ? "Saving…" : "Log task"}
          </Button>
        </FormActions>
      </form>
    </Panel>
  );
}
