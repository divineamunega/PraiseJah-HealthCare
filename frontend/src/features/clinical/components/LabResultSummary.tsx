import { AlertCircle } from "lucide-react";
import { resolveLabTestDefinition } from "../constants/lab-catalog";

interface LabResultSummaryProps {
  testName: string;
  results?: Record<string, any> | null;
  compact?: boolean;
  className?: string;
}

type ResultValue = string | number | boolean | null | undefined;

const isResultsRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const formatKeyLabel = (key: string) => {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatResultValue = (value: ResultValue | unknown): string => {
  if (value === null || value === undefined) return "—";

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : "—";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    const joined: string = value
      .map((item: unknown): string => formatResultValue(item))
      .filter((item) => item !== "—")
      .join(", ");

    return joined.length > 0 ? joined : "—";
  }

  if (isResultsRecord(value)) {
    const flattened: string = Object.entries(value)
      .map(([key, nestedValue]): string | null => {
        const nestedDisplay: string = formatResultValue(nestedValue);
        return nestedDisplay === "—" ? null : `${formatKeyLabel(key)}: ${nestedDisplay}`;
      })
      .filter((entry): entry is string => !!entry)
      .join(" • ");

    return flattened.length > 0 ? flattened : "—";
  }

  return "—";
};

export const LabResultSummary = ({
  testName,
  results,
  compact = false,
  className,
}: LabResultSummaryProps) => {
  const resolvedDefinition = resolveLabTestDefinition(testName);
  const definition = resolvedDefinition?.definition;
  const normalizedResults = isResultsRecord(results) ? results : null;
  const hasResultValues =
    normalizedResults !== null && Object.keys(normalizedResults).length > 0;

  const knownFieldKeys = new Set(definition?.fields.map((field) => field.key) || []);

  const extraEntries = hasResultValues
    ? Object.entries(normalizedResults).filter(([key]) => !knownFieldKeys.has(key))
    : [];

  if (!hasResultValues) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 text-[10px] font-bold uppercase tracking-widest ${
          className || ""
        }`}
      >
        <AlertCircle size={12} />
        No Results Submitted
      </div>
    );
  }

  const fieldCardClass = compact
    ? "bg-background/70 border border-white/10 px-3 py-2.5 space-y-1.5"
    : "bg-background/70 border border-white/10 px-4 py-3 space-y-2";

  const valueClass = compact
    ? "text-base md:text-lg"
    : "text-lg md:text-xl";

  const gridClass = compact
    ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
    : "grid grid-cols-1 sm:grid-cols-2 gap-3";

  const showCatalogFields = definition?.fields ?? [];

  return (
    <div className={`space-y-3 ${className || ""}`}>
      {showCatalogFields.length > 0 && (
        <div className={gridClass}>
          {showCatalogFields.map((field) => {
            const rawValue = normalizedResults[field.key];
            const displayValue = formatResultValue(rawValue);
            const isPlaceholderValue = displayValue === "—";

            return (
              <div key={field.key} className={fieldCardClass}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {field.label}
                  </p>
                  {field.unit && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-clinical-blue/80 border border-clinical-blue/20 bg-clinical-blue/10 px-1.5 py-0.5">
                      {field.unit}
                    </span>
                  )}
                </div>
                <p
                  className={`${valueClass} data-value font-semibold leading-tight ${
                    isPlaceholderValue ? "text-white/40" : "text-white"
                  }`}
                >
                  {displayValue}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {(!definition || extraEntries.length > 0) && (
        <div className={gridClass}>
          {(!definition ? Object.entries(normalizedResults) : extraEntries).map(
            ([key, value]) => {
              const displayValue = formatResultValue(value);
              const isPlaceholderValue = displayValue === "—";

              return (
                <div key={key} className={fieldCardClass}>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    {formatKeyLabel(key)}
                  </p>
                  <p
                    className={`${valueClass} data-value font-semibold leading-tight ${
                      isPlaceholderValue ? "text-white/40" : "text-white"
                    }`}
                  >
                    {displayValue}
                  </p>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};
