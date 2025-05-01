# Custom CRM System (Project PipeCD)

This repository contains the source code for the custom CRM system designed to replace Pipedrive, built following the architectural decisions outlined in `ADR.md`.

## Overview

The system utilizes a serverless architecture based on:

*   **Frontend:** React (Vite) SPA hosted on Netlify (To be implemented)
*   **API:** GraphQL Gateway (**GraphQL Yoga**) running as a Netlify Function (`netlify/functions/graphql.ts`)
*   **Backend Logic:** TypeScript modules in `/lib` (e.g., `lib/supabaseClient.ts`)
*   **Database:** Supabase (PostgreSQL) with RLS
*   **Authentication:** Supabase Auth (To be implemented)
*   **Async Tasks:** Inngest (`netlify/functions/inngest.ts`)
*   **Hosting/Deployment:** Netlify (`netlify.toml`)

**Key Runtime Dependencies:**
*   `graphql`, `graphql-yoga`
*   `inngest`
*   `@supabase/supabase-js`

Refer to `ADR.md` for detailed architectural decisions and `ROADMAP.md` for the development plan. See `tsconfig.json` for TypeScript configuration.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended - see `engines` in `package.json` if added)
*   npm (v9.5.0 or compatible)
*   Netlify CLI (`npm install -g netlify-cli`)
*   Supabase CLI (`npm install -g supabase`)
*   Docker (for running Supabase locally)

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tomaskovarik271/PIPECD.git
    cd PIPECD
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Environment Variables:**
    *   Create a `.env` file in the project root.
    *   Login to Supabase CLI (`supabase login` if needed).
    *   Start Supabase services: `supabase start`
    *   Retrieve local Supabase credentials: `supabase status`
    *   Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the status output to your `.env` file.
    *   Optionally add `SUPABASE_SERVICE_ROLE_KEY` if needed for admin tasks.
    *   Obtain Inngest keys (Event Key, Signing Key) from your Inngest dashboard and add them to `.env` as `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.
    *   *(See `lib/supabaseClient.ts` for required variable names)*
4.  **Run Database Migrations (if any exist):**
    ```bash
    # Example: Apply all migrations
    # supabase db reset 
    # OR apply the latest migration if already initialized
    # supabase migration up
    ```
5.  **Start the development server:**
    ```bash
    netlify dev
    ```
    *   This command reads `netlify.toml`, loads variables from `.env`, and serves functions locally (default: `http://localhost:8888`).
    *   **Note:** You may see an error `Could not resolve "inngest/netlify"` during startup. This seems related to the Inngest package exports, but the functions may still load correctly. Monitor runtime behavior.
    *   Access the GraphQL endpoint at `/.netlify/functions/graphql` (e.g., `http://localhost:8888/.netlify/functions/graphql`).

## Running Locally & Verification

After completing the Local Setup:

1.  **Ensure Supabase is running:** If not already started from setup, run `supabase start` in the project root.
2.  **Start Netlify Dev Server:** In the project root, run:
    ```bash
    netlify dev 
    ```
    *   This serves the backend functions (API, Inngest handler) typically at `http://localhost:8888`.
    *   Monitor the output for errors (like the known Inngest resolution issue).
3.  **Test Backend API:**
    *   Open `http://localhost:8888/.netlify/functions/graphql` in your browser.
    *   Use the GraphiQL interface to execute queries like:
        ```graphql
        query VerifyBackend {
          health
          supabaseConnectionTest
        }
        ```
    *   You should see a successful response confirming the API is up and connected to Supabase.
4.  **Start Frontend Dev Server:** In a **separate terminal**, navigate to the frontend directory and run:
    ```bash
    cd frontend
    npm run dev
    ```
    *   This starts the Vite dev server, typically at `http://localhost:5173` (check terminal output for the exact URL).
5.  **Test Frontend App & Auth:**
    *   Open the Vite server URL (e.g., `http://localhost:5173`) in your browser.
    *   You should see the Supabase Auth UI.
    *   **Sign Up:** Create a new user via the UI. Check local Inbucket (`http://127.0.0.1:54324`) for the confirmation email if needed.
    *   **Log In:** Log in with the new credentials.
    *   **Verify:** Once logged in, the Home page should show:
        *   `API Health: Ok`
        *   `User Status: Logged in as: <your-email> (ID: <your-id>)`
    *   Navigate between Home/About links.
    *   **Sign Out:** Use the Sign Out button, which should return you to the Auth UI.
6.  **(Optional) Test Backend Auth Query:**
    *   While logged in on the frontend, open the backend GraphiQL (`http://localhost:8888/.netlify/functions/graphql`).
    *   You cannot directly pass the token via GraphiQL easily. However, you can verify the *unauthenticated* state by running:
        ```graphql
        query CheckMe {
          me {
            id
            email
          }
        }
        ```
    *   This should return `"me": null`, confirming the resolver requires authentication.

## Development

*   **Frontend:** Navigate to `frontend/` directory (once initialized).
*   **Backend Logic:** Modify files within the `/lib` directory.
*   **GraphQL Schema/Resolvers:** Edit `netlify/functions/graphql.ts`.
*   **Inngest Functions:** Edit `netlify/functions/inngest.ts`.
*   **Database Migrations:** Use `supabase migrations create <migration_name>` and edit the generated SQL file in `supabase/migrations/`. Apply locally using `supabase db reset` (destructive) or other `migration` commands.

## Deployment

Deployment is handled by Netlify, connected to the `main` branch of the GitHub repository. Ensure necessary environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, etc.) are set in the Netlify UI for the deployed site.

---
*This README reflects the current state and will be updated as the project evolves.* 