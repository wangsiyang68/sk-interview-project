# SK Interview Project — Endpoint Incident Log Processor

## Overview

Build a full-stack web application that allows a security analyst to view and manage endpoint incident logs. The application should demonstrate your ability to build a complete CRUD interface with a modern web stack.

## Tech Stack

- **Frontend:** React with Tailwind CSS
- **Backend:** Node.js with Express or equivalent 
- **Database:** MongoDB, PostgreSQL or MySQL

## Requirements

### Data Model — `incidents`

| Field | Type | Description |
|---|---|---|
| `id` | UUID or Auto-increment | Primary key |
| `timestamp` | DateTime | When the incident occurred |
| `source_ip` | String | Origin IP address |
| `severity` | Enum | `low`, `medium`, `high`, `critical` |
| `type` | String | e.g. `malware`, `brute_force`, `phishing`, `unauthorized_access`, `data_exfiltration` |
| `status` | Enum | `open`, `investigating`, `resolved`, `closed` |
| `description` | Text | Incident summary |

### CRUD Operations

1. **Create** — Add a new incident log via a form. *In production, incidents would be ingested automatically from a SIEM, EDR agent, or API. For this project, a manual form is sufficient.*
2. **Read** — Display all incidents in a table
3. **Update** — Edit an incident's details or change its status
4. **Delete** — Remove an incident

### UI Requirements

- Incidents displayed in a **table** with all fields visible
- Severity should be **color-coded** (e.g. red for critical, orange for high, yellow for medium, green for low)

## Bonus Features

These are not required but will strengthen your submission:

- **Sorting** — Sort the table by timestamp or severity
- **Filtering/search** — Filter by severity, status, or IP address
- **Pagination** — Paginate the table for large datasets
- **Additional fields** — `destination_ip`, `endpoint_hostname`, `analyst_notes`
- **Bulk JSON import** — Upload and parse a JSON file of incident records
- **Dashboard summary** — Show counts by severity or status
- **Input validation** — Validate IP address format, sanitize inputs

## Getting Started

1. Fork or clone this repository
2. Set up your frontend and backend in this project
3. Include a seed script or sample data so reviewers can test with realistic data
4. Update this section with your own setup and run instructions

## Submission

Submit your work by opening a **Pull Request** against the `main` branch of this repository.

## Evaluation Criteria

| Area | What We Look For |
|---|---|
| **Functionality** | All CRUD operations work correctly |
| **Code Quality** | Clean, readable, well-organized code |
| **Database Design** | Proper schema with appropriate types |
| **UI/UX** | Clear layout and intuitive interaction |
| **Security Awareness** | Input validation, parameterized queries |
| **Documentation** | Clear setup instructions |
