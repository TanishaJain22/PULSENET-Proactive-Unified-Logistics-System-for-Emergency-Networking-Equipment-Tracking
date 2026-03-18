# PostgreSQL Setup Guide for PulseNet

## Quick Setup Options

### Option 1: Create PostgreSQL User and Database

1. **Connect to PostgreSQL as superuser:**
```bash
# On macOS (if installed via Homebrew)
psql postgres

# Or connect as your system user
psql -d postgres -U $(whoami)
```

2. **Create database and user:**
```sql
-- Create the database
CREATE DATABASE pulsenet;

-- Create user (if postgres user doesn't exist)
CREATE USER postgres WITH PASSWORD 'yourpassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pulsenet TO postgres;

-- Exit
\q
```

### Option 2: Use Your Existing PostgreSQL User

If you have a different PostgreSQL user, update `application.properties`:

```properties
spring.datasource.username=your_actual_username
spring.datasource.password=your_actual_password
```

### Option 3: Install PostgreSQL (if not installed)

**On macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb pulsenet
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
CREATE DATABASE pulsenet;
CREATE USER postgres WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE pulsenet TO postgres;
\q
```

## Enable Database in Application

Once PostgreSQL is set up, remove this line from `application.properties`:

```properties
# Remove this line:
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
```

And update your database credentials:

```properties
spring.datasource.username=postgres
spring.datasource.password=your_actual_password
```

## Verify Connection

Test the connection:
```bash
psql -h localhost -p 5432 -U postgres -d pulsenet
```

## Default Test Data

When the application starts with database enabled, it will automatically create:
- System admin user: `sysadmin@pulsenet.gov` / `adminpassword`
- All required database tables

## Troubleshooting

**Error: "role postgres does not exist"**
- Create the postgres user as shown in Option 1

**Error: "database pulsenet does not exist"**
- Create the database: `CREATE DATABASE pulsenet;`

**Error: "password authentication failed"**
- Update the password in `application.properties`
- Or reset the user password: `ALTER USER postgres PASSWORD 'newpassword';`