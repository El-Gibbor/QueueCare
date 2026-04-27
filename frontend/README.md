# QueueCare Frontend (React + Vite + Tailwind)

The browser interface for the QueueCare clinic appointment system. Implements the login, registration, appointment list and detail, appointment form, and today's queue screens. Authentication state is held in React Context and persisted to `localStorage`; every outbound API request is decorated with a `Bearer` JWT by an Axios interceptor.

## Live deployment

The frontend is hosted on Vercel at https://queue-care-psi.vercel.app/. However, the application **cannot be used through this link unless the backend is running locally on your machine first**.

The deployed frontend communicates with `http://localhost:3000` directly from your browser, Backend must be set up and running on your local machine on port 3000 before visiting the link. See [`backend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/backend/README.md) for backend setup instructions.

## Setup

From this `frontend/` directory:

```sh
npm install
cp .env.example .env
```

The `.env` file controls one variable, `VITE_API_URL`, which determines the backend base URL the bundle calls. Defaults to`http://localhost:3000`

## Running

```sh
npm run dev      
```

The dev server listens on `http://localhost:5173`. A Vite proxy rewrite forwards `/api/*` requests to `http://localhost:3000` (see `vite.config.js`)


## Test selectors

Every interactive element carries a `data-cy` attribute generated through `src/utils/cy.js`. Cypress specs target these attributes exclusively.
