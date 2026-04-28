import React, { useState } from 'react';
import { resolveLabTestDefinition } from '../constants/lab-catalog';
import { Beaker, Save, Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/5 border border-white/5">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
        <Beaker size={14} className="text-clinical-blue" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{definition.name}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {definition.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex justify-between">
              <span>{field.label}</span>
              {field.unit && <span className="text-clinical-blue/60">{field.unit}</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full bg-background border border-white/10 rounded-none p-2 text-xs text-white focus:outline-none focus:border-clinical-blue transition-colors"
                required
              >
                <option value="">-- SELECT --</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                step={field.type === 'number' ? 'any' : undefined}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                className="w-full bg-background border border-white/10 rounded-none p-2 text-xs text-white focus:outline-none focus:border-clinical-blue transition-colors"
                required
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-clinical-blue/10 border border-clinical-blue/20 text-clinical-blue text-[10px] font-bold uppercase tracking-widest hover:bg-clinical-blue hover:text-white transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Save size={12} />
          )}
          Save {definition.name} Results
        </button>
      </div>
    </form>
  );
};
