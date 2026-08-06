# Detalyadong Project Build Guide — Bloomfield Amenities Booking Application

Ang gabay na ito ay ginawa para sa iyo na gusto mong maintindihan ang project nang mabuti bago ka mag-code. Hindi lang ito listahan ng files — ipapaliwanag ko rin kung bakit bawat file ang kailangan, ano ang ginagawa, at paano sila nag-uugnay sa isa't isa.

## 1. Paano gumagana ang project sa kabuuan

Ang project na ito ay may dalawang bahagi:

- Backend: Laravel API
  - Dito nangyayari ang logic ng sistema.
  - Dito pinaproseso ang login, booking, validation, at database operations.

- Frontend: React + Vite
  - Dito nakikita at pinoproseso ng user ang UI.
  - Dito nagse-send ang frontend ng requests sa backend.

Sa madaling salita:
- Ang frontend ang "pintuan" ng user.
- Ang backend ang " utak " ng sistema.

Kapag ang user ay nag-login, nag-book ng amenity, o nag-approve ng booking, ang frontend ay nagpapadala ng request sa backend. Ang backend ang nagcheck kung valid ba ang request, may conflict ba, at kung puwede bang i-save sa database.

---

## 2. Ang pangunahing flow ng sistema

Bago tayo mag-zoom sa bawat file, unahin muna natin ang normal flow ng isang user:

1. User opens the app.
2. User logs in.
3. User views the list of amenities.
4. User chooses a venue and books a schedule.
5. Backend checks if the requested time is available.
6. If available, booking is saved as pending.
7. Admin sees the booking request.
8. Admin approves or rejects it.
9. Resident sees the updated status.

Ang feature na ito ay hindi simpleng form lang. May database, auth, validation, and UI flow na nag-uugnay sa isa't isa.

---

## 3. Ang folder structure at ang purpose nito

### Backend folder
- backend/app/Models
  - Dito nakalagay ang Eloquent models.
  - Sila ang nagre-represent sa database tables.

- backend/app/Http/Controllers
  - Dito nakalagay ang logic para sa bawat feature.
  - Halimbawa: login, register, create booking, approve booking.

- backend/routes/api.php
  - Dito nilalagay ang API endpoints.
  - Halimbawa: /api/login, /api/bookings, /api/admin/amenities.

- backend/database/migrations
  - Dito nakasulat ang schema o structure ng database.
  - Katulad ito ng blueprint para sa table.

- backend/database/seeders
  - Dito nilalagay ang sample data para mabilis na ma-test ang app.

- backend/app/Http/Middleware
  - Dito nakalagay ang rules kung sino ang puwedeng mag-access ng isang route.
  - Halimbawa: admin middleware.

### Frontend folder
- frontend/src/pages
  - Dito ang mga screens o pages ng app.
  - Halimbawa: Login, Register, Dashboard, BookingForm.

- frontend/src/components
  - Dito ang reusable UI components.
  - Halimbawa: buttons, cards, forms, guards.

- frontend/src/context
  - Dito ang global state ng app.
  - Halimbawa: kung naka-login ba ang user o wala.

- frontend/src/layouts
  - Dito ang layout structure para sa resident at admin pages.

- frontend/src/services
  - Dito nakalagay ang API connection code.

---

## 4. Step-by-step build guide sa tamang order

### Step 1: Setup ng environment at dependencies

Una, kailangan mong i-setup ang Laravel backend at React frontend.

#### Backend setup
- I-install ang Composer dependencies sa backend.
- Gumawa ng .env file.
- I-configure ang database credentials.
- I-generate ang app key.

#### Frontend setup
- I-install ang npm dependencies sa frontend.
- Tiyakin na gumagana ang React at Vite.

#### Why this matters
Kung walang tamang environment, hindi mo magagawang mag-run ang backend at frontend. Ang .env ay parang configuration file na nagsasabing saan ang database, ano ang app name, at kung anong environment ang ginagamit.

#### Important files involved
- backend/composer.json
- backend/.env
- frontend/package.json

---

### Step 2: Build the database structure

Ang database ang nag-i-store ng lahat ng data: users, amenities, bookings.

#### Ano ang ginagawa sa migration files
Ang migration files ang nagde-define ng tables.

Sa project na ito, ang mga mahalagang tables ay:
- users
  - nag-i-store ng user information
  - may role: user o admin
- amenities
  - nag-i-store ng facility details like name, description, location, capacity, status, image
- bookings
  - nag-i-store ng booking requests kasama ang user, amenity, time range, purpose, and status

#### Why migrations are important
Sa halip na manually gumawa ng table sa database, gumagamit tayo ng migration. Mas organized at mas madali ang pag-manage ng database kapag may bagong update.

