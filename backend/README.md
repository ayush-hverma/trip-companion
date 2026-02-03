# Splitwise Backend

Run the backend (requires Node.js):

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install deps and start:

```bash
cd backend
npm install
npm run start
```

API endpoints:
- `POST /api/trips` - create a trip (JSON body: `name`, `currency`, `budget`, `people`)
- `GET /api/trips` - list trips

You can also serve the frontend from the backend server (recommended for quick testing):

1. Start the backend as above.
2. Open http://localhost:5000 in your browser — the frontend is served from the `frontend` folder.

