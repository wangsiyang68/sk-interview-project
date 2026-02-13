# Frontend Development Workflow

## Step 1: Project Setup & Configuration ✅
- Initialize a React project using Vite
- Install dependencies: Tailwind CSS, axios
- Configure Tailwind CSS
- Set up project folder structure: `components/`, `services/`, `hooks/`, `pages/`
- Configure API base URL 

## Step 2: API Service Layer ✅
Create a service module to interact with the backend endpoints:

| Function | HTTP Method | Endpoint |
|----------|-------------|----------|
| `getAllIncidents()` | GET | `/api/incidents` |
| `getIncidentById(id)` | GET | `/api/incidents/:id` |
| `createIncident(data)` | POST | `/api/incidents` |
| `updateIncident(id, data)` | PUT | `/api/incidents/:id` |
| `deleteIncident(id)` | DELETE | `/api/incidents/:id` |

## Step 3: Incidents Table Component (Read) ✅
- Build a table component displaying all incident fields:
  - `id`, `timestamp`, `source_ip`, `severity`, `type`, `status`, `description`
- Implement severity color-coding:
  - 🔴 `critical` → red
  - 🟠 `high` → orange
  - 🟡 `medium` → yellow
  - 🟢 `low` → green
- Add action buttons per row: **Edit** and **Delete**
- Handle loading and error states

## Step 4: Incident Form Component (Create/Update) ✅
- Build a reusable form with fields:
  - `timestamp` — datetime picker input
  - `source_ip` — text input (with IP format validation)
  - `severity` — dropdown: `low`, `medium`, `high`, `critical`
  - `type` — dropdown or text: `malware`, `brute_force`, `phishing`, `unauthorized_access`, `data_exfiltration`
  - `status` — dropdown: `open`, `investigating`, `resolved`, `closed`
  - `description` — textarea
- Form should work in two modes:
  - **Create mode** — empty form, POST on submit
  - **Edit mode** — pre-filled with existing data, PUT on submit
- Add client-side validation (required fields, IP format)

## Step 5: Delete Confirmation
- Implement a confirmation modal or dialog before deleting an incident
- Call the DELETE endpoint on confirmation
- Update the table after successful deletion

## Step 6: State Management & Data Flow ✅
- Use React state (`useState`) or a state management approach to:
  - Store the list of incidents
  - Track which incident is being edited
  - Manage modal/form visibility states
- Implement a `useEffect` hook to fetch incidents on mount
- Create a refresh function to reload data after CRUD operations

## Step 7: Main Layout & Page Composition
- Create the main page layout with:
  - Header/title: "Endpoint Incident Log"
  - "Add New Incident" button to open the create form
  - Incidents table
  - Modal/drawer for the form (create/edit)
- Apply Tailwind styling for a clean, modern UI

## Step 8: UI Polish & Error Handling
- Add loading spinners during API calls
- Display error messages for failed operations (toast notifications or inline alerts)
- Format timestamps for readability
- Ensure responsive design (table scrolls on mobile)
- Add hover/focus states for interactivity

---

## Bonus Steps (Optional Enhancements)

| Feature | Description |
|---------|-------------|
| **Sorting** | Add clickable column headers to sort by `timestamp` or `severity` |
| **Filtering** | Add dropdowns/inputs to filter by `severity`, `status`, or `source_ip` |
| **Pagination** | Implement client-side or server-side pagination for large datasets |
| **Dashboard Summary** | Show counts by severity/status using cards or charts |
| **Bulk JSON Import** | File upload input to parse and POST multiple incidents |

