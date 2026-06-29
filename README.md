# Promptflow

Modular monolith monorepo for a Flowise-like AI chat platform.

## Structure

```
promptflow/
├── frontend/       # Vite + React
├── backend/        # Express API, auth, DB (Sequelize)
├── shared/         # Shared schemas, constants, types
├── ai-engine/      # FastAPI flow execution (Python)
└── docker/         # Dockerfiles + docker-compose
```

## Local development

```bash
# Install dependencies (root workspaces)
npm install

# Backend env
cp backend/.env.example backend/.env

# Migrations + seed admin
npm run migrate:push
npm run seed:admin

# Python AI engine (optional, separate venv)
cd ai-engine && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run all services
npm run dev
```

| Service   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:5000  |
| AI Engine | http://localhost:8000  |

## Docker

```bash
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build
```
