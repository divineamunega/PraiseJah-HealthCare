import React, { useState } from "react";
import { resolveLabTestDefinition } from "../constants/lab-catalog";
import { Beaker, Save, Loader2, AlertCircle } from "lucide-react";

interface DynamicResultFormProps {
  testName: string;
  onSubmit: (results: Record<string, any>) => void;
  initialResults?: Record<string, any> | null;
  isSubmitting?: boolean;
}

export const DynamicResultForm: React.FC<DynamicResultFormProps> = ({
  testName,
  onSubmit,
  initialResults,
  isSubmitting,
}) => {
  const resolvedTestDefinition = resolveLabTestDefinition(testName);
  const definition = resolvedTestDefinition?.definition;
  const [values, setValues] = useState<Record<string, any>>(initialResults || {});

  if (!definition) {
    return (
      <div className="text-[10px] text-red-400 uppercase font-bold p-4 border border-red-400/20 bg-red-400/5">
        Test definition for "{testName}" not found in catalog.
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-5 bg-surface-container-low border border-white/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-background border border-white/10 flex items-center justify-center">
            <Beaker size={16} className="text-clinical-blue" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-[0.18em]">
              {definition.name}
            </h3>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              Enter laboratory findings for this request
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 text-[9px] font-bold uppercase tracking-widest">
          <AlertCircle size={12} />
          Pending Result Entry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {definition.fields.map((field) => {
          const inputId = `${definition.name}-${field.key}`
            .toLowerCase()
            .replace(/\s+/g, "-");

          return (
            <div
              key={field.key}
              className="bg-background/70 border border-white/10 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={inputId}
                  className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                >
                  {field.label}
                </label>
                {field.unit && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-clinical-blue/80 border border-clinical-blue/20 bg-clinical-blue/10 px-1.5 py-0.5">
                    {field.unit}
                  </span>
                )}
              </div>

              {field.type === "select" ? (
                <select
                  id={inputId}
                  value={values[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-surface-container-low border border-white/15 p-3 text-base data-value text-white outline-none focus:border-clinical-blue focus:ring-2 focus:ring-clinical-blue/20 transition-all"
                  required
                >
                  <option value="">Select result</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={inputId}
                  type={field.type === "number" ? "number" : "text"}
                  step={field.type === "number" ? "any" : undefined}
                  value={values[field.key] || ""}
                  onChange={(e) =>
                    handleChange(
                      field.key,
                      field.type === "number"
                        ? parseFloat(e.target.value)
                        : e.target.value,
                    )
                  }
                  className="w-full bg-surface-container-low border border-white/15 p-3 text-base data-value text-white outline-none focus:border-clinical-blue focus:ring-2 focus:ring-clinical-blue/20 transition-all placeholder:text-white/20"
                  required
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-3 bg-clinical-blue/10 border border-clinical-blue/30 text-clinical-blue text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-clinical-blue hover:text-white transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Save {definition.name} Results
        </button>
      </div>
    </form>
  );
};
