# CollabSphere API Documentation

All API requests should be made to `http://localhost:5000/api`.

## Authentication

### Register User
`POST /api/auth`
- Body: `{ "name": "...", "email": "...", "password": "..." }`
- Response: `201 Created` with User data and Token.

### Login User
`POST /api/auth/login`
- Body: `{ "email": "...", "password": "..." }`
- Response: `200 OK` with User data and Token.

---

## Projects

### Create Project
`POST /api/projects` (Protected)
- Body: `{ "projectName": "...", "description": "...", "isPublic": boolean }`

### Get My Projects
`GET /api/projects/my-projects` (Protected)
- Returns: Array of projects where user is a member/owner.

### Add Member
`POST /api/projects/add-member` (Protected)
- Body: `{ "projectId": "...", "email": "..." }`

### Get Public Project
`GET /api/projects/public/:id`
- Returns: Basic project details (no auth required).

---

## Documentation (Notes)

### Create Note
`POST /api/notes` (Protected)
- Body: `{ "projectId": "...", "title": "...", "content": "..." }`

### Get Project Notes
`GET /api/notes/:projectId` (Protected/Public Check)

---

## Gemini AI

### Explain Content
`POST /api/gemini/explain` (Protected)
- Body: `{ "content": "...", "type": "code/note" }`

### Generate Documentation
`POST /api/gemini/docs` (Protected)
- Body: `{ "code": "..." }`

### Generate README
`POST /api/gemini/readme` (Protected)
- Body: `{ "projectName": "...", "description": "..." }`

---

## Files & Analytics

### Upload File
`POST /api/files/upload` (Protected)
- Multi-part form: `file` + `projectId`.

### Get Analytics
`GET /api/analytics/:projectId` (Protected)
- Returns: Contribution stats and activity summary.
