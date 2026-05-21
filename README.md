# Smart Task Organizer

## How to Run

### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:3001

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3000

---

## Project Structure
```
smart-task-organizer/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/tasks.js        # All API endpoints
│   ├── data/tasks.json        # Data storage (auto-created)
│   └── patterns/
│       ├── index.js
│       ├── TaskSorter.js      # Strategy Pattern context
│       └── strategies/
│           ├── DeadlineSortStrategy.js
│           ├── PrioritySortStrategy.js
│           └── DefaultSortStrategy.js
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main component
    │   ├── api/tasks.js       # API calls
    │   └── components/
    │       ├── TaskForm.jsx   # Add / Edit form
    │       └── TaskCard.jsx   # Single task card
    └── vite.config.js

## API Endpoints
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| GET    | /api/tasks                | Get all tasks      |
| POST   | /api/tasks                | Create task        |
| PUT    | /api/tasks/:id            | Update task        |
| PATCH  | /api/tasks/:id/complete   | Mark as completed  |
| DELETE | /api/tasks/:id            | Delete task        |
| GET    | /api/tasks/export/txt     | Export to .txt     |
```
