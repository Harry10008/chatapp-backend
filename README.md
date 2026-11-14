# Chat Backend API

A 1:1 chat backend built with Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Firebase Firestore.

## Tech Stack

- Node.js
- Express.js
- TypeScript (strict mode)
- PostgreSQL
- Prisma ORM
- Firebase Admin SDK / Cloud Firestore
- JWT authentication
- bcrypt password hashing
- Zod validation

## Architecture

The application uses a modular monolith architecture.

```text
src/
├── config/
│   ├── database.ts
│   ├── env.ts
│   └── firebase.ts
├── middlewares/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── modules/
│   ├── auth/
│   ├── chat/
│   ├── message/
│   └── user/
├── utils/
│   └── AppError.ts
├── app.ts
└── server.ts

prisma/
└── schema.prisma

.env
.gitignore
package.json
tsconfig.json
README.md
```

### Database responsibilities

**PostgreSQL**
- User accounts and authentication details
- Chat records
- Chat membership
- Unique direct-chat keys to prevent duplicate 1:1 chats

**Firebase Firestore**
- Chat messages
- Message timestamps
- Read receipts
- Per-user last-seen message tracking

## Prerequisites

- Node.js
- PostgreSQL
- Firebase project with Cloud Firestore enabled
- Firebase service account credentials

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create a PostgreSQL database named `chat_backend`.

Configure the `.env` file:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/chat_backend?schema=public"

JWT_SECRET="your_long_random_secret"
JWT_EXPIRES_IN="1d"

FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_PRIVATE_KEY="your-private-key"
```


## Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

## Run the Application

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Type checking:

```bash
npm run typecheck
```

Health check:

```http
GET /health
```

## Authentication

Register:

```http
POST /auth/register
```

Example body:

```json
{
  "name": "Harry",
  "email": "harry@example.com",
  "password": "Password123"
}
```

Login:

```http
POST /auth/login
```

Example body:

```json
{
  "email": "harry@example.com",
  "password": "Password123"
}
```

Use the returned JWT as a Bearer token for protected APIs:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The authenticated user's identity is taken from the JWT rather than trusted from request-body user IDs.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Login |
| POST | `/chat/create` | Create or retrieve a 1:1 chat |
| POST | `/chat/:chatId/message/send` | Send a message |
| GET | `/chat/:chatId/messages` | Retrieve paginated messages |
| POST | `/chat/:chatId/message/:messageId/read` | Mark a message as read |
| POST | `/chat/:chatId/lastseen` | Update last-seen message |
| GET | `/user/:userId/chats` | List a user's chats |

### Create a chat

```http
POST /chat/create
```

Example body:

```json
{
  "userBId": "SECOND_USER_UUID"
}
```

The authenticated user is automatically used as the first participant.

### Send a message

```http
POST /chat/CHAT_ID/message/send
```

Example body:

```json
{
  "text": "Hello!"
}
```

The sender ID is taken from the authenticated user's JWT.

### Retrieve messages

```http
GET /chat/CHAT_ID/messages?limit=20
```

For the next page, pass the cursor returned in the previous response:

```http
GET /chat/CHAT_ID/messages?limit=20&cursor=LAST_MESSAGE_ID
```

Messages are returned newest first. `nextCursor` is `null` when no more messages are available.

### Mark a message as read

```http
POST /chat/CHAT_ID/message/MESSAGE_ID/read
```

The authenticated user is recorded in the message's `readBy` array.

### Update last-seen message

```http
POST /chat/CHAT_ID/lastseen
```

Example body:

```json
{
  "messageId": "MESSAGE_ID"
}
```

This records the last message viewed by the authenticated user.

### List user chats

```http
GET /user/USER_ID/chats
```
Returns the chats associated with the authenticated user, including their member IDs.

Get all registered users
GET /user/

Authorization
Bearer Token: use your login JWT.


## Security and Validation

- JWT authentication for protected endpoints
- Password hashing using bcrypt
- Request validation using Zod
- User membership checks before accessing chat data
- Helmet security headers
- Consistent centralized error handling
- Database-level uniqueness for direct chats
- Environment variables for secrets and credentials

## Real-Time Messages

Messages are stored in Firestore. A client application can subscribe to the chat's Firestore messages collection using Firestore snapshot listeners (`onSnapshot`) to receive updates in real time.

The backend uses Firebase Admin SDK for trusted server-side writes and access.

## Error Response Example

```json
{
  "success": false,
  "message": "You are not a member of this chat"
}
```

## Notes

- PostgreSQL stores users, chats, and chat membership.
- Firestore stores messages and read-receipt data.
- The API uses JWT-based authentication.
- Message retrieval supports cursor-based pagination.
- Duplicate direct chats are prevented by a PostgreSQL unique constraint.
