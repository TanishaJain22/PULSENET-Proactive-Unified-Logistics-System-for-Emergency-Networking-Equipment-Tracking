# PulseNet Healthcare Platform - Backend Initialization Guide

A step-by-step guide to set up the Spring Boot backend for the PulseNet healthcare platform using Eclipse IDE.

---

## Step 1: Create Spring Boot Project in Eclipse

### Instructions

1. **Open Eclipse IDE**
   - Launch Eclipse on your machine

2. **Create a New Spring Starter Project**
   - Go to `File` → `New` → `Spring Starter Project`
   - If you don't see this option, ensure you have the Spring Tools 4 extension installed

3. **Configure Project Settings**
   - Fill in the following details in the New Spring Starter Project dialog:

   | Field | Value |
   |-------|-------|
   | **Name** | pulsenet |
   | **Type** | Maven |
   | **Packaging** | Jar |
   | **Java Version** | 17 (or 21 if preferred) |
   | **Group** | com.healthcare |
   | **Artifact** | pulsenet |
   | **Package** | com.healthcare |
   | **Description** | Healthcare Platform Backend |

4. **Click Next** to proceed to dependency selection

---

## Step 2: Add Dependencies

### Required Dependencies

Select the following dependencies during project creation:

| Dependency | Purpose |
|------------|---------|
| **Spring Web** | Enables REST API development and HTTP request handling |
| **Spring Data JPA** | Simplifies database operations with ORM (Object-Relational Mapping) |
| **PostgreSQL Driver** | Provides JDBC driver for PostgreSQL database connectivity |
| **Lombok** | Reduces boilerplate code by auto-generating getters, setters, and constructors |
| **Spring Boot DevTools** | Enables hot reload during development for faster iteration |
| **Validation** | Provides bean validation annotations for input validation |

### Why Each Dependency is Needed

- **Spring Web**: Required to build REST endpoints that the frontend will consume
- **Spring Data JPA**: Eliminates repetitive database query code and provides repository pattern implementation
- **PostgreSQL Driver**: Establishes connection between your application and PostgreSQL database
- **Lombok**: Keeps entity and DTO classes clean and maintainable by eliminating verbose getter/setter methods
- **Spring Boot DevTools**: Automatically restarts the application when files change, improving development speed
- **Validation**: Ensures data integrity by validating incoming requests before processing

### Completing Setup

1. Click **Next** after selecting dependencies
2. Review the project settings
3. Click **Finish** to generate the project
4. Wait for Maven to download dependencies (this may take a few minutes)

---

## Step 3: Verify Project Structure

### Expected Folder Structure

After project generation, your project should look like this:

```
pulsenet/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── healthcare/
│   │   │           └── PulsenetApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application.yml (optional)
│   └── test/
│       └── java/
│           └── com/
│               └── healthcare/
│                   └── PulsenetApplicationTests.java
├── pom.xml
├── .gitignore
└── README.md
```

### Folder & File Responsibilities

