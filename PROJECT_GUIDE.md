# Bloomfield Amenities Booking Application - Codebase Guide

This document explains every key file and section of code in the **Bloomfield Subdivision Amenities Booking System** in simple terms. 

---

## 🏗️ Project Architecture Overview
The application is split into two distinct parts:
1. **Backend (Laravel API)**: Serves as the central server. It handles the database, checks user permissions (authentication and roles), runs validation, and processes business logic (e.g., preventing overlapping timeslot bookings).
2. **Frontend (React + Vite + Tailwind CSS v4)**: The user interface that residents and administrators interact with. It communicates with the backend via API calls (using Axios).

---

## 🗄️ Backend (Laravel API)

The backend is built with Laravel. It exposes API endpoints that the React frontend calls.

### 1. Database Models (`backend/app/Models`)
Models represent database tables and define relationship behaviors in Laravel.

*   **[User.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Models/User.php)**: 
    *   **What it represents**: The `users` table. Represents either a **Resident (User)** or an **Administrator**.
    *   **Key Logic**:
        *   `$fillable`: Defines fields we can insert/update safely (`name`, `email`, `password`, `role`, `profile_image`).
        *   `isAdmin()`: A helper function that returns `true` if the user's role is `'admin'`.
        *   `bookings()`: Establishes a **One-to-Many** relationship with the `Booking` model (one resident can make multiple bookings).
        *   `getProfileImageUrlAttribute()`: Generates a full web address (URL) for the user's uploaded profile photo stored on the server.
*   **[Amenity.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Models/Amenity.php)**: 
    *   **What it represents**: The `amenities` table (e.g., Basketball Court, Clubhouse, Swimming Pool).
    *   **Key Logic**:
        *   Contains fields like `name`, `description`, `location`, `capacity`, and `status` (`active` or `inactive`).
        *   `bookings()`: Establishes a relationship showing that an amenity can have many bookings over time.
        *   `getImageUrlAttribute()`: Generates the full URL path to load the facility image.
*   **[Booking.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Models/Booking.php)**: 
    *   **What it represents**: The `bookings` table, connecting a Resident (`user_id`) with a Facility (`amenity_id`) for a specific period of time.
    *   **Key Logic**:
        *   `casts`: Tells Laravel to automatically treat the raw string dates `start_time` and `end_time` as Carbon date objects so we can easily compare them.
        *   `user()` & `amenity()`: Relationships pointing back to which resident made the booking and which facility is being reserved.

---

### 2. Routes & Middleware (`backend/routes` & `backend/app/Http/Middleware`)
These control how URLs are matched to controller actions and who is allowed to access them.

*   **[api.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/routes/api.php)**: 
    *   **What it does**: Maps URL endpoints (like `/api/login`) to the correct controller methods.
    *   **Logic Sections**:
        1.  *Public Routes*: Anyone can register, log in, or view the basic list of active amenities.
        2.  *Protected Resident Routes (`auth:sanctum`)*: Requires a valid login token. Allows logout, profile updates, showing the resident's bookings, creating a booking, and cancelling bookings.
        3.  *Protected Admin Routes (`auth:sanctum` and `admin` middleware)*: Requires being logged in **and** having an `admin` role. Allows stats access, creating new admins, facility CRUD operations (Create, Read, Update, Delete), and managing bookings.
*   **[AdminMiddleware.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Http/Middleware/AdminMiddleware.php)**:
    *   **What it does**: Intercepts requests meant for administrators.
    *   **Logic**: Checks if the logged-in user has the `role === 'admin'`. If yes, let the request proceed. If no, block it and return a `403 Unauthorized` message.

---

### 3. HTTP Controllers (`backend/app/Http/Controllers`)
Controllers contain the actual coding logic for each function.

