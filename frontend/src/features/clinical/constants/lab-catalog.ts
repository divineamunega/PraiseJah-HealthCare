export interface LabTestField {
  key: string;
  label: string;
  type: 'number' | 'string' | 'select';
  unit?: string;
  options?: string[];
}

export interface LabTestDefinition {
  name: string;
  fields: LabTestField[];
}

export const LAB_CATALOG: Record<string, LabTestDefinition> = {
  FBC: {
    name: 'Full Blood Count',
    fields: [
      { key: 'wbc', label: 'WBC', type: 'number', unit: 'x10^9/L' },
      { key: 'hb', label: 'Hemoglobin', type: 'number', unit: 'g/dL' },
      { key: 'plt', label: 'Platelets', type: 'number', unit: 'x10^9/L' },
    ],
  },
  'Malaria Parasite': {
    name: 'Malaria Parasite',
    fields: [
      {
        key: 'result',
        label: 'Result',
        type: 'select',
        options: ['Negative', '1+', '2+', '3+', '4+'],
      },
      { key: 'comment', label: 'Comment', type: 'string' },
    ],
  },
  Urinalysis: {
    name: 'Urinalysis',
    fields: [
      {
        key: 'glucose',
        label: 'Glucose',
        type: 'select',
        options: ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
      },
      {
        key: 'protein',
        label: 'Protein',
        type: 'select',
        options: ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
      },
      { key: 'ph', label: 'pH', type: 'number' },
    ],
  },
};

export const LAB_CATALOG_ENTRIES = Object.entries(LAB_CATALOG);

export interface ResolvedLabTestDefinition {
  key: string;
  definition: LabTestDefinition;
}

export const resolveLabTestDefinition = (
  testName: string,
): ResolvedLabTestDefinition | null => {
  const normalizedTestName = testName.trim();

  if (!normalizedTestName) {
    return null;
  }

  const byKey = LAB_CATALOG[normalizedTestName];

  if (byKey) {
    return { key: normalizedTestName, definition: byKey };
  }

  const normalizedLower = normalizedTestName.toLowerCase();
  const fallbackMatch = LAB_CATALOG_ENTRIES.find(([, definition]) => {
    return definition.name.trim().toLowerCase() === normalizedLower;
  });

  if (!fallbackMatch) {
    return null;
  }

  const [key, definition] = fallbackMatch;
  return { key, definition };
};
