# Movie Review App (Dockerized)

Movie Review App with an AI chatbot, run with Docker Compose as 3 containers:

| Container | Image | Purpose |
|-----------|-------|---------|
| web | built from Dockerfile (Node + Express) | App + chat endpoint |
| db | mongo:7 | Stores reviews |
| ollama | ollama/ollama | Runs the AI model |

## Run
```bash
docker compose up --build -d
docker compose exec ollama ollama pull llama3.2:1b
docker compose ps
```
Open http://localhost:3000

## Stop
```bash
docker compose down        # keep data
docker compose down -v     # also delete data
```
