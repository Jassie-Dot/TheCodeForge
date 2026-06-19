# The Code Forge

A responsive React, TypeScript, Tailwind, and Motion landing page for The Code Forge.

## Run Locally

Create `.env.local` from `.env.example` and add your Google AI Studio key:

```bash
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

```bash
npm install
npm run dev
```

The development server runs on Vite, usually at `http://127.0.0.1:5173/`.

The floating AI assistant uses Gemini 2.5 Flash through `/api/chat`. Appointment requests and email briefs are delivered through the same Web3Forms contact channel as the main contact form.
