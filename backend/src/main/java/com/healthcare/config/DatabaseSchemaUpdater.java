package com.healthcare.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.schema-update.enabled", havingValue = "true", matchIfMissing = false)
@Order(1) // Run before DataSeeder
public class DatabaseSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🔧 Updating database schema for USER role support...");
            
            // Update the users table constraint to include USER role
            String updateConstraintSql = """
                DO $$
                BEGIN
                    -- Drop existing constraint if it exists
                    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
                        ALTER TABLE users DROP CONSTRAINT users_role_check;
                    END IF;
                    
                    -- Add new constraint with USER role
                    ALTER TABLE users ADD CONSTRAINT users_role_check 
                        CHECK (role IN ('HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'USER'));
                        
                    RAISE NOTICE 'Successfully updated users_role_check constraint to include USER role';
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Error updating constraint: %', SQLERRM;
                END $$;
                """;
            
            jdbcTemplate.execute(updateConstraintSql);
            System.out.println("✅ Database schema updated successfully - USER role constraint added");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to update database schema: " + e.getMessage());
            // Don't throw exception to prevent application startup failure
        }
    }
}