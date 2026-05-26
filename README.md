# LLMetrics: Lightweight LLM Inference Logging & Ingestion System

An enterprise-ready, premium-grade telemetry, logging, and ingestion pipeline for Large Language Model (LLM) applications. Built with **Node.js**, **Express**, **Knex.js**, **PostgreSQL**, **Redis**, **BullMQ**, and **React (Vite)**.

---

## 🚀 Key Features

*   **⚡ Near Real-Time SDK Wrapping**: Seamless wrapper around OpenAI, Anthropic, and Google Gemini API calls capturing performance metadata (latency, TTFT, tokens, previews).
*   **📡 Async Ingestion Pipeline**: Decoupled ingestion service that buffers, validates, and routes logs via Redis and BullMQ background workers to prevent clogging LLM application execution.
*   **🛡️ Automated PII Redaction**: Robust built-in regex-based redactor to strip out sensitive patterns (emails, phone numbers, API keys, credit cards, SSNs) before logging to database storage.
*   **📊 Rich Telemetry Analytics**: Live dashboards measuring avg latency, p95 latency, error rates, throughput, token usages, and provider-wise breakdown.
*   **🔄 Full Chat Lifecycle Control**: Support for multi-turn chats, streaming responses (SSE), abort/cancellation mid-stream, list conversations, and resume sessions.
*   **🐳 Docker Compose One-Command Setup**: Spin up PostgreSQL, Redis, backend services (with automated migrations), and frontend inside a unified network in one step.

---

## 🏗️ Architecture Overview

The system architecture is engineered with strict decoupling principles to guarantee reliability and low latency:

```mermaid
graph TD
    Client[React Frontend - 5173] -->|Interact / Stream SSE| Backend[Express App - 4000]
    Backend -->|SDK Wrapper| Providers[OpenAI / Anthropic / Gemini]
    Backend -->|Buffer & Batch Logs| SDK[Lightweight SDK]
    SDK -->|POST /api/ingest/logs| IngestRouter[Ingest Controller]
    IngestRouter -->|Validate & Save DB| DB[(PostgreSQL)]
    IngestRouter -->|Push Task| Queue[Redis / BullMQ Queue]
    Queue -->|Process Event| Worker[Background Worker]
    Worker -->|Redact PII & Update Snapshots| DB
```

1.  **Client Application**: React frontend built with Vite and TailwindCSS that handles Server-Sent Events (SSE) to consume real-time LLM token streams.
2.  **Lightweight SDK Wrapper**: Intercepts request/response payloads, measures time-to-first-token (TTFT) and total latency, formats metadata, and pushes logs to a batching queue.
3.  **Batch Queue & Sender**: Rather than firing HTTP requests on every single token/completion, the SDK batches logs (default: 10 logs or 2000ms flush window) to minimize TCP overhead.
4.  **Ingestion Service**: Rapidly consumes batches, validates the payload structure using **Zod**, stores them to the relational database, and queues background processing tasks.
5.  **BullMQ worker**: Operates asynchronously outside the main request-response thread to redact PII and compute analytical aggregates (snapshots).

---

## 🗄️ Database Schema Design Decisions

We use Knex migrations to enforce a sensible, normalized PostgreSQL schema. 

```mermaid
erDiagram
    SESSIONS ||--o{ MESSAGES : "has many"
    SESSIONS ||--o{ INFERENCE_LOGS : "references"
    MESSAGES ||--o| INFERENCE_LOGS : "belongs to"

    SESSIONS {
        uuid id PK
        text title
        text provider
        text model
        text status
        boolean is_streaming
        timestamp created_at
        timestamp updated_at
    }

    MESSAGES {
        uuid id PK
        uuid session_id FK
        text role
        text content
        timestamp created_at
    }

    INFERENCE_LOGS {
        uuid id PK
        uuid session_id FK
        uuid message_id FK
        text provider
        text model
        integer prompt_tokens
        integer completion_tokens
        integer total_tokens
        integer latency_ms
        integer ttft_ms
        text status
        text error_code
        text error_message
        text input_preview
        text output_preview
        boolean is_streaming
        timestamp created_at
    }
```

### Key Decisions & Constraints:
*   **UUID Identifiers**: Prevents ID enumeration attacks and makes distributed log tracking seamless.
*   **Cascading Deletes**: `messages` and `inference_logs` tables are configured with **`.onDelete('CASCADE')`** on both `session_id` and `message_id` foreign keys. If a user deletes a session, PostgreSQL automatically and cleanly cascades the deletion to all messages and logs, resolving foreign key violations.
*   **Indexes**: Crucial indexes are set up on:
    *   `inference_logs(session_id)` to speed up message detail fetches.
    *   `inference_logs(created_at)` for high-performance time-series analytics.
    *   `inference_logs(provider, model)` to accelerate aggregate dashboard metrics.
    *   `inference_logs(status)` to query errors quickly.

---

## ⚙️ Setup & Installation

You can get LLMetrics running in under a minute using Docker Compose or manually on your local system.

### Option A: One-Command Docker Setup (Recommended)

Make sure you have Docker and Docker Compose installed, then run at the root of the workspace:

```bash
docker compose up --build
```

This will automatically:
1. Spin up PostgreSQL 16 on port `5433` and Redis 7 on port `6379`.
2. Build the Node/Express backend on port `4000`.
3. Auto-apply Knex schema migrations.
4. Launch the Vite React frontend on port `5173`.

Access the application at: **`http://localhost:5173`**

---

### Option B: Manual Local Setup

#### Prerequisites
*   Node.js 18+ & npm
*   PostgreSQL running locally (default url: `postgres://postgres:password@localhost:5433/llmlogger`)
*   Redis running locally on port `6379`

#### 1. Setup Backend
```bash
cd backend
npm install
npm run migrate       # Run knex database migrations
npm run dev           # Start Express dev server (port 4000)
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev           # Start Vite dev server (port 5173)
```

---

## 📈 Scalability Considerations & Architecture Notes

### Ingestion Flow
Log ingestion is optimized for high-volume environments:
`SDK wrapper intercepts request -> local memory buffer -> flush batch -> express ingestion router -> quick DB insert -> queue BullMQ task -> instant 202 response`.
The client thread is never blocked, and memory consumption remains stable.

### Scaling Strategy
1.  **Log Queueing**: In extremely high throughput systems, Express can write logs directly into an Apache Kafka or AWS Kinesis stream instead of a PostgreSQL/BullMQ combination.
2.  **Database Partitioning**: As the `inference_logs` table grows into millions of entries, PostgreSQL table partitioning by time (e.g., monthly partitions on `created_at`) will ensure fast indexes and easy pruning.
3.  **Read Replicas**: Shift the analytics dashboard reads onto PostgreSQL read-replicas, keeping the primary database optimized exclusively for writes/inserts.

### Failure Handling Assumptions
*   **Network Partition**: If the ingestion API is down, the HttpSender SDK retries with exponential backoff up to 3 times before dropping logs to protect application memory.
*   **Worker Crashes**: BullMQ maintains state in Redis. If a background worker node crashes, the job is automatically retried by another active worker.
