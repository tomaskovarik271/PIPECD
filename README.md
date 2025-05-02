# Custom CRM System (Project PipeCD)

This repository contains the source code for the custom CRM system designed to replace Pipedrive, built following the architectural decisions outlined in `ADR.md`.

## Overview

The system utilizes a serverless architecture based on:

*   **Frontend:** React (Vite) SPA hosted on Netlify
*   **API:** GraphQL Gateway (**GraphQL Yoga**) running as a Netlify Function (`netlify/functions/graphql.ts`)
*   **Backend Logic:** TypeScript modules in `/lib` (e.g., `contactService.ts`)
*   **Database:** Supabase (PostgreSQL) with RLS
*   **Authentication:** Supabase Auth (Email/Password, GitHub configured)
*   **Async Tasks:** Inngest (`netlify/functions/inngest.ts`)
*   **Hosting/Deployment:** Netlify (`netlify.toml`)

**Current Status:**
*   Core infrastructure is set up (Supabase, Netlify, Inngest).
*   Authentication (Email/Password, GitHub) is working.
*   Contact CRUD implemented.
*   Deal CRUD implemented.
*   Inngest event sending implemented for Contact & Deal creation (simple logging handlers).
*   Basic UI (Chakra UI) implemented for Auth, Contacts, and Deals.
*   Production deployment is live.

Refer to `ADR.md` for architectural decisions, `DEVELOPER_GUIDE.md` for technical details, and `ROADMAP.md` for the development plan and issue log.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (v9.5.0 or compatible)
*   Netlify CLI (`npm install -g netlify-cli`)
*   Supabase CLI (`npm install -g supabase`)
*   Docker (for running Supabase locally)

### Local Setup

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/tomaskovarik271/PIPECD.git
    cd PIPECD
    npm install # Installs root dependencies
    ```
2.  **Setup Local Environment:**
    *   Start Docker Desktop.
    *   Start local Supabase: `supabase start`. This may take a minute.
    *   Copy local keys to `.env`: Create a `.env` file in the root and add `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the `supabase status` output.
    *   Add local Inngest keys (from your Inngest Dev environment dashboard) to `.env`: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`.
    *   **(Optional)** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` if needed.
3.  **Initialize Local Database:** Apply existing schema migrations:
    ```bash
    # Ensure Supabase is running locally first!
    supabase db reset 
    ```
4.  **Start Development Server:**
    ```bash
    netlify dev
    ```
    *   This reads `netlify.toml`, loads `.env`, serves functions (e.g., GraphQL API at `http://localhost:8888/.netlify/functions/graphql`), and runs the frontend dev server (check output for frontend URL, e.g., `http://localhost:5173`).
    *   Access local Supabase Studio: `http://127.0.0.1:54323`
    *   Access local email catch-all (Inbucket): `http://127.0.0.1:54324`

### Verification (Local)

1.  Open the frontend URL from `netlify dev` output.
2.  Sign up/Log in using Email/Password or GitHub (GitHub requires local Supabase config).
3.  Verify Home page shows `API Health: Ok` and correct user status.
4.  Navigate to the Contacts page, create, edit, and delete a contact.
5.  Navigate to the Deals page, create, edit, and delete a deal. (Requires manual addition of test data locally - see `DEVELOPER_GUIDE.md`)

### Local Development Notes & Issues

*   **Inngest Build Warning:** You may see `Could not resolve "inngest/netlify"` during `netlify dev` startup. This is currently benign; the functions load correctly.
*   **Inngest Local Workflow:** 
    *   **Sending Events:** Works correctly from functions running within `netlify dev`.
    *   **Viewing Sent Events:** Run the Inngest Dev Server (`npx inngest-cli dev`) in a separate terminal to verify events are sent.
    *   **Testing Function Execution:** Due to limitations with `netlify dev`, testing the *execution* logic within your Inngest functions (in `netlify/functions/inngest.ts`) requires deploying to Netlify (Preview or Prod) and checking logs there.

## Deployment (Production)

*   **Live Site:** [`https://sprightly-macaron-c20bb0.netlify.app/`](https://sprightly-macaron-c20bb0.netlify.app/)
*   **Deployment:** Handled automatically by Netlify on pushes to the `main` branch.
*   **Environment Variables:** Requires specific variables set in the Netlify UI (**Site config -> Build & deploy -> Environment**):
    *   **Frontend Build:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (using *production* Supabase project URL & Anon key).
    *   **Function Runtime:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` (using *production* Supabase & Inngest keys).
*   **Supabase Config:** Requires GitHub OAuth provider keys and correct Site URL (`https://sprightly-macaron-c20bb0.netlify.app`) configured in the *production* Supabase project dashboard (**Authentication -> Providers** and **Authentication -> URL Configuration**).
*   **Database Migrations:** **Must be applied manually** to the production database from your local machine after linking the CLI. See `DEVELOPER_GUIDE.md`.

---
*This README reflects the current state and will be updated as the project evolves.* 