# 📚 Book Store API

A hybrid **REST + GraphQL** backend for a book store, built with Node.js, Express, MongoDB, and Redis.

It includes authentication (JWT), image uploads (Cloudinary), API versioning, rate limiting, CORS, and a Redis Pub/Sub event system.

---

## 🧰 Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js 20                          |
| Web framework    | Express 5                           |
| GraphQL          | Apollo Server                       |
| Database         | MongoDB (Mongoose)                  |
| Cache / Pub-Sub  | Redis                               |
| Auth             | JWT (jsonwebtoken)                  |
| File uploads     | Multer + Cloudinary                 |
| Containerization | Docker + Docker Compose             |

---

## 📁 Endpoints

Once running, the server exposes:

- REST: `http://localhost:8080/api/v1/books`
- REST: `http://localhost:8080/api/v1/auth`
- GraphQL: `http://localhost:8080/graphql`
- Health check: `http://localhost:8080/healthcheck`

---

## ⚙️ Environment Variables

This project needs a `.env` file. The repo **does not include** the real `.env`
(it holds secrets). Instead, copy the provided example and fill in your values:

```bash
cp .env.example .env
```

| Variable                | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `PORT`                  | Port the server runs on (e.g. `8080`)          |
| `ALLOWED_VERSION`       | Allowed API version (e.g. `v1`)                |
| `MONGO_URL`             | MongoDB connection string                      |
| `REDIS_HOST`            | Redis host                                     |
| `REDIS_PORT`            | Redis port (default `6379`)                    |
| `JWT_SECRET`            | Secret used to sign JWT tokens                 |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name                     |
| `CLOUDINARY_API_KEY`    | Your Cloudinary API key                        |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret                     |
| `FRONTEND_URL`          | Frontend origin allowed by CORS                |

---

## 🚀 Running the Project

There are **two ways** to run this project. Pick whichever you prefer.

### Method 1 — Manual (Node.js on your machine)

Use this if you already have MongoDB and Redis installed and running locally.

**Prerequisites:**
- Node.js 20+
- A running MongoDB instance (default `mongodb://localhost:27017`)
- A running Redis instance (default `localhost:6379`)

**Steps:**

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd book-store-api

# 2. Create your .env file from the example
cp .env.example .env
# then open .env and fill in your real values

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start the server
npm start
# or for auto-reload during development:
npm run dev
```

> In this mode, `.env` uses `localhost` for MongoDB and Redis because
> everything runs directly on your machine.

---

### Method 2 — Docker Compose (recommended, zero manual setup)

Use this if you **don't** want to install MongoDB / Redis yourself.
Docker will spin up MongoDB, Redis, and the app together in isolated containers.

**Prerequisites:**
- Docker Desktop installed and running

**Steps:**

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd book-store-api

# 2. Create your .env file from the example
cp .env.example .env
# then open .env and fill in your real values (JWT_SECRET, Cloudinary keys, etc.)

# 3. Build and start all containers
docker-compose up --build
```

That's it. Docker Compose reads your `.env` for the `${...}` values and starts
three services:

| Service            | What it is        | Port          |
| ------------------ | ----------------- | ------------- |
| `mongodb_database` | MongoDB           | `27017`       |
| `redis_database`   | Redis             | `6379`        |
| `web-app`          | This Node.js API  | `${PORT}`     |

> ⚠️ Inside Docker, the app talks to MongoDB and Redis using the **service
> names** (`mongodb_database`, `redis_database`) instead of `localhost`.
> Docker Compose sets these automatically — you don't change `.env` for that.

**Useful Docker commands:**

```bash
docker-compose up --build     # build images and start
docker-compose up -d          # start in background (detached)
docker-compose logs -f web-app  # follow the app's logs
docker-compose down           # stop and remove containers
```

---

## � Docker Hub: What others can run

If you push your Docker image to Docker Hub and make it public, others can run it
without cloning your Git repository.

Example commands they would use:

```bash
docker pull yourusername/book-store-api:latest

docker run -d -p 8080:8080 \
  -e PORT=8080 \
  -e JWT_SECRET=their_jwt_secret \
  -e CLOUDINARY_CLOUD_NAME=... \
  -e CLOUDINARY_API_KEY=... \
  -e CLOUDINARY_API_SECRET=... \
  -e FRONTEND_URL=http://localhost:3000 \
  -e ALLOWED_VERSION=v1 \
  yourusername/book-store-api:latest
```

Or with `docker-compose.yml` if you publish a compose setup that uses your image.

### Does pushing to Docker Hub share my code?

- If you push a **public image**, anyone can pull and run that image.
- The Docker image contains your app files and dependencies, so the code is
  packaged inside the image.
- Users do not need your Git repo to run it, but they can still inspect the image
  and extract files if they want to.
- If you want to keep code private, do not publish a public image; use a
  private Docker Hub repository or keep running from your repo only.

---

## �📝 Notes

- `.env` is git-ignored on purpose — never commit real secrets.
- Cloudinary keys are personal; each developer must use their own account.
- If a port is already in use, change `PORT` in `.env` and restart.
