# Academia Express Backend

A backend application for an educational platform built with Node.js, TypeScript, Express, and Prisma. This project includes authentication, user management, role and permission management, course management, wallet features, enrollment reservations, comments, and media uploads.

## Architecture

- `index.ts`: application entry point
- `app.ts`: Express configuration, middleware, and route registration
- `config/`: environment variable loading
- `modules/`: domain modules such as auth, user, course, and rolePermission
- `utils/`: helper utilities including Prisma client, email templates, password hashing, and logger
- `prisma/`: Prisma configuration and migrations
- `uploads/`: uploaded file storage

## Features

- User registration and login
- Email verification and resend verification token
- Password reset and forgot password flow
- Two-factor authentication and QR code activation
- Google OAuth login
- User profile management and image uploads
- Role and permission management
- User-specific permission exceptions
- Course management with categories and course type
- Course likes and dislikes
- Course comments and replies management
- Course reserve and enrollment approval workflows
- Wallet transaction requests and withdraw confirmation
- Course video upload and streaming

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/arefsalarieh/academia-express.git
   ```
2. Change directory into the backend project:
   ```bash
   cd arefsalarieh/academia-express
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create the environment file:
   ```bash
   cp env.example .env
   ```
   Then fill in the `.env` values.
5. Start the development server:
   ```bash
   npm run dev
   ```

> Note: CORS is configured in `app.ts` to allow requests from `http://localhost:5173`. Change this origin if your frontend runs on a different address.

## Environment Variables

The `env.example` file includes the following variables:

- `APP_NAME`
- `DATABASE_URL="file:./dev.db"`
- `PORT=3000`
- `JWT_SECRET`
- `NODE_ENV=development`
- `Email_User`
- `Email_Password`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## Database

This project uses Prisma with SQLite. The Prisma config is in `prisma.config.ts` and the schema is located under `prisma/schema`.

If you update Prisma models, regenerate the client:
```bash
npx prisma generate
```

## Main API Routes

- `GET /health`
- `/api/auth`
  - `POST /register`
  - `POST /login`
  - `POST /verify-email`
  - `POST /send-verification-token-again`
  - `POST /forgot-password`
  - `POST /reset-password`
  - `PUT /active-2fa`
  - `PUT /deactive-2fa`
  - `PUT /active-qrcode`
  - `PUT /deactive-qrcode`
  - `POST /qrcode`
  - `GET /google-step-one`
  - `GET /google/callback`
- `/api/user`
  - `GET /profile`
  - `PUT /update-profile`
  - `POST /upload-profile-images`
  - `GET /image/:imageId`
  - `PUT /change-main-image/:imageId`
  - `DELETE /delete-user-image/:imageId`
- `/api/role`
  - `GET /get-all-roules`
- `/api/user-role`
  - `POST /add-role-to-user`
- `/api/permission`
  - `GET /get-all-permission`
  - `GET /get-resources-and-actions`
  - `POST /add-new-permission`
  - `DELETE /delete-permission/:permissionId`
- `/api/role-permission`
  - `GET /get-all-role-Permission`
  - `GET /get-single-role-Permission/:roleId`
  - `GET /get-all-Permission-role`
  - `GET /get-single-Permission-roles/:permissionId`
  - `POST /add-permission-to-role`
  - `DELETE /delete-permission-from-role`
- `/api/user-permission-exception`
  - `GET /get-user-permission/:userId`
  - `GET /get-user-exeption-permission/:userId`
  - `POST /add-permission-to-user`
  - `DELETE /delete-permission-from-user`
  - `POST /deny-permission-to-user`
  - `DELETE /delete-deny-permission-from-user`
- `/api/wallet`
  - `POST /payment-request`
  - `GET /payment-result`
  - `POST /withdraw-request`
  - `POST /confirm-withdraw`
- `/api/course-category`
  - `POST /add-new-category`
  - `GET /get-all-categories`
  - `GET /detail/:id`
  - `DELETE /delete/:id`
- `/api/courseType`
- `/api/course`
  - `GET /get-all-courses`
  - `GET /get-course-detail/:courseId`
  - `GET /create-course-helper`
  - `POST /create-course-step-one`
  - `POST /create-course-step-two`
  - `PUT /update-course`
- `/api/course-like`
  - `POST /add-like/:courseId`
  - `DELETE /delete-like/:courseId`
  - `POST /disLike/:courseId`
  - `DELETE /delete-disLike/:courseId`
- `/api/course-comment`
  - `POST /add-course-comment`
  - `GET /get-course-comment/:courseId`
  - `GET /get-comment-replies/:commentId`
  - `PUT /update-comment`
  - `DELETE /delete-course-comment/:commentId`
  - `GET /get-course-comment-with-permission/:courseId`
  - `GET /get-comment-replies-with-permission/:commentId`
  - `PUT /confirm-course-comment-with-permission/:commentId`
  - `PUT /reject-course-comment-with-permission/:commentId`
- `/api/course-video`
  - `PUT /upload`
  - `GET /stream/:fileId`
- `/api/enrollment`
  - `POST /reserve-course/:courseId`
  - `GET /get-all-reserves`
  - `POST /confirm-course-reserve/:reserveId`
  - `POST /reject-course-reserve/:reserveId`
  - `GET /get-my-course-reserves`
  - `GET /get-my-enrooled-course`
  - `POST /finalized-enrollment/:reserveId`

## Notes

- `checkAuthentication` protects authenticated routes.
- `requirePermission` enforces role and permission checks for sensitive endpoints.
- Uploaded files are stored in the `uploads/` directory.
- `utils/prisma.ts` creates a PrismaClient with the `better-sqlite3` adapter.

## Running the Project

After starting the server with `npm run dev`, the app runs at:

```bash
http://localhost:3000
```

Health check endpoint:

```bash
GET http://localhost:3000/health
```

## Development and Extension

This backend is designed for fast development and can be extended by:
- adding new API routes
- updating Prisma schema models
- connecting a frontend client (React/Vue/Angular)
- extending permission and role logic

---

If you want a more detailed API reference or schema documentation, I can expand this README further.