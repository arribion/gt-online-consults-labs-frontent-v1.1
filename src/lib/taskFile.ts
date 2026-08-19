import { ACCOUNT_MAX_LENGTH, REQUIRED_TASK_HEADERS } from "@/types";

/**
 * Client-side mirror of `backend-python/app/services/task_parsing.py`.
 *
 * The server is still the authority — nothing here is trusted — but a bad file
 * is rejected whole, so catching the problems before upload saves the tasker a
 * round-trip per mistake. Keep these rules in step with that module.
 */

const DURATION_PATTERN = /^(\d+):([0-5]?\d)$/;
const CAP_PATTERN = /^(?:capped\s*@\s*)?(\d+)\s*minutes?$/;

export type ParsedRow = {
  rowNumber: number;
  taskId: string;
  taskStatus: string;
  taskingDate: string;
  taskDuration: string;
  paidDuration: string;
  account: string;
  /** min(ceil(duration), cap) — the same figure the server will compute. */
  billableMinutes: number;
  capMinutes: number;
  errors: string[];
};

export type ParsedFile = {
  rows: ParsedRow[];
  missingHeaders: string[];
  errorCount: number;
  billableMinutes: number;
  completedCount: number;
};

const cell = (row: Record<string, unknown>, header: string): string => {
  const value = row[header];
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

export function validateRow(
  values: {
    taskId: string;
    taskStatus: string;
    taskingDate: string;
    taskDuration: string;
    paidDuration: string;
    account: string;
  },
  rowNumber: number,
): ParsedRow {
  const errors: string[] = [];

  if (!values.taskId) errors.push("TASK ID is required");
  if (!values.taskStatus) errors.push("TASK STATUS is required");

  if (!values.taskingDate) {
    errors.push("TASKING DATE is required");
  } else if (Number.isNaN(new Date(values.taskingDate).getTime())) {
    errors.push(`TASKING DATE "${values.taskingDate}" isn't a date the server can read`);
  }

  const durationMatch = DURATION_PATTERN.exec(values.taskDuration);
  if (!durationMatch) {
    errors.push(`TASK DURATION "${values.taskDuration || "(empty)"}" must be MM:SS, e.g. 6:45`);
  }

  const capMatch = CAP_PATTERN.exec(values.paidDuration.toLowerCase());
  if (!capMatch) {
    errors.push(
      `PAID DURATION "${values.paidDuration || "(empty)"}" must be "capped @N minutes" or "N minutes"`,
    );
  }

  if (!values.account) {
    errors.push("ACCOUNT is required");
  } else if (values.account.length > ACCOUNT_MAX_LENGTH) {
    errors.push(`ACCOUNT "${values.account}" is over ${ACCOUNT_MAX_LENGTH} characters`);
  }

  const durationSeconds = durationMatch
    ? Number(durationMatch[1]) * 60 + Number(durationMatch[2])
    : 0;
  const capMinutes = capMatch ? Number(capMatch[1]) : 0;

  return {
    rowNumber,
    ...values,
    capMinutes,
    billableMinutes: capMatch ? Math.min(Math.ceil(durationSeconds / 60), capMinutes) : 0,
    errors,
  };
}

/** Read a .csv/.xlsx in the browser and run the same checks the server will. */
export async function parseTaskFile(file: File): Promise<ParsedFile> {
  // Loaded on demand — the spreadsheet reader is by far the heaviest thing on
  // this page and most visits never touch it.
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const headers = Object.keys(raw[0] ?? {}).map((header) => header.trim().toUpperCase());
  const missingHeaders = REQUIRED_TASK_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length) {
    return {
      rows: [],
      missingHeaders,
      errorCount: 0,
      billableMinutes: 0,
      completedCount: 0,
    };
  }

  // Re-key each row by the normalised header so lookups are case-insensitive.
  const rows = raw.map((original, index) => {
    const normalised: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(original)) {
      normalised[key.trim().toUpperCase()] = value;
    }
    return validateRow(
      {
        taskId: cell(normalised, "TASK ID"),
        taskStatus: cell(normalised, "TASK STATUS"),
        taskingDate: cell(normalised, "TASKING DATE"),
        taskDuration: cell(normalised, "TASK DURATION"),
        paidDuration: cell(normalised, "PAID DURATION"),
        account: cell(normalised, "ACCOUNT"),
      },
      index + 2, // +2: sheet rows are 1-based and row 1 is the header
    );
  });

  return {
    rows,
    missingHeaders: [],
    errorCount: rows.filter((row) => row.errors.length).length,
    billableMinutes: rows
      .filter((row) => !row.errors.length && row.taskStatus.toLowerCase() === "completed")
      .reduce((sum, row) => sum + row.billableMinutes, 0),
    completedCount: rows.filter((row) => row.taskStatus.toLowerCase() === "completed").length,
  };
}

/** A ready-to-fill template, so nobody has to guess the header wording. */
export async function downloadTaskTemplate(): Promise<void> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet([
    [...REQUIRED_TASK_HEADERS],
    ["6f2c1a90-task-id", "Completed", "2026-08-14", "6:45", "capped @5 minutes", "GT"],
    ["7a3d2b81-task-id", "Completed", "2026-08-14", "12:10", "15 minutes", "JW"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Task log");
  XLSX.writeFile(workbook, "gt-task-log-template.xlsx");
}
