# Academia Express

Backend for an online education platform (courses, enrollment, wallet, and more) built with **Node.js + Express 5 + TypeScript + Prisma (SQLite)**. This README is written so the frontend team can spin up the project from scratch and work with all APIs without needing to read the backend code.

> This README was originally written in Persian because the primary audience is the project's frontend team. An English version is provided here for public GitHub release or broader use.

## Table of Contents

- [1. Project Setup](#1-project-setup)
- [2. Environment Variables (.env) — Complete Guide](#2-environment-variables-env--complete-guide)
- [3. General Request & Response Format](#3-general-request--response-format)
- [4. Authentication & Tokens](#4-authentication--tokens)
- [5. PBAC Access Control System (Very Important for Frontend)](#5-pbac-access-control-system-very-important-for-frontend)
- [6. Complete API Documentation](#6-complete-api-documentation)
  - [Health](#health)
  - [Auth (`/api/auth`)](#auth-apiauth)
  - [User (`/api/user`)](#user-apiuser)
  - [Role (`/api/role`)](#role-apirole)
  - [Permission (`/api/permission`)](#permission-apipermission)
  - [Role-Permission (`/api/role-permission`)](#role-permission-apirole-permission)
  - [User-Role (`/api/user-role`)](#user-role-apiuser-role)
  - [User-Permission-Exception (`/api/user-permission-exception`)](#user-permission-exception-apiuser-permission-exception)
  - [Course Category (`/api/course-category`)](#course-category-apicourse-category)
  - [Course Type (`/api/courseType`)](#course-type-apicoursetype)
  - [Course (`/api/course`)](#course-apicourse)
  - [Course Like (`/api/course-like`)](#course-like-apicourse-like)
  - [Course Comment (`/api/course-comment`)](#course-comment-apicourse-comment)
  - [Course Video (`/api/course-video`)](#course-video-apicourse-video)
  - [Enrollment (`/api/enrollment`)](#enrollment-apienrollment)
  - [Wallet (`/api/wallet`)](#wallet-apiwallet)
- [7. Important Notes for Frontend](#7-important-notes-for-frontend)

---

## 1. Project Setup

```bash
# 1) Clone the project
git clone https://github.com/arefsalarieh/academia-express.git
cd academia-express

# 2) Install packages
npm install

# 3) Create .env file from the example
cp env.example .env
# Now fill in the values inside .env according to section 2 of this document

# 4) Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 5) (Optional but recommended) Seed sample data (courses, categories, etc.)
npx tsx utils/seed.ts

# 6) Run the server in development mode
npm run dev
After running:

Base API URL: http://localhost:3000 (or whatever port you set in .env)
Health check: GET http://localhost:3000/health

⚠️ CORS in app.ts is currently open only for http://localhost:5173 (Vite’s default port). If the frontend runs on a different port/address, this value must be updated in app.ts (request the change from the backend team or apply it yourself in the code).

2. Environment Variables (.env) — Complete Guide
The .env file should look like this:
envAPP_NAME=
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET=
NODE_ENV=development
Email_User=
Email_Password=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
Explanation of each variable and where to obtain it:
Simple Variables





























VariableDescriptionAPP_NAMEA custom name for the application (e.g. Academia). This name is displayed as the “Issuer” inside Authenticator apps when the user enables QR/TOTP.DATABASE_URLPath to the SQLite database file. Leave the default file:./dev.db unless you want a different location.PORTPort the server listens on (default 3000).JWT_SECRETA long, random, secret string used to sign JWTs (access/refresh tokens). You can use any string, but make it long and hard to guess (e.g. generate with openssl rand -hex 32).NODE_ENVdevelopment for development, production for production (also affects secure cookies).
Email Setup (Email_User, Email_Password)
The project uses Gmail (via the nodemailer library) to send registration verification emails, two-factor login codes, and password-reset links. Without these two values, those features simply do nothing (the server only logs that the email env vars are missing and continues without error).
To obtain the values you must create an App Password from a Gmail account (Google no longer allows using the account password directly in third-party apps):

Use a Gmail account (personal or a dedicated test account).
Enable 2-Step Verification on that account: go to myaccount.google.com/security → “How you sign in to Google” → enable “2-Step Verification” (App Passwords cannot be created without this).
Go to myaccount.google.com/apppasswords (or search for “App passwords” in the security settings).
Enter a custom name (e.g. academia-backend) and click Create.
Google will give you a 16-character password (e.g. abcd efgh ijkl mnop).

Then set:

Email_User = the full Gmail address (e.g. academia.project@gmail.com)
Email_Password = the 16-character App Password (spaces can be omitted)

Note: If you cannot find the “App passwords” option, it is usually because 2-Step Verification is not yet enabled or the account belongs to a Workspace organization that restricts the feature. In that case use a regular personal Gmail account.
Google OAuth Setup (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
These three values are required only for the “Sign in / Sign up with Google” feature. You can leave them empty if you are not using this feature (the rest of the system works fine). To enable it:

Go to Google Cloud Console and sign in.
Create a new project (or select an existing one) from the top of the page.
From the left menu go to APIs & Services → OAuth consent screen and fill in the basic information (app name, support email, etc.). For testing, set the user type to External and keep the app in Testing mode (add the tester emails you will log in with to the Test users list).
Go to APIs & Services → Credentials → Create Credentials → OAuth client ID.
Choose Web application as the application type.
Under Authorized redirect URIs add exactly the address you will put in GOOGLE_REDIRECT_URI. For local development this is usually:texthttp://localhost:3000/api/auth/google/callback(This is the exact route defined in the backend to receive the Google code: GET /api/auth/google/callback)
After creation, Google will give you a Client ID and Client Secret.

Then set:

GOOGLE_CLIENT_ID = the Client ID
GOOGLE_CLIENT_SECRET = the Client Secret
GOOGLE_REDIRECT_URI = the same Redirect URI you registered in step 6 (it must match character-for-character, otherwise Google returns redirect_uri_mismatch)

The frontend usage flow is explained in the Auth section.

3. General Request & Response Format

All routes are under the /api prefix (except GET /health).
Request bodies (except file uploads) are sent as application/json.
Almost all successful responses look like this (in a few places message: true is used instead of status, which is a minor inconsistency in the code, but the data key is always present):JSON{
  "status": true,
  "message": "description or empty",
  "data": { }
}
Error responses (from errorMiddleware) always look like this:JSON{
  "status": 400,
  "message": "error text"
}Therefore the best way to detect errors on the frontend is to check the HTTP status code (400/401/403/404/500), not only the body content.
Routes protected by validateMiddleware return a 400 with field-level details when express-validator validation fails.

4. Authentication & Tokens

After a successful login the server returns an accessToken (JWT) in the response body. It must be sent in the header of every protected request:textAuthorization: Bearer <accessToken>
At the same time a refreshToken is set as an httpOnly cookie on the browser (the frontend cannot access it directly; the browser automatically sends it with every request to the same origin, provided credentials: true / withCredentials: true is set in fetch/axios).
When the accessToken expires, call POST /api/auth/refresh-token (no body, only the refresh cookie) to obtain a new accessToken.
For every AJAX request (fetch/axios) to the backend always set credentials: "include" (fetch) or withCredentials: true (axios) so the refresh-token cookie is exchanged.

5. PBAC Access Control System (Very Important for Frontend)
Instead of binding permissions directly to Roles, this project uses a Resource + Action model:

Each Permission is a (resource, action) pair, e.g. course:create or wallet:confirm-withdraw.
The predefined Resources and Actions can be fetched from GET /api/permission/get-resources-and-actions (the full list is also shown below).
Each user has one or more Roles, and each Role has a set of Permissions.
In addition, a Permission can be granted or denied to a specific user via ALLOW or DENY, which overrides the role-based access.
Evaluation order: first the user’s personal Exception (if present, it is decisive) → then the permissions of the user’s roles.

Most important point for the frontend: After login (response of POST /api/auth/login or GET /api/user/profile) two fields are returned: roles (including each role’s permissions in resource:action format) and userExceptionPermissions. The frontend must decide which buttons/pages to show based on this list, not merely on the role name. If a user lacks the required permission and still sends the request, the server responds with 403.

6. Complete API Documentation
🔒 means the route requires the Authorization: Bearer <token> header.
🔑 means, in addition to being logged in, a specific Permission is required (shown next to the route).
Health
GET /health

Access: Public
Purpose: Check that the server is up.
Response: Plain text it's healthy


Auth (/api/auth)
POST /api/auth/register

Access: Public
Purpose: Register a new user with email/password. After registration a 6-digit verification code is sent to the user’s email (requires Email_User / Email_Password to be set).
Request body:JSON{
  "email": "user@example.com",
  "password": "123456",
  "name": "Ali"
}
Successful response (201):JSON{
  "status": true,
  "message": "User registered successfully. Please verify your email.",
  "data": { "id": "...", "name": "...", "email": "...", "isEmailVerified": false }
}
Common errors: 400 if the email already exists.

POST /api/auth/verify-email

Access: Public
Purpose: Verify email with the 6-digit code that was sent.
Body: { "email": "user@example.com", "code": "123456" }
Response (201): User data with isEmailVerified: true
Errors: Wrong code, expired code (valid for 24 hours), or already verified.

POST /api/auth/send-verification-token-again

Access: Public
Purpose: Resend the email verification code (when the previous one was lost or expired).
Body: { "email": "user@example.com" }

POST /api/auth/login

Access: Public
Purpose: Login with email/password. Response behaviour depends on the user’s security settings:
If the email is not verified → 400 error.
If the user has email 2FA enabled (twoFactorEnabled) → a code is sent to their email and the response is only {"status": true, "message": "check your email"}; the frontend should take the user to the next step (/login-step-two).
If the user has QR/TOTP enabled (qrCodeEnabled) → the response contains otpAuthUrl and secret (see QR/TOTP section) and the user must enter the Authenticator app code (/qrcode).
Otherwise → login is completed here and an accessToken is returned.

Body: { "email": "user@example.com", "password": "123456" }
Simple successful response (201):JSON{
  "status": true,
  "message": "Login successful",
  "data": {
    "id": "...", "name": "...", "email": "...",
    "twoFactorEnabled": false, "qrCodeEnabled": false,
    "roles": [ { "id": "...", "name": "student", "permissions": ["course:enroll"] } ],
    "userExceptionPermissions": [ { "resource": "wallet", "action": "confirm-withdraw", "type": "ALLOW" } ],
    "accessToken": "eyJhbGciOi..."
  }
}(At the same time the refreshToken cookie is set on the browser)

POST /api/auth/login-step-two

Access: Public (but only meaningful after the login step when email 2FA is active)
Purpose: Complete login with the 6-digit code sent to the email.
Body: { "email": "user@example.com", "password": "123456", "token": "123456" }
Response (201): Same as a successful simple login (includes accessToken)

POST /api/auth/refresh-token

Access: Requires a valid refreshToken cookie (no Authorization header needed)
Body: None
Response (200): { "status": true, "message": "Access token refreshed", "data": { "accessToken": "..." } }

POST /api/auth/forgot-password

Access: Public
Purpose: Send an email containing a password-reset link.
Body: { "email": "user@example.com", "route": "https://frontend.app/reset-password" } — the route value is supplied by the frontend; the server appends ?token=... and emails that link (the frontend must have a page at that path that reads the token query parameter).
Response: { "message": "a link will send to your email" }

POST /api/auth/reset-password

Access: Public
Body: { "email": "user@example.com", "token": "<from URL>", "password": "newPass123" }
Response (201): User data with success message

PUT /api/auth/active-2fa 🔒

Purpose: Enable email two-factor authentication for the logged-in user (and disable QR if it was active).
Body: { "password": "123456" } (to confirm identity before changing security settings)
Response (201): User data with twoFactorEnabled: true

PUT /api/auth/deactive-2fa 🔒

Body: { "password": "123456" }
Purpose: Disable email 2FA

PUT /api/auth/active-qrcode 🔒

Purpose: Enable two-factor login with an Authenticator app (TOTP) — and disable email 2FA if it was active.
Body: { "password": "123456" }
Response (201): { "message": "qr code setup is done", "data": { "id", "email", "name", "qrCodeEnabled": true, "twoFactorEnabled": false } }Note: This route only enables the feature; the actual QR secret is generated and returned on the next login request (/login) (a new secret is created on every login). After activation, the next time the user logs in via /login the response will contain otpAuthUrl and secret.

PUT /api/auth/deactive-qrcode 🔒

Body: { "password": "123456" }
Purpose: Disable QR/TOTP login

POST /api/auth/qrcode

Access: Public (part of the login flow when the user’s qrCodeEnabled is true)
Purpose: Complete login by entering the code shown by the Authenticator app (e.g. Google Authenticator).
Body: { "email": "user@example.com", "password": "123456", "code": "123456" } (6-digit TOTP code)
Response (201): Same as a successful login (includes accessToken)
Frontend guidance for the QR page: When you receive otpAuthUrl from /login, generate a QR image from that string (e.g. with qrcode.react or any client-side QR library — the backend does not return an image, only the textual otpAuthUrl). The user scans it in their Authenticator app and receives a 6-digit code to send in the code field.

GET /api/auth/google-step-one

Access: Public
Purpose: Start the Google login flow. This route redirects the user (HTTP redirect) directly to Google’s login page.
Frontend usage: Simply send the user’s browser to this address (window.location.href = "http://localhost:3000/api/auth/google-step-one"). This is not a normal fetch/AJAX call.

GET /api/auth/google/callback

Access: Called by Google (query param named code)
Purpose: After the user approves on Google, this address (also registered in GOOGLE_REDIRECT_URI) is called; the server finds/creates the user in the database and issues an accessToken + refreshToken cookie.
Response (200): JSON similar to a normal login response, including accessToken. (If you want the user to land on a frontend page with the token after this redirect, coordinate with the backend team to change this route to redirect to a frontend URL with the token in the query string — currently it returns raw JSON.)


User (/api/user)
GET /api/user/profile 🔒

Purpose: Get the full profile of the logged-in user (including profile data, pictures, wallet, roles/permissions).
Response (200):JSON{
  "status": true,
  "data": {
    "id": "...", "name": "...", "email": "...", "gender": "MALE",
    "isActive": true, "isEmailVerified": true,
    "twoFactorEnabled": false, "qrCodeEnabled": false,
    "profile": { "phone": "...", "country": "...", "city": "...", "bio": "..." },
    "wallet": { "id": "...", "balance": 0 },
    "userPictures": [ { "id": "...", "url": "http://localhost:3000/api/user/image/<id>", "isMain": true } ],
    "roles": [ { "id": "...", "name": "student", "permissions": ["course:enroll"] } ],
    "userExceptionPermissions": [ { "resource": "...", "action": "...", "type": "ALLOW" } ]
  }
}

PUT /api/user/update-profile 🔒

Purpose: Update the user’s profile information (name, gender, email, address, etc.).
Important note: If the user fills in all of phone, country, state, city, address, bio, the server automatically grants the course:enroll permission as ALLOW to that user (i.e. completing the profile is a prerequisite for enrolling in courses).
Body (everything except name is optional):JSON{
  "name": "Ali Rezaei",
  "email": "new@example.com",
  "gender": "MALE",
  "phone": "0912...",
  "country": "Iran", "state": "Tehran", "city": "Tehran",
  "address": "...", "bio": "...", "avatar": "..."
}
Response (201): Updated user object including profile

GET /api/user/all-users 🔑 user:read

Purpose: List all users (for admin panel) with search/filter/sort/pagination.
Query parameters (all optional): search, name, email, gender(MALE/FEMALE/OTHER), isActive, isDelete, country, state, city, sortBy(name/email/gender/createdAt/isActive), order(asc/desc), page, limit
Response (200): { status, data: { users: [...], pagination: { totalCount, totalPages, currentPage, limit, hasNextPage, hasPreviousPage } } }

POST /api/user/upload-profile-images 🔒

Purpose: Upload one or more profile pictures (maximum 5 images per request).
Body type: multipart/form-data, the field name for the files must be exactly files (because the backend reads them with upload.array("files", 5)):JavaScriptconst formData = new FormData();
formData.append("files", file1);
formData.append("files", file2);
Response (201): Array of the registered images (the first uploaded image is automatically set as isMain: true)

GET /api/user/image/:imageId 🔒

Purpose: Retrieve the raw profile image file of the logged-in user (the response is an image file, not JSON — because it requires an Authorization header, it is usually better for the frontend to fetch the image and display it via a blob URL rather than putting it directly in an <img> src).

PUT /api/user/change-main-image/:imageId 🔒

Purpose: Set a picture as the main profile picture.
Response (200): Updated list of the user’s pictures

DELETE /api/user/delete-user-image/:imageId 🔒

Purpose: Delete a profile picture (if the main picture is deleted, the oldest remaining picture is automatically promoted).


Role (/api/role)
GET /api/role/get-all-roules 🔑 role:read

Purpose: Get the list of all roles in the system (e.g. for displaying in an “Add role to user” form).
Response: { message: true, data: [ { "id": "...", "name": "student", "description": "...", "isActive": true } ] }

Note: The default roles defined in constants/permissions.ts are: super_admin, admin, teacher, student, user, referee, mentor — but these are only code-side constants; the actual roles must exist in the database (e.g. via seed or direct creation) for this API to return anything.

Permission (/api/permission)
GET /api/permission/get-all-permission 🔑 permission:read

Purpose: List all Permissions created in the database (resource + action).

GET /api/permission/get-resources-and-actions 🔑 permission:read

Purpose: Get the complete list of allowed Resources and Actions values (for building an “Add new Permission” form in the admin panel so the user does not type arbitrary values).
Response:JSON{
  "message": true,
  "data": {
    "resources": {
      "COURSE": "course",
      "USER": "user",
      "COMMENT": "comment",
      "ORDER": "order",
      "PROFILE": "profile",
      "ROLE": "role",
      "PERMISSION": "permission",
      "ROLEPERMISSION": "role-permission",
      "USERPERMISSION": "user-permission",
      "WALLET": "wallet",
      "CATEGPRY": "category",
      "COURSETYPE": "course-type",
      "RESERVE": "reserve"
    },
    "actions": {
      "CREATE": "create",
      "READ": "read",
      "UPDATE": "update",
      "DELETE": "delete",
      "LIKE": "like",
      "ENROLL": "enroll",
      "FAVORITE": "favorite",
      "CONFIRM": "confirm",
      "REJECT": "reject",
      "GENERAL": "general"
    }
  }
}

POST /api/permission/add-new-permission 🔑 permission:create

Body: { "resource": "course", "action": "create", "description": "optional" } (the resource/action values must be exactly one of the values above)
Response: The created Permission

DELETE /api/permission/delete-permission/:permissionId 🔑 permission:delete

Path parameter: permissionId (UUID)


Role-Permission (/api/role-permission)
Manages which Permissions each Role has.
GET /api/role-permission/get-all-role-Permission 🔑 role-permission:read

List of all roles together with their Permissions.

GET /api/role-permission/get-single-role-Permission/:roleId 🔑 role-permission:read

Details of a specific role together with its Permissions.

GET /api/role-permission/get-all-Permission-role 🔑 role-permission:read

List of all Permissions together with the roles they are attached to.

GET /api/role-permission/get-single-Permission-roles/:permissionId 🔑 role-permission:read

Details of a specific Permission together with the roles that have it.

POST /api/role-permission/add-permission-to-role 🔑 role-permission:create

Body: { "roleId": "...", "permissionId": "..." }
Purpose: Add a Permission to a Role.

DELETE /api/role-permission/delete-permission-from-role 🔑 role-permission:delete

Body: { "roleId": "...", "permissionId": "..." }


User-Role (/api/user-role)
POST /api/user-role/add-role-to-user 🔒

Purpose: Assign a role to a user (e.g. turn a normal user into a teacher).
Body: { "userId": "<UUID>", "roleId": "<UUID>" }
Response (201): { "message": "role added successfully to user", "data": {...} }
Error: 400 if the user already has that role.

Note: This route does not directly use requirePermission, but similar routes are typically intended for the management panel; in practice it should be called by a user with a management role.

User-Permission-Exception (/api/user-permission-exception)
Manages permission overrides for a specific user (independent of their roles).
GET /api/user-permission-exception/get-user-permission/:userId 🔑 user-permission:read

Purpose: Get the final calculated list of a user’s permissions (roles + Allows − Denies).
Response: { status: true, data: { user: {id,name,email}, permissions: [ {resource, action}, ... ] } }

GET /api/user-permission-exception/get-user-exeption-permission/:userId 🔑 user-permission:read

Purpose: Get only the raw list of Exceptions (ALLOW/DENY) registered for that user (without calculating roles).

POST /api/user-permission-exception/add-permission-to-user 🔑 user-permission:create

Purpose: Grant a specific permission (ALLOW) to a specific user, independent of their role.
Body: { "userId": "<UUID>", "permissionId": "<UUID>" }

DELETE /api/user-permission-exception/delete-permission-from-user 🔑 user-permission:delete

Purpose: Remove an ALLOW Exception that was previously registered.
Body: { "userId": "<UUID>", "permissionId": "<UUID>" }

POST /api/user-permission-exception/deny-permission-to-user 🔑 user-permission:create

Purpose: Explicitly take a permission away from a specific user (DENY), even if their role has that permission.
Body: { "userId": "<UUID>", "permissionId": "<UUID>" }

DELETE /api/user-permission-exception/delete-deny-permission-from-user 🔑 user-permission:delete

Purpose: Remove a DENY Exception.
Body: { "userId": "<UUID>", "permissionId": "<UUID>" }


Course Category (/api/course-category)
Course categories (tree structure with parentId).
POST /api/course-category/add-new-category 🔒

Body: { "categoryName": "Programming", "parentId": 1 } (parentId is optional, used to create a subcategory)

GET /api/course-category/get-all-categories 🔒

Query: categoryName, sortBy, order(asc/desc), page, limit
Response: { status, data: { list: [...], pagination: {...} } } — each item also includes children (subcategories).

GET /api/course-category/detail/:id 🔑 category:read

Parameter: id (integer)

DELETE /api/course-category/delete/:id 🔑 category:delete

Course Type (/api/courseType)
Course type (e.g. in-person/online or any other parallel classification).
POST /api/courseType/add-new-type 🔑 course-type:general

Body: { "typeName": "Online" } (2 to 50 characters)

GET /api/courseType/get-all-types 🔒

List of all course types

DELETE /api/courseType/delete/:id 🔑 course-type:general

Course (/api/course)
GET /api/course/get-all-courses

Access: Public; however if you send a valid token (optional), the response includes extra information such as whether the current user has liked/disliked the course (thanks to the hasUser middleware).
Purpose: List of published courses (status: published) with filter/search/pagination.
Query parameters: search, typeId, level(beginner/intermediate/advanced), minPrice, maxPrice, courseCategoryIdsArray (JSON array or [1,2]), sortBy(title/createdAt/totalStudent/duration/price/discountPrice), order, page, limit, count
Response: { status, data: { list: [...], pagination: {...} } }

GET /api/course/get-course-detail/:courseId

Access: Public (optionally with token, same as above)
Parameter: courseId (UUID)
Purpose: Full details of a course (description, price, teachers, like/dislike stats and current-user status).

GET /api/course/create-course-helper 🔑 course:read

Purpose: A helper that returns the allowed values for CourseStatus, CourseLevel and the routes for fetching categories/types (useful for building admin forms).

POST /api/course/create-course-step-one 🔑 course:create

Purpose: First step of creating a course (basic information). The course stays in status: draft until the second step.
Body:JSON{
  "title": "JavaScript Course",
  "shortDescription": "Short description",
  "isFree": false,
  "level": "beginner",
  "teacherId": "<UUID of a user who has the teacher role>",
  "typeId": 1
}
Response (201): The created course object (includes the id needed for step two)
Error: 400 if the teacherId does not have the teacher role.

POST /api/course/create-course-step-two 🔑 course:create

Purpose: Complete the course information (price, full description, capacity, categories) and, on success, change the status to published.
Body:JSON{
  "courseId": "<from step one>",
  "courseCategoryIdsArray": [1, 2],
  "price": 250000,
  "fullDescription": "Full course description",
  "language": "fa",
  "certificateAvailable": true,
  "capacity": 50,
  "slug": "js-course",
  "duration": "10 hours",
  "status": "published"
}
Error: 400 if the course has already completed the second step.

PUT /api/course/update-course 🔑 course:update

Purpose: Edit any part of a course (all fields except courseId are optional; only the fields you send are updated).
Body: Combination of step-one and step-two fields + required courseId.


Course Like (/api/course-like)
POST /api/course-like/add-like/:courseId 🔒

Like a course (if the user previously disliked it, the dislike is automatically removed)

DELETE /api/course-like/delete-like/:courseId 🔒

Remove a like

POST /api/course-like/disLike/:courseId 🔒

Dislike a course (if the user previously liked it, the like is automatically removed)

DELETE /api/course-like/delete-disLike/:courseId 🔒

Remove a dislike


Course Comment (/api/course-comment)
Course comments in a tree structure (replies to replies) with an approve/reject workflow.
POST /api/course-comment/add-course-comment 🔒

Body: { "courseId": "<UUID>", "parentId": "<UUID or empty for a root comment>", "text": "comment text (max 2000 characters)" }
Note: A newly submitted comment has isConfirm: false, so it will not appear in the public list until it is approved.

GET /api/course-comment/get-course-comment/:courseId 🔒

Returns only approved root comments (without parentId) of a course — suitable for public display.

GET /api/course-comment/get-comment-replies/:commentId 🔒

Approved replies of a specific comment.

PUT /api/course-comment/update-comment 🔒

Body: { "commentId": "<UUID>", "text": "new text" }
Only the author of that comment can edit it.

DELETE /api/course-comment/delete-course-comment/:commentId 🔒

Only the author can delete (soft delete).

GET /api/course-comment/get-course-comment-with-permission/:courseId 🔑 comment:read

Admin version: returns all root comments (whether approved or not) — for the comment moderation panel.

GET /api/course-comment/get-comment-replies-with-permission/:commentId 🔑 comment:read

All replies of a comment (approved or not)

PUT /api/course-comment/confirm-course-comment-with-permission/:commentId 🔑 comment:confirm

Approve a comment for public display

PUT /api/course-comment/reject-course-comment-with-permission/:commentId 🔑 comment:reject

Reject a comment


Course Video (/api/course-video)
Upload of course session videos using the tus protocol (resumable uploads — suitable for large files).
* /api/course-video/upload 🔒

Protocol: tus resumable upload protocol — this is not a normal REST route; you must use a tus client library on the frontend (e.g. tus-js-client or the Uppy plugin), not ordinary fetch/axios.
Allowed file formats: only .mp4 and .webm.
Required metadata when starting the upload (metadata in tus):
filename: file name (used to detect the extension)
filetype: e.g. video/mp4
courseId: UUID of the course this video belongs to (must already exist in the database)
sessionNumber: session number (integer)

Example usage on the frontend (with tus-js-client):JavaScriptimport * as tus from "tus-js-client";

const upload = new tus.Upload(file, {
  endpoint: "http://localhost:3000/api/course-video/upload",
  headers: { Authorization: `Bearer ${accessToken}` },
  metadata: {
    filename: file.name,
    filetype: file.type,
    courseId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    sessionNumber: "1",
  },
  onProgress: (bytesUploaded, bytesTotal) => {
    console.log(`${((bytesUploaded / bytesTotal) * 100).toFixed(1)}%`);
  },
  onSuccess: () => console.log("Upload completed"),
});

upload.start();
After the upload finishes, a CourseVideo record is automatically created in the database and linked to the course.

GET /api/course-video/stream/:fileId

Access: Public (no token required)
Purpose: Stream the video with support for the Range header (i.e. it can be used directly in a <video> tag: <video src="http://localhost:3000/api/course-video/stream/<fileId>" controls />)
Parameter: fileId = the id of the CourseVideo record that was created after upload.


Enrollment (/api/enrollment)
Complete enrollment flow: Reserve → Admin/Teacher Confirm/Reject → Finalize (pay from wallet) by the user.
POST /api/enrollment/reserve-course/:courseId 🔑 course:enroll

Purpose: Reserve a seat in a course (reservation is valid for 3 days). If the course capacity is full, a 400 error is returned.
Prerequisite: According to the User section, the user must have completed their profile so that this Permission is automatically granted.
Response: The created reservation record (isConfirm: false, expiresAt: ...)

GET /api/enrollment/get-all-reserves 🔑 reserve:read

Purpose: List of all reservations (admin panel) with many filters.
Query: createdAtStart, createdAtEnd, expiresAtStart, expiresAtEnd, courseId, userId, courseName, userName, isConfirm, isReject, isDelete, page, limit

POST /api/enrollment/confirm-course-reserve/:reserveId 🔑 reserve:confirm

Purpose: Confirm a reservation by an admin/teacher (course capacity is checked again).

POST /api/enrollment/reject-course-reserve/:reserveId 🔑 reserve:reject

Purpose: Reject a reservation (if the user has already completed final enrollment, rejection is not allowed).

GET /api/enrollment/get-my-course-reserves 🔒

Purpose: List of the logged-in user’s own reservations (with filters similar to above, excluding userId/userName).

GET /api/enrollment/get-my-enrooled-course 🔒

Purpose: List of courses the user has actually finalized enrollment in (courseName can be filtered).Note: The route name is intentionally/mistakenly written as enrooled (not enrolled) — when calling it you must use exactly this spelling.

POST /api/enrollment/finalized-enrollment/:reserveId 🔒

Purpose: Finalize enrollment after the reservation has been confirmed: the course price is deducted from the user’s wallet (unless the course is free) and a CourseInvoice is created.
Prerequisites: The reservation must be isConfirm: true, not expired, and the user must have sufficient wallet balance (otherwise they must first top up via wallet/payment-request).
Common errors: "You don't have a wallet...", "Insufficient balance...", "Course capacity is full..."


Wallet (/api/wallet)
Internal wallet for each user, integrated with the ZarinPal (sandbox/test) payment gateway.
POST /api/wallet/payment-request 🔒

Purpose: Start the wallet top-up process — sends a payment request to the ZarinPal sandbox and creates a PENDING transaction.
Body: { "amount": 100000, "description": "optional description", "callback_url": "https://frontend.app/wallet/callback" }
Response: { "message": true, "data": "<authority>" } — use the authority value to redirect the user to the ZarinPal payment gateway:texthttps://sandbox.zarinpal.com/pg/StartPay/<authority>(Currently the backend does not perform this redirect itself; it only returns the authority — the frontend must build this link and redirect the user.)

GET /api/wallet/payment-result 🔒

Purpose: After the user returns from the ZarinPal gateway to the callback_url, ZarinPal calls it with the query parameters Authority and Status; the frontend must pass these parameters to this route so the payment is finalized and the wallet balance is updated.
Query: Authority (required), Status (OK or NOK)
Successful response: { "message": "payment was successfull", "refId": 123456 }

POST /api/wallet/withdraw-request 🔒

Purpose: Request a withdrawal from the wallet (status remains PENDING until admin confirmation).
Body: { "amount": 50000, "description": "optional", "sheba": "IR820540102680020817909002" } (IBAN, 24 to 26 characters)

POST /api/wallet/confirm-withdraw 🔑 wallet:confirm-withdraw

Purpose: Final confirmation of a withdrawal request by an admin (the amount is deducted from the user’s balance).
Body: { "transActionId": "<UUID of the transaction>" }


7. Important Notes for Frontend

Always decide which buttons/sections to show based on roles[].permissions and userExceptionPermissions (obtained after login or from /user/profile), not merely the role name, because the system can change permissions dynamically.
For every AJAX request to the backend, do not forget credentials: "include" (fetch) or withCredentials: true (axios); otherwise the refreshToken cookie will not be exchanged.
Handle errors based on the HTTP status code (not only a success field in the body), because the success and error response formats are not identical on every route (some places send status, others send message: true — a small inconsistency in the current backend code).
Most entity identifiers (User, Course, Permission, …) are UUIDs; only CourseCategory and CourseType are integers.
For pages whose response includes pagination, use page and limit in the query string (defaults are configurable in the code, but usually starts at page=1).
A complete Postman Collection of all requests is available at postman-api/apis.json in the project; you can import it directly into Postman for faster testing.