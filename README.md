# Promptflow

Promptflow is a monorepo for building, versioning, and running AI chat flows.  
Compose graphs in a visual builder, persist them with version history, and execute them through an OpenAI-backed Python engine.

## Architecture

```text
┌─────────────┐     /api/*      ┌──────────────┐   POST /execute   ┌─────────────┐
│   Frontend  │ ──────────────► │   Backend    │ ────────────────► │  AI Engine  │
│  React+Vite │ ◄────────────── │  Express API │ ◄──────────────── │   FastAPI   │
│  :3000      │   session auth  │  Sequelize   │   response+tokens │   :8000     │
└─────────────┘                 │  Postgres    │                   └──────┬──────┘
                                │  :5050       │                          │
                                └──────────────┘                          ▼
                                                                     OpenAI API
```

**Typical chat execute path**

1. User sends a message from the UI → `POST /api/chat/:id/execute`
2. Backend loads the chat flow, creates/reuses a runtime session, and loads history
3. Backend calls the AI engine with `flowId`, `flowData`, `sessionId`, `userMessage`, and `messages`
4. AI engine walks the graph (`chat_input` → `openai_llm` → `chat_output`, …) or falls back to a plain OpenAI chat if the graph is empty
5. Backend saves user/assistant messages (and optional node execution records) and returns the reply

## Repository layout

```text
promptflow/
├── frontend/     # Vite + React UI (flow builder, auth, dashboard)
├── backend/      # Express API, Passport sessions, Sequelize + Postgres
├── shared/       # Shared TypeScript schemas, roles, API constants
├── ai-engine/    # FastAPI OpenAI flow executor (Python)
└── docker/       # Dockerfiles + compose (optional)
```

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+ (3.12/3.14 fine if packages install)
- **PostgreSQL** running locally
- An **OpenAI API key** (for live chat execution)

> On many Macs, port **5000** is used by AirPlay Receiver. This project uses backend port **5050**.

## Quick start

### 1. Install JS dependencies

```bash
npm install
```

### 2. Configure environment files

Copy examples into local `.env` files (gitignored — never commit secrets):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-engine/.env.example ai-engine/.env
```

Edit at least:

| File | Required values |
|------|-----------------|
| `backend/.env` | `DATABASE_URL`, `SESSION_SECRET` |
| `ai-engine/.env` | `OPENAI_API_KEY` |

Shared local URLs (keep aligned across the three `.env` files):

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5050 |
| AI engine | http://localhost:8000 |

### 3. Database migrate + seed admin

Create a Postgres database named `flow` (or match your `DATABASE_URL`), then:

```bash
npm run migrate:push
npm run seed:admin
```

Default admin (change after first login):

- **Email:** `kesariadmin@gmail.com`
- **Password:** `Admin@1234`

### 4. Python AI engine venv

```bash
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 5. Run everything

From the repo root:

```bash
npm run dev
```

This starts:

- Frontend (Vite) on **3000**
- Backend (tsx) on **5050**
- AI engine (uvicorn via `.venv`) on **8000**

Open http://localhost:3000/login

## Auth

| Action | How |
|--------|-----|
| Sign in / Sign up | http://localhost:3000/login (tabs) or `/signup` |
| Public signup | `POST /api/auth/register` creates a `user` and starts a session |
| Session | Cookie-based Passport session (`credentials: "include"`) |
| Sign out | Header **Sign out** |

Password rules for signup: min 8 chars, upper + lower + number + special character.

## Using the product

### Create and save a flow

1. Sign in
2. Go to **Flows** → **New flow**
3. Default graph: **Chat Input → OpenAI LLM → Chat Output**
4. Configure the LLM node (model, temperature, system prompt) in the side panel
5. Click **Save**
   - First save **creates** the flow and **version 1**
   - Later saves **update** `flow_data` and create **version 2, 3, …**
6. Toolbar shows the current version badge (`vN`)

### Edit the canvas

- Right-click canvas → add node
- Click a node → config panel
- Right-click node → change type or **Delete node**
- Panel **Delete node**, or select + **Delete** / **Backspace** (not while typing in an input)

### Test a flow

1. Save the flow first (needs an id)
2. Enter a test message in the toolbar
3. Click **Play** → backend execute → AI engine → assistant reply (toast)

Requires `OPENAI_API_KEY` in `ai-engine/.env`.

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend + backend + AI engine |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run dev:ai` | AI engine only |
| `npm run migrate:push` | Apply DB migrations |
| `npm run migrate:generate` | Generate migrations |
| `npm run seed:admin` | Seed default admin user |
| `npm run build` | Build frontend + backend |
| `npm run check` | Backend TypeScript check |

## API surface (high level)

| Area | Base | Examples |
|------|------|----------|
| Auth | `/api/auth` | `POST /login`, `POST /register`, `POST /logout` |
| Session user | `/api/user` | `GET` current user |
| Chat flows | `/api/chat-flows` | CRUD, deploy, duplicate |
| Execute | `/api/chat/:id/execute` | Run a flow with a user message |
| Versions | `/api/flow-versions` | Create / list / restore versions |
| AI engine | `http://localhost:8000` | `GET /health`, `POST /execute` |

Frontend calls go through the Vite proxy (`/api` → `VITE_BACKEND_URL`, default `http://localhost:5050`).

## AI engine nodes (v1)

Supported by the Python executor today:

- `chat_input`, `chat_output`
- `openai_llm`
- `conditional`, `text_combiner`

The UI also lists nodes for later work (Anthropic, retrievers, tools, etc.). Graphs that only use unsupported types will not run fully until those nodes are implemented in `ai-engine/`.

If `flowData.nodes` is empty, the engine falls back to a single OpenAI chat completion using message history.

## Environment reference

### Backend (`backend/.env`)

```env
NODE_ENV=dev
PORT=5050
DATABASE_URL=postgres://USER@localhost:5432/flow
SESSION_SECRET=change-me
ALLOWED_ORIGINS=http://localhost:3000
AI_ENGINE_URL=http://localhost:8000
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:5050
VITE_AI_ENGINE_URL=http://localhost:8000
VITE_API_BASE_URL=          # empty → use Vite /api proxy
```

### AI engine (`ai-engine/.env`)

```env
HOST=0.0.0.0
PORT=8000
OPENAI_API_KEY=sk-...
DEFAULT_MODEL=gpt-4o-mini
```

`.env` files are gitignored. Commit only `*.env.example`.

## Docker (optional)

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build
```

See `docker/` for Dockerfiles and compose wiring.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend `EADDRINUSE` on 5000 | Use **5050** (already default). Disable AirPlay Receiver if you insist on 5000. |
| AI: `No module named uvicorn` | Use the venv: `ai-engine/.venv/bin/python -m uvicorn …` (`npm run dev` does this). |
| `Authentication required` on API | Sign in at `/login`; requests need cookies. |
| Execute fails | Set `OPENAI_API_KEY` in `ai-engine/.env` and confirm `GET http://localhost:8000/health`. |
| Flows list empty / errors | Confirm Postgres is up, migrations ran, and you are signed in. |
| Can’t delete a node | Use panel **Delete node**, context menu, or Delete/Backspace when not focused in an input. |

## License

MIT (see package metadata in workspaces).
