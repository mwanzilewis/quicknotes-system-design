# QuickNotes API Design

Base URL: `/api/v1`

## Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| POST | /users/register | Register a new user | 201 |
| POST | /auth/login | Login and get JWT token | 200 |
| GET | /notes | List notes for logged-in user, supports ?limit & ?tag= | 200 |
| POST | /notes | Create a new note | 201 |
| GET | /notes/:id | Get single note by id | 200 |
| PATCH | /notes/:id | Update title/body of own note | 200 |
| DELETE | /notes/:id | Delete own note | 204 |
| GET | /tags | List all tags | 200 |

## Create Note Example

Request:
```json
POST /api/v1/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Shopping list",
  "body": "Milk, Bread, Eggs",
  "tagIds": [1, 3]
}
