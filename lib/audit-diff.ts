import { AUDIT_CONFIG, DEFAULT_HIDDEN_FIELDS } from "./audit-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuditRecord = Record<string, unknown>;

export type AuditChange = {
  field: string;
  label: string;
  before: string;
  after: string;
};

export type AuditDiffResult =
  | { type: "diff"; changes: AuditChange[] }
  | { type: "created"; fields: Array<{ label: string; value: string }> }
  | { type: "deleted"; fields: Array<{ label: string; value: string }> }
  | { type: "empty" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHiddenFields(tableName: string): Set<string> {
  const config = AUDIT_CONFIG[tableName];

  return new Set([...DEFAULT_HIDDEN_FIELDS, ...(config?.hiddenFields ?? [])]);
}

function getLabel(tableName: string, key: string): string {
  const config = AUDIT_CONFIG[tableName];

  return (
    config?.labels?.[key] ??
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value);
}

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value));
}

function formatValue(key: string, value: unknown): string {
  // ---------------------------------------------------------------------------
  // Empty values
  // ---------------------------------------------------------------------------

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  // ---------------------------------------------------------------------------
  // Boolean
  // ---------------------------------------------------------------------------

  if (typeof value === "boolean") {
    if (
      key.startsWith("is") ||
      key === "isActive" ||
      key === "isArchived" ||
      key === "isVerified" ||
      key === "isRead"
    ) {
      return value ? "Yes" : "No";
    }

    return value ? "True" : "False";
  }

  // ---------------------------------------------------------------------------
  // Numbers
  // ---------------------------------------------------------------------------

  if (typeof value === "number") {
    if (key === "amount" || key.includes("Amount")) {
      return formatCurrency(value);
    }

    return String(value);
  }

  // ---------------------------------------------------------------------------
  // Arrays
  // ---------------------------------------------------------------------------

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    return value.map((v) => formatValue(key, v)).join(", ");
  }

  // ---------------------------------------------------------------------------
  // Objects
  // ---------------------------------------------------------------------------

  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Object]";
    }
  }

  // ---------------------------------------------------------------------------
  // Strings
  // ---------------------------------------------------------------------------

  if (typeof value === "string") {
    // ISO date strings
    if (isDateString(value)) {
      const d = new Date(value);

      if (!isNaN(d.getTime())) {
        return d.toLocaleString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: value.includes("T") ? "numeric" : undefined,
          minute: value.includes("T") ? "2-digit" : undefined,
        });
      }
    }

    // Currency-like numeric strings
    if (key === "amount" && !isNaN(Number(value))) {
      return formatCurrency(value);
    }

    return value;
  }

  // ---------------------------------------------------------------------------
  // Fallback
  // ---------------------------------------------------------------------------

  return String(value);
}

function valuesAreEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Main Diff Function
// ---------------------------------------------------------------------------

export function getAuditDiff(
  tableName: string,
  action: string,
  previousValue: unknown,
  newValue: unknown,
): AuditDiffResult {
  const ignoredFields = getHiddenFields(tableName);

  const hasPrev =
    previousValue !== null &&
    previousValue !== undefined &&
    typeof previousValue === "object";

  const hasNew =
    newValue !== null && newValue !== undefined && typeof newValue === "object";

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  if (!hasPrev && hasNew) {
    const next = newValue as AuditRecord;

    const fields = Object.entries(next)
      .filter(([key]) => !ignoredFields.has(key))
      .map(([key, val]) => ({
        label: getLabel(tableName, key),
        value: formatValue(key, val),
      }))
      .filter((f) => f.value !== "—");

    if (fields.length === 0) {
      return { type: "empty" };
    }

    return {
      type: "created",
      fields,
    };
  }

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  if (hasPrev && !hasNew) {
    const prev = previousValue as AuditRecord;

    const fields = Object.entries(prev)
      .filter(([key]) => !ignoredFields.has(key))
      .map(([key, val]) => ({
        label: getLabel(tableName, key),
        value: formatValue(key, val),
      }))
      .filter((f) => f.value !== "—");

    if (fields.length === 0) {
      return { type: "empty" };
    }

    return {
      type: "deleted",
      fields,
    };
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  if (hasPrev && hasNew) {
    const prev = previousValue as AuditRecord;
    const next = newValue as AuditRecord;

    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

    const changes: AuditChange[] = [];

    for (const key of allKeys) {
      if (ignoredFields.has(key)) continue;

      const before = prev[key];
      const after = next[key];

      if (valuesAreEqual(before, after)) {
        continue;
      }

      changes.push({
        field: key,
        label: getLabel(tableName, key),
        before: formatValue(key, before),
        after: formatValue(key, after),
      });
    }

    if (changes.length === 0) {
      return { type: "empty" };
    }

    return {
      type: "diff",
      changes,
    };
  }

  // ---------------------------------------------------------------------------
  // EMPTY
  // ---------------------------------------------------------------------------

  return { type: "empty" };
}
