# CampusCare Backend

Node.js + Express + PostgreSQL REST API starter for CampusCare.

## Requirements
- Node.js 18+
- PostgreSQL
- Postman (for API testing)

## Setup (Windows PowerShell / Command Prompt)

1. Open a terminal in this `backend` folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `campuscare`.
4. Run `db/schema.sql` against that database using pgAdmin Query Tool or `psql`.
5. Copy `.env.example` to `.env` and set your PostgreSQL connection string and a long random `JWT_SECRET`.
6. Start the server:

   ```bash
   npm run dev
   ```

The API should listen at `http://localhost:5000`.

## Postman endpoints

All request bodies should use **Body → raw → JSON**.

| Method | URL | Auth |
|---|---|---|
| GET | `http://localhost:5000/api/health` | No |
| POST | `http://localhost:5000/api/auth/register` | No |
| POST | `http://localhost:5000/api/auth/login` | No |
| POST | `http://localhost:5000/api/complaints` | Bearer token |
| GET | `http://localhost:5000/api/complaints` | Bearer token |
| GET | `http://localhost:5000/api/complaints/1` | Bearer token |
| PATCH | `http://localhost:5000/api/complaints/1/status` | Staff/admin token |
| POST | `http://localhost:5000/api/assignments` | Admin token |
| POST | `http://localhost:5000/api/feedback` | Complaint owner's token |

### Example register body

```json
{
  "name": "Test Student",
  "email": "student@example.com",
  "password": "Pass123!"
}
```

Public registration creates student accounts only. For local testing, create staff/admin users directly in PostgreSQL after generating a bcrypt hash, or use a controlled seed process. Do not expose admin/staff registration publicly.

### Example login body

```json
{
  "email": "student@example.com",
  "password": "Pass123!"
}
```

Copy the returned token into Postman Authorization → Bearer Token.

### Example complaint body

```json
{
  "title": "Broken classroom fan",
  "description": "The fan is not working in room 204.",
  "category": "Electrical",
  "location": "Block A, Room 204",
  "priority": "Medium"
}
```

## Important
This is a prepared starter backend, not yet verified against Moksha's frontend/API contract or your local PostgreSQL installation. Compare endpoint names and request/response fields with the frontend before integration. Keep `.env` private and never commit it.
