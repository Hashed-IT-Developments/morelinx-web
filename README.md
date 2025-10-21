# MoreLinx - Laravel + Inertia.js + React + TypeScript

A modern web application built with Laravel backend and React frontend using Inertia.js for seamless integration.

## 🚀 Tech Stack

- **Backend**: Laravel 12.x (PHP 8.2+)
- **Frontend**: React 19 + TypeScript
- **Full-Stack Framework**: Inertia.js 2.x
- **Styling**: TailwindCSS 4.x + shadcn/ui components
- **Database**: PostgreSQL 17.6
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Routing**: Ziggy (Laravel routes in JavaScript)
- **Authentication**: Laravel Sanctum
- **Permissions**: Spatie Laravel Permission

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2 or higher**
- **Composer** (latest version)
- **Node.js 18+ and npm** (or Yarn/pnpm)
- **PostgreSQL 17.6**

### System Requirements

#### For macOS:

```bash
# Install PHP via Homebrew (if not already installed)
brew install php@8.2
brew install composer

# Install Node.js
brew install node

# Install PostgreSQL 17
brew install postgresql@17
brew services start postgresql@17
```

#### For Ubuntu/Debian:

```bash
# Install PHP and required extensions
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-common php8.2-curl php8.2-zip php8.2-gd php8.2-pgsql php8.2-xml php8.2-mbstring

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 17
sudo apt install postgresql-17 postgresql-client-17
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### For Windows:

- Download and install PHP from [php.net](https://www.php.net/downloads)
- Download and install Composer from [getcomposer.org](https://getcomposer.org/download/)
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Download and install PostgreSQL 17 from [postgresql.org](https://www.postgresql.org/download/windows/)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd morelinx
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Configure Environment Variables

Edit the `.env` file with your specific settings:

```env
APP_NAME="MoreLinx"
APP_ENV=local
APP_KEY=base64:... # Generated automatically
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration (PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=morelinx
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Additional configurations...
```

### 6. Database Setup

```bash
# Create database and user (if needed)
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE morelinx;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE morelinx TO your_username;
\q

# Run migrations
php artisan migrate

# Seed the database (optional)
php artisan db:seed
```

### 7. Build Assets

```bash
# For development
npm run dev

# For production
npm run build
```

## 🎯 Development

### Running the Development Server

You'll need to run both the Laravel backend and the frontend build process:

#### Option 1: Separate Terminals

```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Frontend development (with hot reload)
npm run dev
```

#### Option 2: Using Concurrently (Recommended)

```bash
# If you have concurrently installed, you can run both together
npm run dev & php artisan serve
```

Your application will be available at: `http://localhost:8000`

### Available Scripts

#### Backend (Laravel)

```bash
# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Generate Ziggy routes for frontend
php artisan ziggy:generate

# Code formatting (Laravel Pint)
./vendor/bin/pint
```

#### Frontend (React/TypeScript)

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Type checking
npm run types

# Linting
npm run lint

# Code formatting
npm run format
npm run format:check
```

## 🏗️ Project Structure

```
morelinx/
├── app/                          # Laravel application code
│   ├── Http/Controllers/         # API and web controllers
│   ├── Models/                   # Eloquent models
│   ├── Enums/                    # Application enums
│   └── Providers/                # Service providers
├── database/
│   ├── migrations/               # Database migrations
│   ├── seeders/                  # Database seeders
│   └── factories/                # Model factories
├── resources/
│   ├── js/                       # React/TypeScript frontend
│   │   ├── components/           # Reusable React components
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── layouts/              # Page layouts
│   │   ├── pages/                # Inertia.js pages
│   │   ├── types/                # TypeScript type definitions
│   │   └── lib/                  # Utility functions
│   ├── css/                      # Global styles
│   └── views/                    # Blade templates (mainly app.blade.php)
├── routes/
│   ├── web.php                   # Web routes
│   ├── api.php                   # API routes
│   └── auth.php                  # Authentication routes
├── public/                       # Public assets
├── storage/                      # File storage
├── tests/                        # Test files
├── .env.example                  # Environment variables template
├── composer.json                 # PHP dependencies
├── package.json                  # Node.js dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # TailwindCSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎨 UI Components

This project uses **shadcn/ui** components built on top of **Radix UI** and **TailwindCSS**. Components are located in `resources/js/components/ui/`.

### Adding New Components

```bash
# Example: Adding a new shadcn/ui component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

## 🔐 Authentication & Permissions

The application includes:

- **Laravel Sanctum** for API authentication
- **Spatie Laravel Permission** for role-based access control

### Creating Users and Roles

```bash
# Create admin user via tinker
php artisan tinker

# In tinker:
$user = App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password')
]);

