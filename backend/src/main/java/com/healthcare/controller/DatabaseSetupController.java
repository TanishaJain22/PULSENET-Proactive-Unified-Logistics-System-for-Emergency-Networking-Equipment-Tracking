package com.healthcare.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DatabaseSetupController {

    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/drop-user-role-constraint")
    public ResponseEntity<?> dropUserRoleConstraint() {
        try {
            System.out.println("🗑️ Dropping existing user role constraint...");
            
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT users_role_check");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Constraint dropped successfully");
            
            System.out.println("✅ Constraint dropped successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to drop constraint: " + e.getMessage());
            
            System.err.println("❌ Failed to drop constraint: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/add-user-role-constraint")
    public ResponseEntity<?> addUserRoleConstraint() {
        try {
            System.out.println("➕ Adding new user role constraint...");
            
            jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'USER'))");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Constraint added successfully");
            
            System.out.println("✅ Constraint added successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to add constraint: " + e.getMessage());
            
            System.err.println("❌ Failed to add constraint: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/check-user-role-constraint")
    public ResponseEntity<?> checkUserRoleConstraint() {
        try {
            String checkConstraintSql = """
                SELECT conname, pg_get_constraintdef(oid) as definition
                FROM pg_constraint 
                WHERE conname = 'users_role_check'
                """;
            
            try {
                Map<String, Object> result = jdbcTemplate.queryForMap(checkConstraintSql);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("constraint", result);
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                // If constraint doesn't exist, return empty result
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("constraint", null);
                response.put("message", "Constraint not found or error: " + e.getMessage());
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to check constraint: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/update-resource-type-constraint")
    public ResponseEntity<?> updateResourceTypeConstraint() {
        try {
            System.out.println("🔄 Updating resource type constraint...");
            
            // First, drop the existing constraint
            jdbcTemplate.execute("ALTER TABLE hospital_resources DROP CONSTRAINT IF EXISTS hospital_resources_type_check");
            System.out.println("✅ Dropped existing constraint");
            
            // Add the new constraint with updated enum values
            String newConstraint = """
                ALTER TABLE hospital_resources ADD CONSTRAINT hospital_resources_type_check 
                CHECK (type IN (
                    'EQUIPMENT', 'SUPPLY', 'STAFF',
                    'MEDICAL_EQUIPMENT', 'ICU_BED', 'GENERAL_BED', 'EMERGENCY_BED', 'OPERATING_ROOM',
                    'VENTILATOR', 'DEFIBRILLATOR', 'DIALYSIS_MACHINE', 'CT_SCANNER', 'MRI_MACHINE', 
                    'X_RAY_MACHINE', 'ULTRASOUND', 'MEDICAL_SUPPLY', 'PHARMACEUTICAL', 'BLOOD_PRODUCT', 
                    'SURGICAL_INSTRUMENT', 'NURSING_STAFF', 'SUPPORT_STAFF', 'TECHNICIAN', 
                    'AMBULANCE', 'WHEELCHAIR', 'OXYGEN_SUPPLY', 'OTHER'
                ))
                """;
            
            jdbcTemplate.execute(newConstraint);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resource type constraint updated successfully");
            
            System.out.println("✅ Resource type constraint updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update resource type constraint: " + e.getMessage());
            
            System.err.println("❌ Failed to update resource type constraint: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/check-resource-type-constraint")
    public ResponseEntity<?> checkResourceTypeConstraint() {
        try {
            String checkConstraintSql = """
                SELECT conname, pg_get_constraintdef(oid) as definition
                FROM pg_constraint 
                WHERE conname = 'hospital_resources_type_check'
                """;
            
            try {
                Map<String, Object> result = jdbcTemplate.queryForMap(checkConstraintSql);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("constraint", result);
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                // If constraint doesn't exist, return empty result
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("constraint", null);
                response.put("message", "Constraint not found or error: " + e.getMessage());
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to check resource type constraint: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}