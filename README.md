# IDK.exe

IDK.exe is a parody search engine that answers everyday questions with one
short, confident, and intentionally useless result. Choose a personality,
ask anything, and get a funny answer tailored to the exact query.

The app works in two layers:

- A React and Vite frontend for searching, personality selection, loading
  states, and result display.
- An Express backend that generates answers with Google Gemini or Anthropic
  Claude. When the backend is unavailable or no API key is configured, the
  frontend uses its built-in semantic fallback engine.

## Features

- Query-aware parody answers generated on demand
- Simple, savage, Gen-Z, professor, mystic, and corporate personalities
- Gemini-first AI generation with optional Anthropic support
- Offline semantic fallback with no API key required
- JSON response validation and query length protection
- Per-IP rate limiting of 30 requests per minute

## Tech stack

- React 19
- Vite
- Express
- Google Gemini via `@google/genai`
- Optional Anthropic Claude via `@anthropic-ai/sdk`

## Project structure

```text
.
├── src/                       # React frontend
│   ├── components/            # Search bar, result card, and loader
│   ├── lib/fallbackResults.js # Offline query-aware answer engine
│   ├── App.jsx
│   └── main.jsx
├── server/                    # Express AI backend
│   ├── lib/promptEngine.js    # Prompt construction and response parsing
│   ├── index.js               # API routes and provider selection
│   └── .env.example
├── index.html
└── vite.config.js             # Development proxy for /api
```

## Requirements

- Node.js 18 or newer
- npm
- A Google Gemini API key for live AI results (optional)

## Getting started

Install the frontend and backend dependencies:

```bash
npm run setup
```

Create the backend environment file:

```bash
cp server/.env.example server/.env
```

Set `GEMINI_API_KEY` in `server/.env` to enable Gemini. You can optionally
set `ANTHROPIC_API_KEY`; Anthropic is used when Gemini is not configured.

Start the frontend and backend together:

```bash
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser. To run
the services separately, use `npm run dev` for Vite and `npm run server` for
the API at [http://localhost:3001](http://localhost:3001).

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | No | - | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Gemini model name |
| `ANTHROPIC_API_KEY` | No | - | Optional Claude API key |
| `ANTHROPIC_MODEL` | No | `claude-3-5-haiku-20241022` | Claude model name |
| `PORT` | No | `3001` | Backend port |

Never commit `server/.env` or any API keys. The repository ignores local
environment files and includes `server/.env.example` as a safe template.

## API

### `POST /api/search`

Request body:

```json
{
  "query": "Why is my code broken?",
  "personality": "savage"
}
```

The query must be a non-empty string of at most 200 characters. The response
contains one generated result, its provider, or a fallback instruction when
no AI provider is available.

### `GET /api/health`

Returns the backend status, active provider, and configured model.

## Available scripts

```bash
npm run dev       # Start the Vite development server
npm run server    # Start the backend in watch mode
npm run dev:all   # Start frontend and backend together
npm run build     # Build the frontend for production
npm run preview   # Preview the production frontend build
npm run lint      # Run ESLint
```

To run the backend in production mode:

```bash
npm run start --prefix server
```

The Vite development server proxies `/api` requests to `http://localhost:3001`.
For deployment, serve the frontend and backend behind the same origin or
replace that proxy with the URL of the deployed API.
