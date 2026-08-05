# Paano Buoin ang Project — Step-by-step (Filipino)

Ang gabay na ito ay naglilista ng "brick-by-brick" na pagkakasunod-sunod ng mga file at bahagi na kailangang gawin para mabuo ang proyekto, at maikling paliwanag kung para saan ang bawat isa. Sundan ang pagkakasunud-sunod at kompletuhin bawat hakbang bago lumipat.

1. Setup ng project (repo at dependencies)
   - Files/commands: `composer.json`, `package.json` (root), `frontend/package.json`
   - Purpose: I-declare ang PHP at JS/Node dependencies. Patakbuhin: `composer install` at `npm install` (o `pnpm`/`yarn`).

2. Environment at config
   - Files: `.env`, `config/database.php`, `config/app.php`
   - Purpose: I-set ang DB credentials, app key, environment, at iba pang configuration. Kailangan bago mag-migrate o mag-seed.

3. Database migrations
   - Files: `database/migrations/*.php` (e.g., `create_amenities_table.php`, `create_bookings_table.php`)
   - Purpose: I-define ang mga tables at columns. Gumamit ng `php artisan migrate` para gumawa ng mga table.
   - Order: users table -> amenities -> bookings -> any image/attachments tables.

4. Eloquent Models
   - Files: `app/Models/User.php`, `app/Models/Amenity.php`, `app/Models/Booking.php`
   - Purpose: ORM models para mag-represent ng bawat table at relationships (e.g., `Amenity` hasMany `Booking`).

5. Factories at Seeders
   - Files: `database/factories/*Factory.php`, `database/seeders/DatabaseSeeder.php`
   - Purpose: Gumawa ng fake data para local testing; i-run gamit ang `php artisan db:seed`.

6. Controllers (API & Web)
   - Files: `app/Http/Controllers/*` (e.g., `AuthController.php`, `AmenityController.php`, `BookingController.php`)
   - Purpose: Business logic para sa API at web endpoints — create/read/update/delete actions, authentication handling.
   - Tip: Gumamit ng Form Requests (`app/Http/Requests`) para sa validation.

7. Routes
   - Files: `routes/api.php`, `routes/web.php`
   - Purpose: I-map ang endpoints papunta sa controllers. Karaniwan: API routes for SPA/mobile; web routes for server-rendered pages.
   - Order: Unahin ang authentication routes, then resource routes para sa `amenities` at `bookings`.

8. Middleware at Auth
   - Files: `app/Http/Middleware/*`, `config/auth.php`, Sanctum config (`config/sanctum.php`)
   - Purpose: Protektahan ang mga route (authentication/authorization), handle CORS, rate-limiting, at iba pa.

9. API Resources at Transformers (optional)
   - Files: `app/Http/Resources/*` (e.g., `AmenityResource.php`)
   - Purpose: I-format ang response payload ng API nang consistent.

10. Providers at Bindings
    - Files: `app/Providers/AppServiceProvider.php` (o custom providers)
    - Purpose: Dependency injection bindings, any bootstrapping logic, resource pagination defaults.

11. File storage at uploads
    - Files: `config/filesystems.php`, migration for images, storage folder (`storage/app/public`)
    - Commands: `php artisan storage:link`
    - Purpose: I-store at i-serve ang mga uploaded images (profile, amenity images).

12. Frontend scaffold (React / Vite)
    - Files/Folders: `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/services/api.js`
    - Purpose: UI, connect to API using `fetch`/`axios`. `services/api.js` should centralize base URL and token handling.
    - Order: Setup project -> create `services` -> create `pages` (Login, AmenitiesList, AmenityDetail, BookingForm) -> connect routes.

13. Frontend auth flow
    - Files: `frontend/src/context/AuthContext.jsx`, `frontend/src/services/authService.js`
    - Purpose: Login/logout, store access token (prefer `httpOnly` cookies via backend + Sanctum), protect routes in frontend.

14. API integration endpoints mapping
    - Map frontend calls to backend `routes/api.php` endpoints (e.g., `GET /api/amenities`, `POST /api/bookings`).
    - Purpose: Siguraduhing pareho ang field names at response formats.

15. Testing
    - Files: `tests/Feature/*`, `tests/Unit/*`, `phpunit.xml`
    - Purpose: Automated tests para siguraduhin gumagana ang endpoints at business logic.

16. Running & local debugging
    - Commands for backend:
      - `composer install`
      - `cp .env.example .env` (or create `.env`), set DB
      - `php artisan key:generate`
      - `php artisan migrate --seed`
      - `php artisan storage:link`
      - `php artisan serve --host=127.0.0.1 --port=8000`
    - Commands for frontend:
      - `cd frontend`
      - `npm install`
      - `npm run dev` (or `vite`)

17. Build for production
    - Backend: configure `APP_ENV` and DB, queue, cache
    - Frontend: `npm run build` then serve built assets (or integrate with Laravel Mix/Vite asset pipeline).

18. Extras & maintenance
    - CI: add GitHub Actions to run tests, linting
    - Docs: update this file and `README.md` with environment variables and run steps

-----------------------------------------
Notes / Best order summary (very concise):
- 1) Setup env + dependencies
- 2) Write migrations -> models -> seeders
- 3) Implement controllers -> routes -> middleware
- 4) Configure storage and providers
- 5) Build frontend scaffold -> pages -> connect to API
- 6) Run migrations & seeds -> start backend & frontend

Kung gusto mo, pwede kong i-detalye pa ang bawat step (exact file templates, example controller code, at example API routes). Sabihin mo lang kung gusto mong simulan sa backend o frontend, at kung anong level ng examples ang kailangan mo (boilerplate lang o kompleto with code).
