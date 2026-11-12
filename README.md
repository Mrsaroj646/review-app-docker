# 🎬 Movie Review App (Dockerized)

A full-stack web application where users can post movie reviews and chat with an
AI movie assistant that recommends films based on those reviews. The whole system
runs locally as a set of Docker containers orchestrated with Docker Compose.

> Course project — demonstrates REST API design, NoSQL persistence, containerisation
> and integration of a locally hosted Large Language Model (LLM).

---

## Features

- Create, list and delete movie reviews (title, 1–5 star rating, comment)
- AI chatbot that uses the latest reviews as context for its recommendations
- Input validation on both the client and the server
- Health-check endpoint and Docker health checks
- Data persisted in named Docker volumes
- Responsive single-page UI (works on mobile)

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | HTML5, CSS3, vanilla JavaScript    |
| Backend    | Node.js 20, Express 4              |
| Database   | MongoDB 7 (via Mongoose ODM)       |
| AI model   | Ollama running `llama3.2:1b`       |
| DevOps     | Docker, Docker Compose             |

## System Architecture

```
 Browser ──HTTP──▶  web (Express, :3000) ──▶  db (MongoDB, :27017)
                         │
                         └──────HTTP──────▶  ollama (LLM, :11434)
```

| Container     | Image                     | Purpose                                 |
|---------------|---------------------------|-----------------------------------------|
| `web`         | built from `Dockerfile`   | Serves the UI and REST API              |
| `db`          | `mongo:7`                 | Stores reviews                          |
| `ollama`      | `ollama/ollama`           | Runs the language model                 |
| `ollama-pull` | `ollama/ollama`           | One-off job that downloads the model    |

## Project Structure

```
review-app-docker/
├── public/                 # Static frontend
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── src/                    # Backend source
│   ├── server.js           # App entry point
│   ├── config.js           # Environment-based configuration
│   ├── models/Review.js    # Mongoose schema
│   └── routes/
│       ├── reviews.js      # /api/reviews endpoints
│       └── chat.js         # /api/chat endpoint (Ollama)
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- ~2 GB of free disk space for the AI model

### Run with Docker (recommended)

```bash
docker compose up --build -d
```

The `ollama-pull` container downloads the model automatically on first start
(this can take a few minutes). Check progress with:

```bash
docker compose logs -f ollama-pull
```

Then open **http://localhost:3000**.

To use a different model:

```bash
OLLAMA_MODEL=llama3.2:3b docker compose up -d
```

### Stop

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and delete all data
```

### Run without Docker (development)

Requires Node.js 20+, a local MongoDB and Ollama.

```bash
cp .env.example .env
npm install
npm run dev
```

## API Reference

| Method | Endpoint             | Body                                   | Description              |
|--------|----------------------|----------------------------------------|--------------------------|
| GET    | `/api/health`        | –                                      | Server and DB status     |
| GET    | `/api/reviews`       | –                                      | List reviews (newest first) |
| POST   | `/api/reviews`       | `{ "title", "rating", "text" }`        | Create a review          |
| DELETE | `/api/reviews/:id`   | –                                      | Delete a review          |
| POST   | `/api/chat`          | `{ "message" }`                        | Ask the AI assistant     |

Errors are returned as `{ "error": "message" }` with an appropriate HTTP status
(`400` validation, `404` not found, `502` AI unavailable, `500` server error).

Example:

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","rating":5,"text":"Mind-bending!"}'
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chat says "AI assistant is not available" | The model is still downloading — check `docker compose logs ollama-pull` |
| Port 3000 already in use | Change the mapping in `docker-compose.yml` to e.g. `"3001:3000"` |
| Slow AI replies | Normal on CPU-only machines; try a smaller model |

## Future Improvements

- User accounts and authentication
- Edit existing reviews
- Fetch movie posters from a public movie API
- Automated tests (Jest + Supertest) and a CI pipeline

## Author

**Mrsaroj646** — Undergraduate project

## License

This project is released under the [MIT License](LICENSE).