#### Example logic in migration
Kailangang may:
- foreign keys para sa user_id at amenity_id
- datetime columns para sa start_time at end_time
- status column para sa pending, approved, cancelled, rejected

#### Files involved
- backend/database/migrations/0001_01_01_000000_create_users_table.php
- backend/database/migrations/2026_08_05_120000_create_amenities_table.php
- backend/database/migrations/2026_08_05_130000_create_bookings_table.php
- backend/database/migrations/2026_08_05_140000_add_profile_and_amenity_images.php

#### What to understand here
Kapag may bagong feature ka, hindi mo agad dadagdagan ang database sa manual way. Dapat adagdagan ang migration, then run php artisan migrate.

---

### Step 3: Create the Eloquent models

Pagkatapos ng migration, gumawa ka ng models.

#### Model = representation ng table
Halimbawa:
- User model = represents users table
- Amenity model = represents amenities table
- Booking model = represents bookings table

#### Files involved
- backend/app/Models/User.php
- backend/app/Models/Amenity.php
- backend/app/Models/Booking.php

#### Detailed explanation per model

##### User.php
Ang User model ang nagre-represent sa users table.

Ano ang mga important features dito:
- $fillable
  - Ito ang mga field na puwedeng i-save nang safe.
  - Kabilang dito ang name, email, password, role, profile_image.

- isAdmin()
  - Helper method na nag-check kung admin ang user.

- bookings()
  - Relationship sa Booking model.
  - Ibig sabihin, ang isang user ay puwedeng magkaroon ng maraming bookings.

- getProfileImageUrlAttribute()
  - Gumagawa ng public URL para sa uploaded profile image.

##### Amenity.php
Ang Amenity model ang nagre-represent sa amenities table.

Important parts:
- $fillable
  - name, description, location, capacity, status, image

- bookings()
  - Relationship na nagsasabing ang amenity ay puwedeng magkaroon ng maraming bookings.

- getImageUrlAttribute()
  - Gumagawa ng URL para sa amenity image.

##### Booking.php
Ang Booking model ang nagre-represent sa bookings table.

Important parts:
- $fillable
  - user_id, amenity_id, start_time, end_time, purpose, status

- casts
  - Pinapagawa nitong datetime object ang start_time at end_time.
  - Kaya mas madali mong i-compare ang dates.

- user()
  - Relationship na nag-uugnay sa user na gumawa ng booking.

- amenity()
  - Relationship na nag-uugnay sa amenity na binook.

#### Why you need to understand this
Kapag gusto mong mag-query ng data gamit Laravel, kadalasan gagamit ka ng model, hindi direktang SQL query.

---

### Step 4: Set up authentication and route protection

Ang project ay may login, logout, profile editing, at admin-only routes.

#### Files involved
- backend/routes/api.php
- backend/app/Http/Middleware/AdminMiddleware.php
- backend/config/auth.php
- backend/config/sanctum.php

#### Important concept: Sanctum
Gagamit tayo ng Laravel Sanctum para sa API authentication.

Meaning:
- Kapag nag-login ang user, may ibibigay na token.
- Ang token ay isinusulat sa header ng request.
- Ang backend ay gagamit ng token para malaman kung sino ang logged-in user.

#### Public routes vs protected routes
- Public routes: register, login, view amenities
- Protected routes: logout, profile, bookings, create booking
- Admin routes: manage amenities, manage bookings, create admins

#### Why middleware matters
Ang middleware ang nagbabantay sa access.

Halimbawa:
- auth:sanctum ensures logged-in ang user.
- admin middleware ensures admin role lang ang pwedeng mag-access ng admin features.

---

### Step 5: Build the controllers

Dito nangyayari ang business logic.

#### Files involved
- backend/app/Http/Controllers/AuthController.php
- backend/app/Http/Controllers/AmenityController.php
- backend/app/Http/Controllers/BookingController.php

#### AuthController.php — what it does
Ito ang controller na responsible para sa authentication at user profile operations.

##### register()
- Tinatanggap ang name, email, password.
- I-validate ang input.
- Ginagawa ang password hash.
- Gumagawa ng user record.
- Gumagawa ng API token.
- Ibinabalik ang response kasama ang user at token.

##### login()
- Tinitignan kung may user na may email na iyon.
- I-check ang password.
- Kung tama, gumagawa ng token.

##### logout()
- Tinatrash ang current token.

##### updateProfile()
- Puwedeng i-update ang name, email, at profile image.
- Kung may bagong image, ito ay ini-save sa storage/public.

##### updatePassword()
- I-check ang current password.
- Kung tama, papalitan ang password.