*   **[AuthController.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Http/Controllers/AuthController.php)**:
    *   `register()`: Takes resident registration details, encrypts (hashes) the password, creates the database record with the `'user'` role, and returns an access token.
    *   `login()`: Finds the user by email, checks if the password matches, and generates a new Sanctum API token.
    *   `logout()`: Revokes and deletes the current active API token.
    *   `updateProfile()`: Allows residents or admins to change their name, email, or upload/replace a profile avatar file.
    *   `updatePassword()`: Validates the current password and sets a new encrypted password.
    *   `registerAdmin()`: Allows an existing admin to create a new admin user record.
*   **[AmenityController.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Http/Controllers/AmenityController.php)**:
    *   `index()`: Returns only active facilities (for the public landing page and resident booking lists).
    *   `adminIndex()`: Returns all facilities (including inactive ones) so administrators can manage them.
    *   `store()`, `update()`, `destroy()`: Admin actions to create a facility with an optional image, edit existing settings, or delete a facility.
*   **[BookingController.php](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/backend/app/Http/Controllers/BookingController.php)**:
    *   *Resident Actions*:
        *   `index()`: Gets all bookings belonging to the logged-in resident.
        *   `store()`: Creates a booking request. **Crucial Logic**: Checks if the facility is active and searches the database to make sure there are no other approved or pending bookings that overlap during the requested time window.
        *   `update()`: Edits times/purpose of a booking, but only if the status is still `'pending'`. Also reruns the timeslot conflict validation check.
        *   `cancel()`: Updates status to `'cancelled'`.
    *   *Admin Actions*:
        *   `adminIndex()`: Gets all bookings in the system (preloads both User and Amenity details).
        *   `adminStore()` & `adminUpdate()`: Allows administrators to create bookings for any user or change any booking (approving, rejecting, or rescheduling).
        *   `adminStats()`: Gathers numbers for the admin dashboard cards (total bookings, pending count, active amenities, total residents).

---

## 💻 Frontend (React + Vite)

The frontend is a single-page React app. It uses React Router for page paths and Axios to fetch data.

### 1. Global Setup (`frontend/src/`)

*   **[main.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/main.jsx)**: The starting point of the React app. Mounts the main `App` component into the HTML container.
*   **[App.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/App.jsx)**: 
    *   Defines routes (URLs) and which component should render.
    *   Wraps routes inside authentication guards (`ProtectedRoute` / `AdminRoute`) and layouts (`UserLayout` / `AdminLayout`).
*   **[api.js](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/services/api.js)**:
    *   Defines the base backend address (`http://localhost:8000/api`).
    *   **Request Interceptor**: Automatically inserts the stored JWT Token into the HTTP header of every request so the server knows who is calling.
    *   **Response Interceptor**: If the backend says `401 Unauthorized` (meaning your session expired), it automatically cleans local storage and sends you back to the `/login` page with an `expired=true` URL tag.

---

### 2. Context & Route Guards (`frontend/src/context` & `frontend/src/components`)

*   **[AuthContext.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/context/AuthContext.jsx)**:
    *   Provides global login status (`user`, `token`, `loading`) across the app.
    *   Stores credentials in `localStorage` so the user doesn't have to log in again on page refresh.
    *   Exposes `login()`, `logout()`, `register()`, and `refreshUser()` functions to components.
*   **[RouteGuards.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/components/RouteGuards.jsx)**:
    *   `ProtectedRoute`: Checks if a user has a token. If not, redirects them to `/login`.
    *   `AdminRoute`: Checks if the user is logged in **and** is an admin. If they are a normal resident, redirects them to the resident `/dashboard`.

---

### 3. Interface Layouts (`frontend/src/layouts`)
Layouts serve as structural shells around our page content.

*   **[UserLayout.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/layouts/UserLayout.jsx)**:
    *   The resident layout shell.
    *   Features a desktop sidebar containing links to Dashboard, Amenities, My Bookings, and Profile.
    *   Includes user information and a Logout button.
*   **[AdminLayout.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/layouts/AdminLayout.jsx)**:
    *   The admin layout shell.
    *   Identical in structure to `UserLayout` but contains admin links: Admin Dashboard, Manage Amenities, Manage Bookings, Add Admin, and Profile.

---

### 4. Pages (`frontend/src/pages`)

