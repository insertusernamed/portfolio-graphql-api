# Portfolio GraphQL API

GraphQL backend for my portfolio. It fetches repository data from GitHub GraphQL and exposes a smaller schema that the frontend can consume in one request.

## What It Does

- Serves a single GraphQL endpoint at `/graphql`
- Returns two project groups: `pinnedRepos` and `otherRepos`
- Excludes private repos and pinned duplicates from `otherRepos`
- Uses short-lived in-memory caching to reduce repeated GitHub calls
- Supports CORS for localhost and production portfolio domains

## Tech Stack

- Node.js + Express
- `graphql-http`
- GitHub GraphQL API
- Docker

## Environment Variables

Create `.env`:

```env
PORT=3003
GITHUB_TOKEN=your_github_token
NODE_ENV=development
```

## Run Locally

```sh
npm install
npm run dev
```

Server URL: `http://localhost:3003/graphql`

## Production Run

```sh
npm start
```

## Docker

```sh
docker build -t portfolio-graphql-api .
docker run --env-file .env -p 3003:3003 portfolio-graphql-api
```
