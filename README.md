# Custom CRM System (Project PipeCD)

This repository contains the source code for the custom CRM system designed to replace Pipedrive, built following the architectural decisions outlined in `ADR.md`.

## Overview

The system utilizes a serverless architecture based on:

*   **Frontend:** React (Vite) SPA hosted on Netlify
*   **API:** GraphQL Gateway (Apollo Server) running as a Netlify Function
*   **Backend Logic:** TypeScript modules in `/lib`
*   **Database:** Supabase (PostgreSQL) with RLS
*   **Authentication:** Supabase Auth
*   **Async Tasks:** Inngest
*   **Hosting/Deployment:** Netlify

Refer to `ADR.md` for detailed architectural decisions and `ROADMAP.md` for the development plan.

## Getting Started

### Prerequisites

*   Node.js (LTS version - check `.nvmrc` or `package.json` engines field once added)
*   npm or yarn
*   Netlify CLI (`npm install -g netlify-cli`)
*   Supabase CLI (`npm install -g supabase`)

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # (Might need separate installs for frontend/ later)
    ```
3.  **Setup Environment Variables:**
    *   Copy `.env.example` (to be created) to `.env`.
    *   Login to Supabase CLI (`supabase login`).
    *   Start Supabase services (`supabase start`).
    *   Retrieve local Supabase credentials (`supabase status`) and populate `.env` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
    *   Obtain Inngest keys (signing and event keys) from your Inngest project and add them to `.env` (`INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY`).
4.  **Run Database Migrations:**
    ```bash
    # (Command to run Supabase migrations - e.g., supabase db reset or apply specific migration)
    ```
5.  **Start the development server:**
    ```bash
    netlify dev
    ```
    This should start the frontend dev server and the Netlify functions (including the GraphQL gateway).

## Development

*   **Frontend:** Navigate to `frontend/` directory. Standard React/Vite development workflow.
*   **Backend Logic:** Modify files within the `/lib` directory.
*   **GraphQL Schema:** Update schema definitions (likely within `netlify/functions/graphql/` or a shared location).
*   **Netlify Functions:** Add/modify functions in `netlify/functions/`.
*   **Database Migrations:** Use `supabase migrations create <migration_name>` and edit the generated SQL file. Apply locally with `supabase db reset` (for clean slate) or specific apply commands.

## Deployment

Deployment is handled by Netlify, triggered by pushes to the main branch (or configured branches). Preview deployments are generated for pull requests.

---
*This README is a starting point and will be updated as the project evolves.* 