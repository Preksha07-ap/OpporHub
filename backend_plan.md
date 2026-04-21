# OpportunityHub Backend Implementation Plan

This is a comprehensive, step-by-step plan for building the `OpportunityHub` backend. Based on the frontend features (Student Portal, Organizer Portal, Waitlist), the backend will need to handle robust authentication, role-based access control, event management, and analytics.

---

## 1. Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose as ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt (for password hashing)
- **Validation:** Joi or express-validator
- **File Storage:** Cloudinary or AWS S3 (for event cover images and profile pictures)

---

## 2. Core Entities (Models)

### `User` Model
- Handles both **Students** and **Organizers**.
- **Fields:** `name`, `email`, `password`, `role` (Enum: `STUDENT`, `ORGANIZER`), `profileData` (University info for students, Organization info for organizers).

### `Event` Model
- Created and managed by Organizers.
- **Fields:** `title`, `description`, `date`, `location` (or link if virtual), `organizerId` (ref: User), `category`, `capacity`, `status` (Draft, Published, Completed), `coverImage`.

### `Registration` Model
- Associates Students with Events.
- **Fields:** `eventId` (ref: Event), `studentId` (ref: User), `registrationDate`, `status` (Pending, Confirmed, Waitlisted).

### `Waitlist` / `Analytics` Model (Optional)
- For tracking pre-launch waitlist or general platform engagement metrics for organizers.

---

## 3. Directory Structure
```
backend/
├── src/
│   ├── config/        # Database and Env configs
│   ├── controllers/   # Route handler functions
│   ├── middlewares/   # Custom middlewares (auth, errors)
│   ├── models/        # Mongoose schema definitions
│   ├── routes/        # Express route definitions
│   └── utils/         # Helper functions (API response, etc.)
├── .env               # Environment Variables
├── package.json
└── server.js          # Main entry point
```

---

## 4. API Routes

### Authentication (`/api/auth`)
- `POST /register`: Create new user (Student or Organizer).
- `POST /login`: Authenticate and return JWT.
- `GET /me`: Get current authenticated user profile.

### User/Profile (`/api/users`)
- `GET /:id`: Get public user profile.
- `PUT /me`: Update own profile (settings, notifications).

### Events (`/api/events`)
- `GET /`: Get all events (with pagination & filtering e.g., upcoming, category).
- `GET /:id`: Get distinct event details.
- `POST /`: Create an event (Organizer only).
- `PUT /:id`: Update an event (Organizer only, owner).
- `DELETE /:id`: Cancel/delete an event (Organizer only, owner).

### Registrations (`/api/registrations`)
- `POST /:eventId`: Register for an event (Student only).
- `DELETE /:eventId`: Cancel registration (Student only).
- `GET /event/:eventId`: Get attendees for an event (Organizer only).
- `GET /my-registrations`: Get events user is registered for (Student only).

### Analytics (`/api/analytics`)
- `GET /organizer`: Get overall or per-event metrics for organizers (e.g., total attendees, views over time).

---

## 5. Middleware Requirements
- **Auth Middleware (`protect`):** Verifies the JWT token and appends `req.user`.
- **Role Middleware (`authorize`):** Ensures only certain roles (e.g., `ORGANIZER`) can access specific routes (like creating events).
- **Error Handling Middleware:** Centralized try-catch wrapper and customized JSON error responses.

---

## 6. Implementation Phases

### Phase 1: Environment & Setup
1. Run `npm init -y` inside `/backend`.
2. Install dependencies: `express`, `mongoose`, `dotenv`, `cors`, `nodemon` (dev).
3. Set up server structure (`server.js`, `/controllers`, `/models`, `/routes`).
4. Connect to MongoDB locally or via MongoDB Atlas.

### Phase 2: Authentication System
1. Build `User` model.
2. Implement auth controllers (register, login) with bcrypt & JSON Web Tokens.
3. Build auth protection middleware.
4. Test with Postman or REST Client.

### Phase 3: Core Logic (Events & Registrations)
1. Build `Event` and `Registration` models.
2. Implement organizer routes to CRUD events.
3. Implement student routes to register/unregister.
4. Add pagination and querying logic to `GET /events`.

### Phase 4: Integration & Analytics
1. Implement aggregation pipelines for organizer analytics.
2. Hook up the backend to the React frontend.
3. Handle file uploads if required for event images via a third-party service.

## Next Steps
Does this structure sound good to you? If so, we can initialize the Node project, install dependencies, and build out Phase 1 immediately!
