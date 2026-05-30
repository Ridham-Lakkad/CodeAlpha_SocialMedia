# SocialConnect

SocialConnect is a full-stack MERN social media platform inspired by Instagram/Facebook. It includes JWT authentication, profile management, image posts, follows, likes, comments, saves, share links, notifications, and Socket.io-ready live notification delivery.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Framer Motion, Context API, Lucide icons
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Cloudinary, Socket.io
- Deployment targets: Vercel for frontend, Render for backend, MongoDB Atlas for database

## Features

- Register/login with JWT protected routes
- Editable profiles with avatar uploads, bio, website, and location
- Follow/unfollow users with followers and following lists
- Home feed prioritized by followed users, with recent public fallback
- Create, edit, delete image/video posts with captions
- Like, comment, save, share, and repost posts
- Explore page with user search, media filters, and trending wall
- Notifications for likes, comments, and follows
- Mobile bottom navigation and desktop sidebar layout

## Folder Structure

```txt
SocialConnect
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── utils
│   ├── .env
│   └── package.json
└── README.md
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Add backend environment values in `backend/.env`.

3. Add frontend environment values in `frontend/.env`.

4. Make sure MongoDB Atlas and Cloudinary credentials are filled in `backend/.env`.

5. If you use MongoDB Atlas, add your current IP address to the cluster's Network Access allowlist before starting the backend.

6. In development, if Atlas is unreachable the backend falls back to a local MongoDB instance at `mongodb://127.0.0.1:27017/socialconnect`.

7. Start backend:

```bash
npm run dev:backend
```

8. Start frontend:

```bash
npm run dev:frontend
```

Frontend runs on `http://localhost:5173`; backend runs on `http://localhost:5000`.

## Environment Variables

Backend:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialconnect
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Documentation

All private routes require:

```http
Authorization: Bearer <jwt>
```

### Auth

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `name, username, email, password` | Create account |
| POST | `/api/auth/login` | `email, password` | Login |
| GET | `/api/auth/me` | none | Current user |

### Users

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/users/search?q=ridham` | none | Search users |
| GET | `/api/users/saved` | none | Saved posts |
| GET | `/api/users/:username` | none | Profile, followers, following, posts |
| PATCH | `/api/users/profile` | multipart `avatar`, `name`, `bio`, `website`, `location` | Update profile |
| POST | `/api/users/:id/follow` | none | Follow user |
| DELETE | `/api/users/:id/follow` | none | Unfollow user |

### Posts and Comments

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/posts/feed` | none | Follow-prioritized feed |
| GET | `/api/posts/explore` | none | Recent public posts |
| POST | `/api/posts` | multipart `image`, `caption` | Create image or video post |
| PATCH | `/api/posts/:id` | `caption` | Edit caption |
| DELETE | `/api/posts/:id` | none | Delete own post |
| POST | `/api/posts/:id/like` | none | Toggle like |
| POST | `/api/posts/:id/comments` | `text` | Add comment |
| DELETE | `/api/posts/:postId/comments/:commentId` | none | Delete comment |
| POST | `/api/posts/:id/save` | none | Toggle save |
| POST | `/api/posts/:id/share` | none | Increment share count and return URL |
| POST | `/api/posts/:id/repost` | none | Increment repost count |

### Notifications

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/notifications` | none | List notifications |
| PATCH | `/api/notifications/read` | none | Mark all as read |

## Database Relationships

```txt
User
├── followers: [User._id]
├── following: [User._id]
├── savedPosts: [Post._id]
└── owns many Posts

Post
├── author: User._id
├── likes: [User._id]
└── comments: [{ user: User._id, text }]

Notification
├── receiver: User._id
├── sender: User._id
└── post: Post._id optional
```

## ER Diagram

```mermaid
erDiagram
  USER ||--o{ POST : creates
  USER }o--o{ USER : follows
  USER }o--o{ POST : saves
  USER }o--o{ POST : likes
  USER ||--o{ COMMENT : writes
  POST ||--o{ COMMENT : contains
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ NOTIFICATION : sends
  POST ||--o{ NOTIFICATION : references

  USER {
    ObjectId _id
    string name
    string username
    string email
    string password
    object avatar
    string bio
    array followers
    array following
    array savedPosts
  }

  POST {
    ObjectId _id
    ObjectId author
    object image
    string mediaType
    string caption
    array likes
    array comments
    number shareCount
    number repostCount
  }

  NOTIFICATION {
    ObjectId _id
    ObjectId receiver
    ObjectId sender
    string type
    ObjectId post
    boolean read
  }
```

## Deployment

### Render Backend

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add backend environment variables from your local `backend/.env`
- Set `CLIENT_URL` to your deployed Vercel URL

### Vercel Frontend

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add:
  - `VITE_API_URL=https://your-render-app.onrender.com/api`
  - `VITE_SOCKET_URL=https://your-render-app.onrender.com`

## Notes

- MongoDB Atlas must allow your Render server IP or use `0.0.0.0/0` for project/demo access.
- Cloudinary unsigned uploads are not used; uploads go through the protected backend with Multer and Cloudinary credentials.
- Socket.io currently powers live notification toasts and can be extended into chat.