##### registerAdmin()
- Nagsusulat ng bagong admin account.

#### AmenityController.php — what it does
Ito ang controller para sa facilities.

##### index()
- Ibinibigay ang list ng active amenities.
- Ginagamit para sa public at resident pages.

##### adminIndex()
- Ibinibigay ang list ng lahat ng amenities, including inactive ones.
- Ginagamit sa admin management page.

##### store()
- Gumagawa ng bagong amenity.
- Puwede magkaroon ng image upload.

##### update()
- Nag-eedit ng details ng amenity.
- Puwede ring palitan ang image.

##### destroy()
- Tinatanggal ang amenity.

#### BookingController.php — what it does
Ito ang pinakamahalagang controller dahil ito ang nag-hahandle ng reservation logic.

##### index()
- Ibinibigay ang bookings ng logged-in user.

##### store()
- Tinatanggap ang amenity_id, start_time, end_time, purpose.
- I-check kung active ang amenity.
- I-check kung may conflict sa ibang booking.
- Kung wala, save ang booking bilang pending.

##### update()
- Puwede baguhin ang booking lamang kung pending pa ito.
- I-rerun ang conflict check.

##### cancel()
- I-change ang status sa cancelled.

##### adminIndex()
- Ibinibigay ang lahat ng bookings para sa admin.

##### adminStore()
- Pinapahintulutan ang admin na gumawa ng booking para sa ibang user.

##### adminUpdate()
- Pinapahintulutan ang admin na i-approve or i-reject ang booking.
- Kapag approved, may notification na pinapadala.

##### adminStats()
- Ibinibigay ang statistics sa admin dashboard.

#### Important business rule in booking logic
Ang pinaka-important na feature sa project na ito ay ang conflict detection.

Halimbawa:
- Kung may booking na 2:00 PM to 3:00 PM.
- At may bagong request na 2:30 PM to 3:30 PM.
- Dapat block siya because overlap.

Ito ay ginagawang safe ang system.

---

### Step 6: Configure file storage for images

Ang project ay may image upload para sa profile at amenities.

#### Files involved
- backend/config/filesystems.php
- backend/app/Http/Controllers/AuthController.php
- backend/app/Http/Controllers/AmenityController.php

#### Why storage is important
Kapag may uploaded file, hindi ito puwedeng i-store lang sa memory. Dapat may permanent storage.

#### Typical flow
1. User uploads image.
2. Laravel saves the file in storage/app/public.
3. The app creates a public URL using the storage path.
4. The frontend displays the image using that URL.

#### Command you need to run
- php artisan storage:link

This command makes the uploaded files accessible from the browser.

---

### Step 7: Build the frontend entry points

Ngayong may backend na, oras na para sa UI.

#### Files involved
- frontend/src/main.jsx
- frontend/src/App.jsx

##### main.jsx
Ito ang starting point ng React app.

- It renders the root component into the page.
- This is where the app boots up.

##### App.jsx
Ito ang file na nagde-define ng routes.

Dito nakalagay ang mga paths:
- /login
- /register
- /dashboard
- /amenities
- /bookings
- /admin/dashboard

It also wraps protected pages with route guards.

---

### Step 8: Create the authentication context

Dito nangyayari ang global login state.

#### File involved
- frontend/src/context/AuthContext.jsx

#### Why this is important
Kapag ang user ay naka-login, ang app should know that globally. Hindi mo kailangang i-retrieve ang user data sa bawat page.

#### What it usually stores
- user
- token
- loading

#### What it provides
- login()
- logout()
- register()
- refreshUser()

---

### Step 9: Create the API service layer

Dito ang frontend ay nag-uugnay sa backend.

#### File involved
- frontend/src/services/api.js

#### What it does
- Defines the base URL for API calls.
- Automatically attaches the token to requests.
- Handles expired sessions.

#### Why this is important
Hindi mo dapat i-type ang full API URL sa bawat page. Centralize mo sa isang file para mas organized.

---

### Step 10: Build the route guards

#### File involved
- frontend/src/components/RouteGuards.jsx

#### Purpose
- ProtectedRoute: ensures only logged-in users can access resident pages.
- AdminRoute: ensures only admin users can access admin pages.

#### Why this matters
Hindi mo gusto na kahit walang login, puwedeng makita ang dashboard. Ang route guards ang nagbabantay sa access.

---

### Step 11: Build the layouts

#### Files involved
- frontend/src/layouts/UserLayout.jsx
- frontend/src/layouts/AdminLayout.jsx

#### Purpose
Ang layout ay ang shell ng page.

- UserLayout contains links like Dashboard, Amenities, My Bookings, Profile.
- AdminLayout contains admin links like Dashboard, Manage Amenities, Manage Bookings, Add Admin.

