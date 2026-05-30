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

## Deployment

### Render Backend

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

### Vercel Frontend

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

## Notes

- MongoDB Atlas must allow your Render server IP or use `0.0.0.0/0` for project/demo access.
- Cloudinary uploads are handled through the backend.
- Socket.io can be extended for real-time chat.