| Item | Responsibility |
|------|-----------------|
| **src/main/java** | Contains all Java source code for the application |
| **com/healthcare/** | Base package containing all application classes |
| **PulsenetApplication.java** | Main entry point with `@SpringBootApplication` annotation that starts the application |
| **src/main/resources** | Contains configuration files and static resources |
| **application.properties** | Configuration file for database, server, and Spring settings |
| **pom.xml** | Maven configuration file that manages dependencies and build settings |
| **src/test/java** | Contains unit and integration tests |

---

## Step 4: Setup PostgreSQL Database

### Create Database

You need to create a PostgreSQL database for the PulseNet application.

#### Option A: Using PostgreSQL Terminal

1. **Open PostgreSQL Command Line**
   - On Windows: Open Command Prompt and run `psql -U postgres`
   - On macOS/Linux: Open Terminal and run `psql -U postgres`

2. **Create the Database**
   ```sql
   CREATE DATABASE pulsenet;
   ```

3. **Verify Creation**
   ```sql
   \l
   ```
   You should see `pulsenet` in the list of databases.

4. **Exit PostgreSQL**
   ```sql
   \q
   ```

#### Option B: Using pgAdmin (GUI)

1. **Open pgAdmin** in your browser (usually at `http://localhost:5050`)
2. **Login** with your pgAdmin credentials
3. **Right-click on "Databases"** in the left sidebar
4. **Select "Create" → "Database"**
5. **Enter Name**: `pulsenet`
6. **Click "Save"**

### Verify Database Connection

Ensure PostgreSQL is running on your machine:
- **Windows**: Check Services or use `pg_isready`
- **macOS**: If installed via Homebrew, run `brew services list`
- **Linux**: Run `sudo systemctl status postgresql`

---

## Step 5: Configure Database Connection

### Update application.properties

1. **Navigate to** `src/main/resources/application.properties`
2. **Open the file** in Eclipse
3. **Add the following configuration**:

```properties
# Server Configuration
server.port=8080

# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/pulsenet
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Application Name
spring.application.name=pulsenet
```

### Configuration Explanation

| Property | Value | Purpose |
|----------|-------|---------|
| **server.port** | 8080 | Port on which the application runs |
| **spring.datasource.url** | jdbc:postgresql://localhost:5432/pulsenet | Database connection URL |
| **spring.datasource.username** | postgres | PostgreSQL default username |
| **spring.datasource.password** | yourpassword | Your PostgreSQL password (change this) |
| **spring.jpa.hibernate.ddl-auto** | update | Auto-creates/updates database schema based on entities |
| **spring.jpa.show-sql** | true | Logs SQL queries to console (useful for debugging) |
| **spring.jpa.properties.hibernate.dialect** | PostgreSQLDialect | Tells Hibernate to use PostgreSQL-specific SQL |

### Understanding ddl-auto=update

The `ddl-auto=update` setting automatically:
- **Creates** new database tables when you define new JPA entities
- **Modifies** existing tables when you change entity properties
- **Does NOT drop** tables or data (safe for development)

**Note**: For production, use `validate` instead to prevent accidental schema changes.

### Important: Update Password

Replace `yourpassword` with your actual PostgreSQL password before running the application.

---

## Step 6: Create Backend Package Structure

### Organize Packages

Now that the base project is set up, create the following package structure inside `com.healthcare`:

1. **In Eclipse**, right-click on `src/main/java/com/healthcare`
2. **Select "New" → "Package"**
3. **Create each package** with the following names:
   - `com.healthcare.controller`
   - `com.healthcare.service`
   - `com.healthcare.repository`
   - `com.healthcare.entity`
   - `com.healthcare.dto`

### Final Package Structure

```
com.healthcare/
├── controller/
│   └── (REST API endpoints will go here)
├── service/
│   └── (Business logic will go here)
├── repository/
│   └── (Database queries will go here)
├── entity/
│   └── (JPA entity classes will go here)
├── dto/
│   └── (Data Transfer Objects will go here)
└── PulsenetApplication.java
```

### Package Responsibilities

| Package | Responsibility |
|---------|-----------------|
| **controller** | Contains REST API endpoints that handle HTTP requests from the frontend |
| **service** | Contains business logic and orchestrates operations between controllers and repositories |
| **repository** | Contains database access layer using Spring Data JPA interfaces |
| **entity** | Contains JPA entity classes that map to database tables |
| **dto** | Contains Data Transfer Objects for API request/response payloads |

---

## Verification Checklist

Before proceeding with feature development, verify:

- [ ] Spring Boot project created in Eclipse
- [ ] All 6 dependencies added successfully
- [ ] Project structure matches expected layout
- [ ] PostgreSQL database `pulsenet` created
- [ ] `application.properties` configured with correct database credentials
- [ ] All 5 packages created under `com.healthcare`
- [ ] Application starts without errors (Run → Run As → Spring Boot App)

---

## Next Steps

Once this initialization is complete, you're ready to:
1. Create entity classes in the `entity` package
2. Create repository interfaces in the `repository` package
3. Implement business logic in the `service` package
4. Build REST endpoints in the `controller` package
5. Define DTOs in the `dto` package

---

## Troubleshooting

### Issue: Dependencies not downloading
- **Solution**: Right-click project → Maven → Update Project

### Issue: PostgreSQL connection fails
- **Solution**: Verify PostgreSQL is running and credentials in `application.properties` are correct

### Issue: Spring Tools not available in Eclipse
- **Solution**: Install Spring Tools 4 from Eclipse Marketplace (Help → Eclipse Marketplace)

### Issue: Port 8080 already in use
- **Solution**: Change `server.port` in `application.properties` to an available port (e.g., 8081)

---

**Guide Version**: 1.0  
**Last Updated**: March 2026  
**Project**: PulseNet Healthcare Platform
