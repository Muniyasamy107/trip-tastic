# Trip Tastic

A colorful, story-first travel planner built with **React + Vite**, **Spring Boot**, and **MySQL**. The experience includes a looping Defender off-road video hero, scroll-led animation, responsive destination discovery, a South India-first collection, regional filters, saved trips, destination details, and a booking-request flow.

## What’s in the repo

- **Frontend:** React 18, Vite, Lucide icons, custom responsive CSS and Intersection Observer reveals.
- **Backend:** Spring Boot REST API with validation, destination search, and booking requests.
- **Database:** MySQL 8.4. The API creates/updates its tables and seeds South India favourites plus a small set of international trips. Existing local databases receive any missing starter destinations on the next API startup.
- **Local-first preview:** the curated destination cards and interactions still render if the API is not running. Booking requests are saved as a clearly labelled local preview draft in that case.

## Run it locally

### 1. Start MySQL and the Spring Boot API

The simplest option is Docker Compose from the repository root:

```bash
docker compose up --build
```

This starts MySQL on `localhost:3306` and the API on `http://localhost:8080`. The API waits for MySQL to become healthy before it starts. To stop the services, run `docker compose down`; add `-v` only if you also want to remove the local database volume.

Default local database settings are intended for development only. Override them with environment variables or a root `.env` file before deploying:

```text
DB_USERNAME=tripuser
DB_PASSWORD=tripsecret
DB_ROOT_PASSWORD=rootsecret
```

Alternatively, with Java 17+, Maven, and a local MySQL database installed:

```bash
cd backend
mvn spring-boot:run
```

The backend reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SERVER_PORT`, and `CORS_ALLOWED_ORIGINS` from the environment. The default database URL points to `localhost:3306/triptastic`.

### 2. Start the React frontend

In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

Open the Vite address printed in the terminal (usually `http://localhost:5173`). Vite proxies `/api` requests to `http://localhost:8080`. To use another backend address, set `VITE_BACKEND_URL` for the dev proxy. For a separately hosted frontend build, set `VITE_API_BASE_URL` to the API's base URL before running `npm run build` and configure the API's allowed CORS origins.

Create a production frontend bundle with:

```bash
npm run build
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Basic API health check |
| `GET` | `/api/destinations` | List all destinations; optional `search` and `region` query parameters |
| `GET` | `/api/destinations/{id}` | Get a destination |
| `POST` | `/api/bookings` | Validate and save a trip request |
| `GET` | `/api/bookings/{id}` | Get booking status and confirmation details |

Example booking request:

```json
{
  "destinationId": 1,
  "name": "Maya Rivera",
  "email": "maya@example.com",
  "startDate": "2027-05-12",
  "travelers": 2,
  "notes": "We love early walks and local food."
}
```

A successful request returns `201 Created` with a confirmation code, for example `TT-00001`. Invalid requests return a readable message and field-level validation details.

## Notes

- Destination photography is loaded from Unsplash URLs; an internet connection is needed to see those images. The Defender off-road hero loop is a free-to-use Pexels clip credited in the video card; its poster image remains as the fallback.
- Starter trip prices are illustrative INR estimates and should be reviewed before launch.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for local development. Use a managed migration tool and production-grade secrets/configuration before deploying.