#### Public Pages
*   **[LandingPage.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/LandingPage.jsx)**: The home page showcasing the subdivision hero banner, stats numbers, and cards displaying all available facilities.
*   **[Login.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/Login.jsx)**: Form allowing residents and admins to sign in. Handles session-expired messages.
*   **[Register.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/Register.jsx)**: Form for new residents to register.
*   **[Profile.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/Profile.jsx)**: Shared page for both residents and admins. Divided into two sections:
    1.  *Profile Information*: Edit name, email, and upload a profile picture file. Renders a preview.
    2.  *Change Password*: Fields for Current Password, New Password, and Password Confirmation.

#### Resident Pages (`frontend/src/pages/user`)
*   **[Dashboard.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/user/Dashboard.jsx)**:
    *   Displays stats (Total, Approved, and Pending Bookings). Renders a dashboard alert banner detailing the resident's *next upcoming approved booking*.
    *   Provides quick link cards to schedule a slot or view booking logs.
*   **[AmenitiesList.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/user/AmenitiesList.jsx)**: Lists all active subdivision facilities. Clicking "Book This Facility" navigates to the booking form with the facility ID pre-selected.
*   **[BookingForm.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/user/BookingForm.jsx)**:
    *   Handles both **creating** a new booking and **editing** a pending reservation.
    *   Provides select menus, start/end datetime selectors, and a text block for booking purpose.
*   **[BookingsList.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/user/BookingsList.jsx)**:
    *   Shows a table of the resident's current and past bookings.
    *   Displays stylized badges for status levels (`pending`, `approved`, `rejected`, `cancelled`).
    *   Allows residents to edit or cancel bookings if eligible.

#### Admin Pages (`frontend/src/pages/admin`)
*   **[Dashboard.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/admin/Dashboard.jsx)**:
    *   Displays high-level stats cards (e.g. system-wide reservations, pending queue length, active facilities, registered residents).
    *   Shows a queue of the **Top 5 Pending Approvals** with quick "Approve" and "Reject" buttons.
*   **[AmenitiesCrud.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/admin/AmenitiesCrud.jsx)**:
    *   A table displaying all facilities.
    *   Contains a pop-up modal form to create or edit facilities (configuring name, location, capacity, status, and uploading a cover photo).
    *   Supports deleting facility configurations.
*   **[BookingsCrud.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/admin/BookingsCrud.jsx)**:
    *   A master dashboard showing all bookings in the system.
    *   Includes a modal allowing admins to book a facility on behalf of any resident, reschedule timeslots, or manually change statuses.
*   **[AddAdmin.jsx](file:///d:/xampp/htdocs/bloomfield_ameneties_booking_application/frontend/src/pages/admin/AddAdmin.jsx)**: A simple form permitting admins to register other administrative accounts.

---

## 🔁 Complete Application Flow Example
Here is how the pieces work together in a typical scenario (Resident books the Clubhouse):
1.  **Frontend Routing**: User logs in, visits the `/amenities` page, and clicks "Book This Facility" on the Clubhouse card.
2.  **Form Entry**: The client goes to `/bookings/new?amenity_id=X`. They enter a start time, end time, and click "Request Booking".
3.  **HTTP Request**: React makes an Axios POST request to `http://localhost:8000/api/bookings`, sending the parameters and attaching their user token in the header.
4.  **Backend Verification**: 
    *   Laravel’s `auth:sanctum` verifies the token and identifies the user.
    *   `BookingController@store` runs validation. It queries the database for any approved bookings for Clubhouse (`amenity_id = X`) overlapping the requested window.
5.  **Database Commit**: If no conflict is found, it saves the booking in the database with status `'pending'` and returns success.
6.  **Admin Portal Action**: An administrator opens the Admin Dashboard page `/admin/dashboard`, sees the new Clubhouse request in the "Pending Approvals Queue", and clicks "Approve". 
7.  **Final Update**: React makes a PUT request to update the status to `'approved'`. The resident's dashboard now displays this booking under "Upcoming Schedule".
