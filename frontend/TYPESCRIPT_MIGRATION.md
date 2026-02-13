# Frontend TypeScript Migration Guide

This document outlines the step-by-step process to convert the frontend codebase from JavaScript to TypeScript.

---

## Table of Contents

1. [Set Up TypeScript Configuration](#step-1-set-up-typescript-configuration)
2. [Define Shared Types and Interfaces](#step-2-define-shared-types-and-interfaces)
3. [Convert React Components](#step-3-convert-react-components)
4. [Convert Frontend Services](#step-4-convert-frontend-services)
5. [Update ESLint Configuration](#step-5-update-eslint-configuration)
6. [Update Vite Configuration](#step-6-update-vite-configuration)
7. [Convert E2E Tests (Playwright)](#step-7-convert-e2e-tests-playwright)
8. [Update npm Scripts](#step-8-update-npm-scripts)
9. [Update Entry Point](#step-9-update-entry-point)
10. [Verify Build and Type Checking](#step-10-verify-build-and-type-checking)
11. [Clean Up and Final Validation](#step-11-clean-up-and-final-validation)

---

## Step 1: Set Up TypeScript Configuration

### Overview
Install TypeScript and create configuration files that define how TypeScript should compile the code.

### Files to Create/Modify
- `tsconfig.json` (create)
- `tsconfig.node.json` (create)
- `package.json` (modify)

### Dependencies to Install
```bash
npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### tsconfig.json
Create this file in the `frontend/` root directory:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "skipLibCheck": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }],
  "exclude": ["node_modules"]
}
```

### tsconfig.node.json
Create this file for the Vite configuration:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### Key Configuration Options Explained

| Option | Purpose |
|--------|---------|
| `target: "ES2020"` | Output modern JavaScript (Vite handles browser compatibility) |
| `module: "ESNext"` | Use ES modules |
| `moduleResolution: "bundler"` | Modern resolution for Vite/esbuild |
| `jsx: "react-jsx"` | Use React 17+ automatic JSX transform |
| `strict: true` | Enable all strict type-checking options |
| `noEmit: true` | TypeScript only type-checks; Vite handles bundling |
| `isolatedModules: true` | Required for esbuild compatibility |

---

## Step 2: Define Shared Types and Interfaces

### Overview
Create a centralized types file defining the data structures used throughout the application.

### Files to Create
- `src/types/incident.ts` (create)
- `src/types/index.ts` (create)

### src/types/incident.ts

```typescript
// Severity levels for incidents
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Status options for incidents
export type Status = 'open' | 'investigating' | 'resolved' | 'closed';

// Incident type categories
export type IncidentType = 
  | 'malware' 
  | 'brute_force' 
  | 'phishing' 
  | 'unauthorized_access' 
  | 'data_exfiltration';

// Main Incident interface matching the database schema
export interface Incident {
  id: number;
  timestamp: string;
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status: Status;
  description: string | null;
}

// For creating new incidents (id is auto-generated)
export interface CreateIncidentData {
  timestamp: string;
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status?: Status;
  description?: string;
}

// For updating incidents
export interface UpdateIncidentData {
  timestamp: string;
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status: Status;
  description?: string;
}

// Form state (timestamp format differs from API)
export interface IncidentFormData {
  timestamp: string;      // datetime-local format: "YYYY-MM-DDTHH:MM"
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status: Status;
  description: string;
}

// Form validation errors
export interface FormErrors {
  timestamp?: string;
  source_ip?: string;
  severity?: string;
  type?: string;
  status?: string;
  description?: string;
}

// API response types
export interface ApiError {
  error: string;
}

export interface DeleteResponse {
  message: string;
}
```

### src/types/index.ts

```typescript
// Re-export all types from a single entry point
export * from './incident';
```

### Usage Example
```typescript
import { Incident, CreateIncidentData, Severity } from '@/types';
// or
import type { Incident } from '../types';
```

---

## Step 3: Convert React Components

### Overview
Rename `.jsx` files to `.tsx` and add type annotations to components, props, state, and event handlers.

### Files to Convert

| Original | New | Complexity |
|----------|-----|------------|
| `src/App.jsx` | `src/App.tsx` | Low |
| `src/main.jsx` | `src/main.tsx` | Low |
| `src/components/IncidentForm.jsx` | `src/components/IncidentForm.tsx` | High |
| `src/components/IncidentTable.jsx` | `src/components/IncidentTable.tsx` | Medium |

### Conversion Process

#### 3.1 Convert `src/main.tsx`

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Changes:**
- Add null check for `rootElement`
- TypeScript infers types automatically here

#### 3.2 Convert `src/App.tsx`

```typescript
import { useState } from 'react';
import IncidentTable from './components/IncidentTable';
import IncidentForm from './components/IncidentForm';
import type { Incident } from './types';

function App(): JSX.Element {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleAddNew = (): void => {
    setEditingIncident(null);
    setShowForm(true);
  };

  const handleEdit = (incident: Incident): void => {
    setEditingIncident(incident);
    setShowForm(true);
  };

  const handleCloseForm = (): void => {
    setShowForm(false);
    setEditingIncident(null);
  };

  const handleSuccess = (): void => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    // ... JSX remains the same
  );
}

export default App;
```

**Key Changes:**
- Import `Incident` type
- Type state with generics: `useState<Incident | null>(null)`
- Add return types to functions: `(): void`
- Type callback parameters: `(incident: Incident)`

#### 3.3 Convert `src/components/IncidentTable.tsx`

```typescript
import { useState, useEffect } from 'react';
import { getAllIncidents, deleteIncident } from '../services/incidentService';
import type { Incident, Severity, Status } from '../types';

// Props interface
interface IncidentTableProps {
  onEdit: (incident: Incident) => void;
  refreshTrigger: number;
}

// Type-safe color mappings
const severityColors: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const statusColors: Record<Status, string> = {
  open: 'bg-blue-100 text-blue-800',
  investigating: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800',
};

function IncidentTable({ onEdit, refreshTrigger }: IncidentTableProps): JSX.Element {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this incident?')) {
      return;
    }
    // ... rest of implementation
  };

  // ... rest of component
}

export default IncidentTable;
```

**Key Changes:**
- Define `IncidentTableProps` interface
- Use `Record<Key, Value>` for type-safe object mappings
- Type state arrays: `useState<Incident[]>([])`
- Type async functions: `async (id: number): Promise<void>`

#### 3.4 Convert `src/components/IncidentForm.tsx`

```typescript
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createIncident, updateIncident } from '../services/incidentService';
import type { 
  Incident, 
  IncidentFormData, 
  FormErrors,
  Severity,
  Status,
  IncidentType 
} from '../types';

// Props interface
interface IncidentFormProps {
  incident: Incident | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Constants with type safety
const SEVERITY_OPTIONS: readonly Severity[] = ['low', 'medium', 'high', 'critical'] as const;
const STATUS_OPTIONS: readonly Status[] = ['open', 'investigating', 'resolved', 'closed'] as const;
const TYPE_OPTIONS: readonly IncidentType[] = [
  'malware', 'brute_force', 'phishing', 'unauthorized_access', 'data_exfiltration'
] as const;

function IncidentForm({ incident, onClose, onSuccess }: IncidentFormProps): JSX.Element {
  const isEditMode: boolean = Boolean(incident);
  
  const [formData, setFormData] = useState<IncidentFormData>({
    timestamp: '',
    source_ip: '',
    severity: 'medium',
    type: 'malware',
    status: 'open',
    description: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Type event handlers
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // ...
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    // ...
  };

  // ... rest of component
}

export default IncidentForm;
```

**Key Changes:**
- Import React event types: `ChangeEvent`, `FormEvent`
- Define props interface with callback types
- Use `as const` for readonly arrays
- Type all event handler parameters

---

## Step 4: Convert Frontend Services

### Overview
Convert API service files to TypeScript with proper typing for axios requests and responses.

### Files to Convert

| Original | New |
|----------|-----|
| `src/services/api.js` | `src/services/api.ts` |
| `src/services/incidentService.js` | `src/services/incidentService.ts` |

### src/services/api.ts

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

**Optional:** Add Vite environment type declarations in `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### src/services/incidentService.ts

```typescript
import api from './api';
import type { 
  Incident, 
  CreateIncidentData, 
  UpdateIncidentData,
  DeleteResponse 
} from '../types';
import type { AxiosResponse } from 'axios';

/**
 * Fetch all incidents, sorted by ID ascending
 */
export const getAllIncidents = async (): Promise<Incident[]> => {
  const response: AxiosResponse<Incident[]> = await api.get('/incidents');
  return response.data.sort((a, b) => a.id - b.id);
};

/**
 * Fetch a single incident by ID
 */
export const getIncidentById = async (id: number): Promise<Incident> => {
  const response: AxiosResponse<Incident> = await api.get(`/incidents/${id}`);
  return response.data;
};

/**
 * Create a new incident
 */
export const createIncident = async (
  incidentData: CreateIncidentData
): Promise<Incident> => {
  const response: AxiosResponse<Incident> = await api.post('/incidents', incidentData);
  return response.data;
};

/**
 * Update an existing incident
 */
export const updateIncident = async (
  id: number,
  incidentData: UpdateIncidentData
): Promise<Incident> => {
  const response: AxiosResponse<Incident> = await api.put(`/incidents/${id}`, incidentData);
  return response.data;
};

/**
 * Delete an incident
 */
export const deleteIncident = async (id: number): Promise<DeleteResponse> => {
  const response: AxiosResponse<DeleteResponse> = await api.delete(`/incidents/${id}`);
  return response.data;
};
```

**Key Changes:**
- Import and use `AxiosResponse<T>` generic
- Define return types for all functions
- Use typed parameters matching the interfaces

---

## Step 5: Update ESLint Configuration

### Overview
Configure ESLint to properly parse and lint TypeScript files.

### eslint.config.js

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist', 'node_modules'] },
  // JavaScript files (during migration)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
];
```

### Recommended TypeScript ESLint Rules

| Rule | Setting | Purpose |
|------|---------|---------|
| `no-unused-vars` | error | Catch unused variables |
| `no-explicit-any` | warn | Discourage `any` type |
| `explicit-function-return-type` | off | Allow inferred return types |
| `no-non-null-assertion` | warn | Discourage `!` assertions |

---

## Step 6: Update Vite Configuration

### Overview
Rename and optionally type the Vite configuration file.

### Rename File
```
vite.config.js → vite.config.ts
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Optional Enhancement:** Add path aliases to match `tsconfig.json` paths configuration.

---

## Step 7: Convert E2E Tests (Playwright)

### Overview
Convert Playwright E2E tests to TypeScript for better type safety in test assertions and API helpers.

### Files to Convert

| Original | New |
|----------|-----|
| `e2e/incidents.spec.js` | `e2e/incidents.spec.ts` |
| `e2e/helpers/api.js` | `e2e/helpers/api.ts` |
| `playwright.config.js` | `playwright.config.ts` |

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### e2e/helpers/api.ts

```typescript
import type { Incident, CreateIncidentData } from '../../src/types';

const API_BASE_URL = 'http://localhost:3000/api';

interface ApiHelpers {
  createTestIncident: (data?: Partial<CreateIncidentData>) => Promise<Incident>;
  deleteIncident: (id: number) => Promise<void>;
  getAllIncidents: () => Promise<Incident[]>;
  cleanupIncidents: (ids: number[]) => Promise<void>;
}

export const api: ApiHelpers = {
  createTestIncident: async (data = {}): Promise<Incident> => {
    const defaultData: CreateIncidentData = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      source_ip: '192.168.1.100',
      severity: 'medium',
      type: 'malware',
      status: 'open',
      description: 'Test incident',
      ...data,
    };
    
    const response = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultData),
    });
    
    return response.json();
  },

  deleteIncident: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/incidents/${id}`, {
      method: 'DELETE',
    });
  },

  getAllIncidents: async (): Promise<Incident[]> => {
    const response = await fetch(`${API_BASE_URL}/incidents`);
    return response.json();
  },

  cleanupIncidents: async (ids: number[]): Promise<void> => {
    await Promise.all(ids.map(id => api.deleteIncident(id)));
  },
};
```

### e2e/incidents.spec.ts (excerpt)

```typescript
import { test, expect, Page } from '@playwright/test';
import { api } from './helpers/api';
import type { Incident } from '../src/types';

test.describe('Incident Management', () => {
  let createdIncidentIds: number[] = [];

  test.afterEach(async () => {
    // Cleanup created incidents
    await api.cleanupIncidents(createdIncidentIds);
    createdIncidentIds = [];
  });

  test('should display incidents table', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should create new incident', async ({ page }: { page: Page }) => {
    const incident: Incident = await api.createTestIncident({
      severity: 'critical',
      description: 'E2E test incident',
    });
    createdIncidentIds.push(incident.id);

    await page.goto('/');
    await expect(page.locator(`text=${incident.source_ip}`)).toBeVisible();
  });
});
```

---

## Step 8: Update npm Scripts

### Overview
Update `package.json` scripts to support TypeScript compilation and type checking.

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

### Script Explanations

| Script | Purpose |
|--------|---------|
| `build` | Run TypeScript check (`tsc -b`), then build with Vite |
| `typecheck` | Standalone type checking without emitting files |
| `lint` | Lint both JS and TS files |
| `lint:fix` | Auto-fix linting issues |

---

## Step 9: Update Entry Point

### Overview
Update `index.html` to point to the TypeScript entry file.

### index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Endpoint Incident Log</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Change:** `/src/main.jsx` → `/src/main.tsx`

---

## Step 10: Verify Build and Type Checking

### Overview
Run all checks to ensure the TypeScript migration is successful.

### Commands to Run

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Run type checking
npm run typecheck

# 3. Run linting
npm run lint

# 4. Test development server
npm run dev

# 5. Test production build
npm run build

# 6. Run E2E tests
npm run test:e2e
```

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module './types'` | Types not exported | Create `src/types/index.ts` |
| `Property 'x' does not exist` | Missing interface property | Update interface definition |
| `Type 'null' is not assignable` | Strict null checks | Use union type: `Type \| null` |
| `Parameter 'x' implicitly has 'any' type` | Missing parameter type | Add type annotation |
| `Could not find declaration file` | Missing @types package | Install `@types/package-name` |

---

## Step 11: Clean Up and Final Validation

### Overview
Remove old JavaScript files and ensure everything is working correctly.

### Cleanup Checklist

- [ ] Delete all `.jsx` files after converting to `.tsx`
- [ ] Delete all `.js` service files after converting to `.ts`
- [ ] Remove any `// @ts-ignore` comments added temporarily
- [ ] Ensure no `any` types remain (or document why they're necessary)
- [ ] Update import paths if file extensions changed
- [ ] Remove backup files (if any)

### Final Validation

```bash
# Full validation sequence
npm run typecheck && npm run lint && npm run build && npm run test:e2e
```

### File Structure After Migration

```
frontend/
├── src/
│   ├── types/
│   │   ├── incident.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── IncidentForm.tsx
│   │   └── IncidentTable.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── incidentService.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── e2e/
│   ├── helpers/
│   │   └── api.ts
│   └── incidents.spec.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── playwright.config.ts
├── package.json
└── index.html
```

---

## Migration Order Recommendation

For the smoothest migration, follow this order:

1. **Step 1**: TypeScript config (no code changes yet)
2. **Step 2**: Define types (foundational)
3. **Step 4**: Services first (fewer dependencies)
4. **Step 3**: Components (use the typed services)
5. **Step 5-6**: Config files
6. **Step 8-9**: Scripts and entry point
7. **Step 10**: Verify everything works
8. **Step 7**: E2E tests (optional, can be done later)
9. **Step 11**: Cleanup

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)
- [Playwright TypeScript](https://playwright.dev/docs/test-typescript)