# Create and assign roles (if using Spatie permissions)
$role = Spatie\Permission\Models\Role::create(['name' => 'admin']);
$user->assignRole('admin');
```

## 🚀 Deployment

### Production Build

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci --only=production

# Build assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan ziggy:generate

# Run migrations
php artisan migrate --force
```

### Environment Configuration

Ensure your production `.env` file has:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Configure your production PostgreSQL database
DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=your-db-name
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Permission Errors

```bash
# Fix storage and cache permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 2. Key Generation Issues

```bash
php artisan key:generate
```

#### 3. Asset Build Issues

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Database Connection Issues

- Check your `.env` database configuration
- Ensure PostgreSQL service is running (`brew services start postgresql@17` on macOS or `sudo systemctl start postgresql` on Linux)
- Verify database exists and user has proper permissions
- Test connection: `psql -h 127.0.0.1 -U your_username -d morelinx`

#### 5. Ziggy Route Issues

```bash
# Regenerate Ziggy routes
php artisan ziggy:generate
```

## Git Flow

1. From main create staging (only once):
    ```bash
    git checkout -b staging
    git push origin staging
    ```
2. Keep staging updated:
    ```bash
    git checkout staging
    git pull origin staging
    ```

### Working on a feature

1. Create a branch from staging:
    ```bash
    git checkout staging
    git pull origin staging
    git checkout -b <username>/feature/<short-name>
    ```
    Example:
    ```bash
    git checkout -b esyot/feature/login
    ```

### Working on a bug fix

1. Create a branch from staging:
    ```bash
    git checkout staging
    git pull origin staging
    git checkout -b <username>/fix/<short-name>
    ```
    Example:
    ```bash
    git checkout -b esyot/fix/login
    ```

### Committing changes

1. Edit code.
2. Stage files:
    ```bash
    git add .
    ```
3. Commit:
    ```bash
    git commit -m "feat(login): add login form"
    # or
    git commit -m "fix(login): correct validation error"
    ```
4. Push:
    ```bash
    git push origin HEAD
    ```
5. Open a PR targeting staging and request review.

### Updating your feature/fix branch (optional)

```bash
git checkout staging
git pull origin staging
git checkout <your-branch>
git rebase staging   # or: git merge staging
# Resolve conflicts, then:
git push --force-with-lease
```

### Merging changes to start new work

1. Update staging:
    ```bash
    git checkout staging
    git pull origin staging
    ```
2. Create new branch (feature or fix) as above.
3. Implement changes and follow Committing changes.

### Branch naming convention

- Features: `<username>/feature/<short-name>`
- Fixes: `<username>/fix/<short-name>`
- Use lowercase, hyphen-separated short names.

### Commit message convention

Format: `type(scope): summary`  
Types: feat, fix, refactor, docs, test, chore.  
Keep summary imperative and short.

### Quick reference

```bash
# Start feature
git checkout staging
git pull origin staging
git checkout -b you/feature/thing

# Work
git add .
git commit -m "feat(thing): implement X"
git push origin HEAD
```

### Debug Mode

Enable debug mode in development:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## 📚 Additional Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Ziggy Documentation](https://github.com/tighten/ziggy)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **PHP**: Follow PSR-12 standards (enforced by Laravel Pint)
- **TypeScript/React**: Follow the ESLint configuration
- **Formatting**: Use Prettier for consistent code formatting

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about the problem

---

**Happy coding! 🎉**

## 📖 Inspiration

> "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."  
> — Colossians 3:23 (NIV)
