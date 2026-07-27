# CI/CD Pipeline & Deployment Guide

Welcome to the CI/CD and Containerization documentation for the **Fullstack Chat Application**. This guide explains how Continuous Integration (CI) and Continuous Deployment (CD) are configured, how to run containerized setups locally using Docker Compose, and how to configure cloud deployments.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Local Containerized Setup (Docker Compose)](#local-containerized-setup-docker-compose)
3. [GitHub Actions Pipelines](#github-actions-pipelines)
4. [Configuring GitHub Secrets](#configuring-github-secrets)
5. [Deploying to Production Cloud Services](#deploying-to-production-cloud-services)
6. [Monitoring & Health Probes](#monitoring--health-probes)

---

## Architecture Overview

```
                      +------------------------------------------+
                      |         GitHub Push / Pull Request       |
                      +--------------------+---------------------+
                                           |
                    +----------------------v----------------------+
                    |           GitHub Actions Runner             |
                    +------------------+--------------------------+
                                       |
          +----------------------------+----------------------------+
          |                                                         |
+---------v-------------------+                         +-----------v---------------------+
|      CI Pipeline (ci.yml)    |                         |      CD Pipeline (cd.yml)       |
+-----------------------------+                         +---------------------------------+
| 1. ESLint Code Audit        |                         | 1. Build Multi-arch Containers  |
| 2. Backend API Unit Tests   |                         | 2. Push to GitHub Container     |
| 3. Frontend Production Build|                         |    Registry (ghcr.io)           |
| 4. Docker Build Sanity      |                         | 3. Create Automated Releases    |
+-----------------------------+                         | 4. Trigger Cloud Webhooks       |
                                                        +---------------------------------+
```

---

## Local Containerized Setup (Docker Compose)

You can run the entire fullstack environment (Backend, Frontend, and MongoDB) with a single command without installing MongoDB or Node locally.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Available Commands

| Command | Action |
| :--- | :--- |
| `npm run docker:up` | Builds images and starts all services (Frontend, Backend, MongoDB) in detached mode. |
| `npm run docker:down` | Stops and removes all active containers and networks. |
| `npm run docker:build` | Rebuilds Docker container images from source. |

### Accessing Local Container Services
- **Frontend SPA**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:5001` (Port 5001)
- **API Health Check**: `http://localhost:5001/api/health`
- **MongoDB Database**: `mongodb://localhost:27017`

---

## GitHub Actions Pipelines

### 1. Continuous Integration (`.github/workflows/ci.yml`)
Runs automatically on every `push` or `pull_request` targeting `main`, `master`, or `develop` branches.

**Workflow Jobs:**
- **Code Quality & Audit**: Runs ESLint checks on the frontend and performs dependency audit.
- **Backend API & Health Tests**: Runs automated tests against Express API routes and `/api/health`.
- **Frontend Production Build Verification**: Compiles Vite/React app to ensure clean builds.
- **Docker Image Build Validation**: Validates that both backend and frontend `Dockerfile`s build cleanly without errors.

### 2. Continuous Deployment (`.github/workflows/cd.yml`)
Runs automatically on every `push` to `main` branch or when a release tag (e.g., `v1.0.0`) is pushed.

**Workflow Jobs:**
- **Build & Publish Docker Images**: Compiles production Docker images and publishes them to **GitHub Container Registry (`ghcr.io`)**.
- **Draft Release on Version Tag**: Creates automated release notes on GitHub when tags starting with `v` are pushed.
- **Trigger Remote Cloud Deployment**: Triggers automated webhooks to update cloud deployment hosts.

---

## Configuring GitHub Secrets

To allow GitHub Actions and deployment workflows to operate seamlessly, configure the following secrets in your repository settings:

`GitHub Repository -> Settings -> Secrets and variables -> Actions`

| Secret Name | Required for | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | Deployment & CI Integration | MongoDB connection string (Atlas or hosted MongoDB). |
| `JWT_SECRET` | Backend Authentication | Secret key used for signing JWT cookies and tokens. |
| `CLOUDINARY_CLOUD_NAME` | Media Uploads | Cloudinary cloud identifier. |
| `CLOUDINARY_API_KEY` | Media Uploads | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Media Uploads | Cloudinary API Secret. |
| `DEPLOY_WEBHOOK_URL` | Cloud Deployment (Optional) | Deploy hook URL (e.g. Render / Railway / Deploy trigger URL). |

---

## Deploying to Production Cloud Services

### Option A: Render / Railway / Fly.io (Container Deployments)
1. Link your GitHub repository to your cloud dashboard.
2. Environment Settings:
   - **Backend Service**: Set build/runtime to Docker, using `backend/Dockerfile` (or set Root Directory to `backend`). Set `PORT=5001`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`.
   - **Frontend Service**: Set build/runtime to Docker, using `frontend/Dockerfile` (or set Root Directory to `frontend`).
3. Copy the service **Deploy Hook URL** from Render/Railway and add it as `DEPLOY_WEBHOOK_URL` in GitHub Secrets. Every successful merge to `main` will automatically trigger a production deployment!

### Option B: Docker Hub or GHCR on VPS / AWS EC2
If deploying to an AWS EC2 instance or Linux VPS:
1. Pull production compose config:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
2. The containers will automatically start and restart on host reboot.

---

## Monitoring & Health Probes

### Health Check Endpoint
The backend includes a dedicated health endpoint at `/api/health`.

**Sample Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-07-27T13:30:00.000Z",
  "uptime": 342.15,
  "environment": "production"
}
```

This endpoint is used by Docker container health probes, load balancers, and CI pipelines to ensure continuous uptime.
