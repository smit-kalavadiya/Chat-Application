# Chat Application 💬

A full-stack, real-time chat application built with a microservices architecture: a Spring Boot authentication service, a Spring Boot WebSocket-based chat service, a PostgreSQL database, and a React (Vite) frontend.

## Architecture

```
┌──────────────────┐        REST (login/register)        ┌───────────────────┐
│   Frontend (SPA)  │ ───────────────────────────────────▶│  Authentication     │
│   React + Vite     │                                     │  Service (:8080)     │
└─────────┬─────────┘                                      └─────────┬───────────┘
          │                                                            │
          │  WebSocket (STOMP over ws), JWT in headers                 │ PostgreSQL
          ▼                                                            ▼
┌──────────────────┐                                          ┌────────────────┐
│   Chat Service     │                                          │   users DB       │
│   (:8082)           │                                          └────────────────┘
└──────────────────┘
```

- **Authentication Service** — registers/logs in users, hashes passwords with BCrypt, and issues JWTs. Backed by PostgreSQL.
- **Chat Service** — a Spring WebSocket (STOMP) server. Clients connect to `/chat`, publish to `/app/send`, and receive broadcasts on `/topic/messages`. Incoming connections are validated against the same JWT secret as the Authentication Service.
- **Frontend** — a React SPA with login, register, and chat pages. Uses `@stomp/stompjs` + `sockjs-client` to talk to the Chat Service over WebSocket, and `axios` to talk to the Authentication Service over REST.

## Tech Stack

| Layer                | Technology                                              |
|-----------------------|------------------------------------------------------------|
| Frontend              | React 19, Vite, Tailwind CSS, StompJS, SockJS, Axios        |
| Authentication Service| Java 17, Spring Boot, Spring Security, Spring Data JPA, JWT (jjwt) |
| Chat Service          | Java 17, Spring Boot, Spring WebSocket (STOMP), JWT (jjwt)   |
| Database              | PostgreSQL                                                     |
| Build tools           | Maven (backend), npm (frontend)                                 |

## Project Structure

```
Chat-Application/
├── Authentication/           # Spring Boot service: register, login, JWT issuing
│   └── src/main/java/com/smitkalavadiya/authentication/
├── ChatService/               # Spring Boot service: WebSocket/STOMP messaging
│   └── src/main/java/com/smitkalavadiya/chatservice/
└── Frontend/
    └── Chat-Frontend/          # React (Vite) SPA
```

## Getting Started

### Prerequisites

- Java 17+ and Maven (or use the included `mvnw` wrapper)
- Node.js 18+ and npm
- PostgreSQL running locally (or accessible remotely)

### 1. Set up PostgreSQL

Create a database named `users`:

```sql
CREATE DATABASE users;
```

### 2. Configure and run the Authentication Service

Update `Authentication/src/main/resources/application.properties` with your own database credentials and a strong JWT secret:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/users
spring.datasource.username=<your-postgres-username>
spring.datasource.password=<your-postgres-password>

jwt.secret=<a-long-random-secret>
jwt.expiration=3600000
```

Then run it (defaults to port `8080`):

```bash
cd Authentication
./mvnw spring-boot:run
```

### 3. Configure and run the Chat Service

The Chat Service also needs the **same** `jwt.secret` used by the Authentication Service so it can validate incoming tokens. It's currently hardcoded in `ChatService/src/main/java/com/smitkalavadiya/chatservice/utils/JwtUtil.java` — make sure that value matches the Authentication Service's `jwt.secret` (ideally, externalize both to an environment variable).

Run it (defaults to port `8082`):

```bash
cd ChatService
./mvnw spring-boot:run
```

### 4. Run the Frontend

```bash
cd Frontend/Chat-Frontend
npm install
npm run dev
```

The dev server starts on `http://localhost:5173` by default.

> ⚠️ **Before running locally**, update the hardcoded backend URLs in the frontend — they currently point to a specific machine's LAN IP (`10.0.0.217`) rather than `localhost`:
> - `src/pages/login.jsx` — the `axios.post(...)` call to `/api/auth/login`
> - `src/pages/chat.jsx` — the `brokerURL` passed to the STOMP `Client`
>
> Point both at wherever your Authentication Service (`:8080`) and Chat Service (`:8082`) are actually running, e.g. `http://localhost:8080` and `ws://localhost:8082/chat`. Similarly, `Authentication/.../config/CorsConfig.java` allows only `http://10.0.0.217:5173` as an origin — update it to match your frontend's actual URL (e.g. `http://localhost:5173`).

### 5. Try it out

1. Open the frontend in your browser and register a new account.
2. Log in — you'll receive a JWT stored in `localStorage`.
3. You'll be redirected to the chat page, which opens a WebSocket connection (authenticated with your JWT) and lets you send/receive messages broadcast to all connected users in real time.

## API Reference

### Authentication Service (`http://localhost:8080`)

| Method | Endpoint            | Auth required | Description                          |
|--------|-----------------------|-----------------|------------------------------------------|
| POST   | `/api/auth/register`   | No               | Register a new user (`username`, `email`, `password`) |
| POST   | `/api/auth/login`       | No               | Log in (`email`, `password`) — returns a JWT string     |
| POST   | `/api/auth/getuser`      | No               | Look up a user by email                                    |
| GET    | `/api/me`                 | Yes               | Get the currently authenticated user's profile               |
| GET    | `/api/health`              | No               | Health check                                                    |

### Chat Service (`http://localhost:8082`)

| Protocol | Endpoint          | Description                                              |
|----------|---------------------|--------------------------------------------------------------|
| WS/STOMP | `/chat`               | WebSocket handshake endpoint. Requires `Authorization: Bearer <token>` in connect headers. |
| STOMP    | `/app/send`             | Client → server: publish a chat message (`{ from, content }`)  |
| STOMP    | `/topic/messages`        | Server → client: subscribe to receive broadcast messages          |

## Notes

- User passwords are hashed with BCrypt before being stored — never sent or stored in plain text.
- The JWT secret is currently hardcoded in both services rather than pulled from environment variables. For anything beyond local testing, externalize `jwt.secret` and keep it identical across both services.
- Chat messages are broadcast to **all** connected clients on a single shared topic — there's no concept of rooms/channels or private messaging yet.

## License

No license file is currently included in this repository.
