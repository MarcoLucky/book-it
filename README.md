# Bloomfield Amenities Booking Application

A full-stack amenities reservation system for Bloomfield Subdivision. The project consists of a Laravel 12 REST API and a React 19 frontend built with Vite and Tailwind CSS.

## Prerequisites

Install the following before setting up the project:

- PHP 8.2 or newer, with the `pdo_sqlite` extension (or `pdo_mysql` when using MySQL)
- Composer
- Node.js 20.19+ or 22.12+ and npm
- Git

If you use XAMPP, start MySQL only when following the optional MySQL setup below. The development API is started with Laravel's Artisan server, so Apache is not required.

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd bloomfield_ameneties_booking_application
```

Replace `<repository-url>` with this repository's Git URL.

### 2. Set up the Laravel backend

Open a terminal in the project root and run:

```bash
cd backend
composer install
```

Create the environment file:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux**

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

The default environment uses SQLite. Create its database file if it does not already exist:

**Windows PowerShell**

```powershell
New-Item database/database.sqlite -ItemType File -Force
```

**macOS/Linux**

```bash
touch database/database.sqlite
```

Create the database tables, load the sample data, and expose uploaded images:

```bash
php artisan migrate --seed
php artisan storage:link
```

### 3. Set up the React frontend

In a second terminal, starting from the project root, run:

```bash
cd frontend
npm install
```

## Run the application

Keep both of the following terminals running.

**Terminal 1 — backend**

```bash
cd backend
php artisan serve
```

The API will be available at `http://localhost:8000/api`.

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Seeded accounts

Running `php artisan migrate --seed` creates these development accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@bloomfield.com` | `password` |
| Admin | `admin2@bloomfield.com` | `admin123` |
| Resident | `user@bloomfield.com` | `password` |

These credentials are for local development only. Change them before deploying the application.

## Optional: use XAMPP MySQL instead of SQLite

1. Start MySQL from the XAMPP Control Panel.
2. Create a database named `bloomfield_booking` in phpMyAdmin.
3. Update the database section of `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bloomfield_booking
DB_USERNAME=root
DB_PASSWORD=
```

4. Build and seed the MySQL database:

```bash
cd backend
php artisan config:clear
php artisan migrate --seed
```

## Optional: email notifications

Without an SMTP server, the default environment is suitable for local development but real emails will not be delivered. To enable booking emails, configure these values in `backend/.env` for your SMTP provider:

```env
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="Bloomfield Amenities"
```

Then clear cached configuration:

```bash
cd backend
php artisan config:clear
```

## Useful commands

```bash
# Run backend tests
cd backend
php artisan test

# Run frontend linting
cd frontend
npm run lint

# Create a production frontend build
cd frontend
npm run build

# Rebuild the local database and reload seed data (deletes existing data)
cd backend
php artisan migrate:fresh --seed
```

## Troubleshooting

- **Frontend cannot reach the API:** confirm that `php artisan serve` is running on port `8000`. The frontend API URL is configured in `frontend/src/services/api.js`.
- **SQLite driver error:** enable the PHP extensions `pdo_sqlite` and `sqlite3`, then restart the terminal or XAMPP services.
- **MySQL connection error:** confirm MySQL is running and that the `DB_*` values in `backend/.env` match your local database.
- **Uploaded images do not appear:** run `php artisan storage:link` inside the `backend` directory.
- **Environment changes are ignored:** run `php artisan config:clear` inside the `backend` directory.
