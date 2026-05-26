# Kanban Backend

Node.js + TypeScript backend for the kanban board application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database

The application uses SQLite with Prisma ORM. The database file is created automatically at `prisma/dev.db`.

### Database Studio

```bash
npx prisma studio
```

### Models

- **Column**: id, name, position, createdAt, updatedAt
- **Task**: id, title, description, columnId, position, createdAt, updatedAt

## API Endpoints

### Columns

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/columns` | Create column |
| GET | `/api/columns` | List all columns |
| GET | `/api/columns/:id` | Get column by ID |
| PUT | `/api/columns/:id` | Update column |
| PATCH | `/api/columns/:id` | Reorder column |
| DELETE | `/api/columns/:id` | Delete column |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| GET | `/api/columns/:cid/tasks` | Get tasks by column |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id` | Move task (drag & drop) |
| DELETE | `/api/tasks/:id` | Delete task |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment mode |