#### Why it's useful
Ang layout ay hindi nagbabago per page. Ini-wrap ang page content sa common structure.

---

### Step 12: Build the pages one by one

#### Public pages
- LandingPage.jsx
  - Home page.
  - Shows hero section and available amenities.

- Login.jsx
  - Form for logging in.

- Register.jsx
  - Form for creating a resident account.

#### Resident pages
- Dashboard.jsx
  - Shows summary of the user's bookings.

- AmenitiesList.jsx
  - Shows all active amenities.

- BookingForm.jsx
  - Used to create or edit a booking.

- BookingsList.jsx
  - Shows the bookings of the logged-in resident.

#### Admin pages
- Dashboard.jsx
  - Shows booking statistics.

- AmenitiesCrud.jsx
  - Lets admin create, edit, and delete amenities.

- BookingsCrud.jsx
  - Lets admin manage all bookings.

- AddAdmin.jsx
  - Lets admin create another admin account.

---

### Step 13: Connect the frontend to the backend

Ito ang pinakamahalagang bahagi kapag nag-uugnay na ang UI at server.

#### Example flow
1. User submits login form.
2. Frontend calls POST /api/login.
3. Backend returns token and user info.
4. Frontend saves token.
5. Later, when user opens dashboard, frontend calls GET /api/bookings.
6. Backend returns booking list.

#### Important concept
Hindi pwede ang frontend na magtrabaho nang mag-isa. Dapat may corresponding backend endpoint ang bawat page action.

---

### Step 14: Run the app locally

#### Backend commands
- composer install
- cp .env.example .env (or create your own .env)
- php artisan key:generate
- php artisan migrate
- php artisan db:seed
- php artisan storage:link
- php artisan serve

#### Frontend commands
- cd frontend
- npm install
- npm run dev

#### Expected result
- Backend runs at localhost:8000
- Frontend runs at Vite local URL

---

## 5. Ano ang mga new features na meron sa project na ito

Kung base sa current project, ang mga important features na kailangan mong maunawaan ay:

- Authentication and authorization
- Role-based access (user vs admin)
- Amenity CRUD
- Booking creation and conflict check
- Booking approval workflow
- Profile image upload
- Amenity image upload
- Admin statistics dashboard

Ang mga feature na ito ay hindi hiwalay. Ang bawat isa ay may backend logic at frontend UI.

---

## 6. Paano mag-debug kapag may problema

Kapag may error, hindi ka dapat magpanic. Gamitin ang sumusunod na sequence:

1. Basahin ang error message.
2. Alamin kung backend o frontend ang may problema.
3. Tignan ang API response sa Network tab.
4. Tignan ang Laravel log files.
5. I-check kung tama ang route, validation, at request payload.
6. I-check kung may missing field sa frontend o backend.

---

## 7. Mga konsepto na dapat mong maintindihan nang maigi

Para hindi ka mahirapan sa pag-coding, tandaan ang mga sumusunod:

- Model = nagre-represent sa database table
- Controller = naglalaman ng logic
- Route = nag-uugnay ng URL sa controller
- Middleware = nagbabantay sa access
- Request validation = nagse-secure sa input
- API response = ang data na ibinabalik sa frontend
- Context = global state sa React
- Service layer = nag-uugnay sa backend sa maayos na paraan

---

## 8. Best way to study this project

Kung gusto mong maunawaan ang project nang mas malalim, gawin mo ang sumusunod:

1. Basahin ang routes first.
2. Then basahin ang controllers.
3. Then basahin ang models.
4. Then check the frontend pages that use those APIs.
5. Then trace one full feature from start to finish.

Halimbawa:
- Start with login flow
- Then bookings flow
- Then admin approval flow

Sa ganitong paraan, mas naiintindihan mo ang project bilang isang buong sistema, hindi lang bilang isolated files.

---

## 9. Short summary

Kung ibuod sa pinakasimpleng paraan:
- Ang frontend ay nagpapadala ng request.
- Ang backend ay nagpoproseso ng request.
- Ang database ay nag-i-store ng data.
- Ang middleware ay nagbabantay sa access.
- Ang models ay nagre-represent ng tables.
- Ang controllers ang nagdedesisyon kung ano ang gagawin.

Kung naintindihan mo ang flow na ito, mas madali ka nang mag-code at mag-debug.

Kung gusto mo, sa susunod ay pwede ko pa itong gawing mas advanced na guide sa paraang:
- isang feature per feature (login, register, bookings, admin approval)
- may sample code para sa bawat file
- may step-by-step na "kung gusto mong idagdag ang bagong feature, ganito ang approach"
