# PulseNet - Healthcare Platform Backend

A Spring Boot backend application for the PulseNet healthcare platform with JWT authentication, hospital registration, and admin management.

## Features

- JWT-based authentication with role-based access control
- Hospital registration with document upload
- OTP-based login for hospital admins
- System admin login
- PostgreSQL database with JPA/Hibernate
- Email service for OTP delivery
- File upload support for hospital documents

## API Endpoints

### Authentication

#### Send OTP (Hospital Admin Only)
```
POST /api/auth/otp/send
Content-Type: application/json

{
  "email": "admin@hospital.com"
}
```

#### Hospital Login
```
POST /api/auth/login/hospital
Content-Type: application/json

{
  "identity": "admin@hospital.com",
  "password": "password123",
  "otp": "123456"
}
```

#### System Admin Login
```
POST /api/auth/login/admin
Content-Type: application/json

{
  "identity": "sysadmin@pulsenet.gov",
  "password": "adminpassword"
}
```

### Hospital Registration

#### Submit Registration
```
POST /api/hospitals/register
Content-Type: multipart/form-data

Form Data:
- basicInfo: JSON string (Name, RegNo, Type, Year, Ownership)
- location: JSON string (Address, City, State, Pin, Lat, Lng)
- infrastructure: JSON string (ICU/Gen/Emerg Beds, Vents, ORs)
- specialties: String array
- equipment: Key-value object (equipment ID: boolean)
- contacts: JSON string (EmergencyNo, ControlNo, Email, AdminName, AdminPhone)
- adminAccount: JSON string (Email, Password)
- licenseFile: File (optional)
- clinicalFile: File (optional)
- accreditationFile: File (optional)
```

## Database Schema

### Users Table
- id: UUID (Primary Key)
- email: String (Unique)
- password_hash: String
- role: Enum (HOSPITAL_ADMIN, SYSTEM_ADMIN)
- hospital_id: UUID (Foreign Key, Nullable)

### Hospitals Table
- id: UUID (Primary Key)
- name: String
- registration_no: String (Unique)
- type: Enum (PRIVATE, GOVERNMENT, TRUST, NGO)
- est_year: Integer
- ownership: Enum (INDIVIDUAL, CORPORATE, SOCIETY)
- status: Enum (PENDING, APPROVED, REJECTED)
- created_at: Timestamp

### Hospital_Locations Table
- id: UUID (Primary Key)
- hospital_id: UUID (FK)
- address: Text
- city, state, postal_code: String
- lat, lng: Decimal

### Hospital_Infrastructure Table
- hospital_id: UUID (FK, Unique)
- icu_beds, general_beds, emergency_beds, ventilators, operating_rooms: Integer

### Hospital_Specialties Table
- hospital_id: UUID (FK)
- specialty_name: String

### Hospital_Documents Table
- id: UUID (Primary Key)
- hospital_id: UUID (FK)
- doc_type: Enum (LICENSE, CLINICAL_CERT, ACCREDITATION)
- file_url: String
- verification_status: Enum (PENDING, VERIFIED, FLAGGED)

### OTP_Tokens Table
- id: UUID (Primary Key)
- email: String
- otp: String
- expires_at: Timestamp
- created_at: Timestamp
- used: Boolean

## Configuration

### Database Setup
1. Create PostgreSQL database: `CREATE DATABASE pulsenet;`
2. Update credentials in `application.properties`

### Email Configuration
Update SMTP settings in `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### JWT Configuration
```properties
jwt.secret=mySecretKey123456789012345678901234567890
jwt.expiration=86400000
```

## Default Users

- **System Admin**: sysadmin@pulsenet.gov / adminpassword

## Running the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## Testing

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Send OTP
```bash
curl -X POST http://localhost:8080/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email": "test@hospital.com"}'
```

### System Admin Login
```bash
curl -X POST http://localhost:8080/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"identity": "sysadmin@pulsenet.gov", "password": "adminpassword"}'
```

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- OTP validation for hospital admin login
- Role-based access control
- CORS configuration
- File upload validation

## File Storage

Hospital documents are stored in `./uploads/hospitals/{hospitalId}/` directory.
For production, consider using cloud storage services like AWS S3.

## Technologies Used

- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (JSON Web Tokens)
- Lombok
- Jakarta Validation
- Spring Mail
