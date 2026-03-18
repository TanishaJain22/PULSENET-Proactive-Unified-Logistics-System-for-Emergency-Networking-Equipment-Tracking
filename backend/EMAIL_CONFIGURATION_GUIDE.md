# 📧 Email Configuration Guide for PulseNet

## 🚨 **Current Issue**
Your application is trying to connect to `localhost:1025` which is a mock SMTP server that doesn't exist. This causes the OTP email sending to fail.

## ✅ **Solution: Configure Gmail SMTP**

### **Step 1: Update application.properties**

Replace the current email configuration with:

```properties
# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

### **Step 2: Generate Gmail App Password**

1. **Go to Google Account Settings**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (required for app passwords)
3. **Go to Security** → **2-Step Verification** → **App passwords**
4. **Generate App Password**:
   - Select "Mail" as the app
   - Select "Other" as the device
   - Enter "PulseNet Backend" as the name
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### **Step 3: Update Configuration**

Replace in `application.properties`:
```properties
spring.mail.username=shubhsharma23nov@gmail.com
spring.mail.password=your-16-character-app-password
```

## 🔧 **Alternative Email Providers**

### **Option 1: Outlook/Hotmail SMTP**
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### **Option 2: Yahoo SMTP**
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=your-email@yahoo.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### **Option 3: SendGrid (Professional)**
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=your-sendgrid-api-key
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## 🧪 **For Development/Testing Only**

### **Option 1: MailHog (Local Testing)**
1. **Install MailHog**: `brew install mailhog` (macOS) or download from GitHub
2. **Start MailHog**: `mailhog`
3. **Configure**:
```properties
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.username=
spring.mail.password=
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false
```
4. **View emails**: http://localhost:8025

### **Option 2: Mailtrap (Online Testing)**
1. **Sign up**: https://mailtrap.io/
2. **Get SMTP credentials** from your inbox
3. **Configure**:
```properties
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=your-mailtrap-username
spring.mail.password=your-mailtrap-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## 🔒 **Security Best Practices**

### **1. Use Environment Variables**
Instead of hardcoding credentials, use environment variables:

```properties
spring.mail.username=${EMAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:your-app-password}
```

### **2. Create application-dev.properties**
For development environment:
```properties
# Development Email Configuration
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false
```

### **3. Create application-prod.properties**
For production environment:
```properties
# Production Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

## 🚀 **Quick Fix for Demo**

**For immediate testing**, update your `application.properties`:

```properties
# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=shubhsharma23nov@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

## 🧪 **Testing Email Configuration**

### **Test Endpoint**
Create a test endpoint to verify email configuration:

```java
@RestController
@RequestMapping("/api/test")
public class EmailTestController {
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/email")
    public ResponseEntity<String> testEmail(@RequestParam String email) {
        try {
            emailService.sendOtp(email, "123456");
            return ResponseEntity.ok("Email sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Email failed: " + e.getMessage());
        }
    }
}
```

### **Test with cURL**
```bash
curl -X POST "http://localhost:8080/api/test/email?email=test@example.com"
```

## 📋 **Troubleshooting**

### **Common Issues:**

1. **"Authentication failed"**
   - Ensure 2FA is enabled on Gmail
   - Use App Password, not regular password
   - Check username/password are correct

2. **"Connection timeout"**
   - Check firewall settings
   - Verify SMTP host and port
   - Ensure internet connection

3. **"SSL/TLS errors"**
   - Add `spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com`
   - Verify STARTTLS is enabled

4. **"Less secure app access"**
   - Gmail no longer supports this
   - Must use App Passwords with 2FA

## 🎯 **Recommended Configuration for PulseNet**

```properties
# Email Configuration (Production Ready)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME:shubhsharma23nov@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
```

## 🔄 **After Configuration**

1. **Restart your Spring Boot application**
2. **Test OTP sending** through your registration/login flow
3. **Check email inbox** for OTP emails
4. **Monitor application logs** for any remaining errors

---

**Note**: The fallback OTP display in logs (`📧 OTP for shubhsharma23nov@gmail.com (fallback): 391720`) is working correctly as a backup when email fails. Once you configure SMTP properly, emails will be sent successfully.