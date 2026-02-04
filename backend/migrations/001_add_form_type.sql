-- PHASE-1 Database Migration Script
-- Purpose: Add form_type column to user_feedback table
-- Date: February 3, 2026
-- Version: 1.0

-- Step 1: Add form_type column (if not exists)
ALTER TABLE user_feedback 
ADD COLUMN IF NOT EXISTS form_type ENUM(
    'ticket_closure',
    'customer_satisfaction',
    'cutomer_feedback',
    'churn_feedback',
    'relocation_feedback'
) NOT NULL DEFAULT 'ticket_closure' AFTER order_id;

-- Step 2: Add index for form_type (for faster queries)
CREATE INDEX IF NOT EXISTS idx_form_type ON user_feedback(form_type);

-- Step 3: Add composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_form_submitted 
ON user_feedback(form_type, feedback_submitted_at);

-- Step 4: Update existing records to have default form_type (if any)
UPDATE user_feedback 
SET form_type = 'ticket_closure' 
WHERE form_type IS NULL;

-- Step 5: Verify migration
SELECT 
    'Migration Complete' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN form_type IS NOT NULL THEN 1 END) as records_with_form_type,
    COUNT(CASE WHEN form_type = 'ticket_closure' THEN 1 END) as ticket_closure_count
FROM user_feedback;

-- Step 6: Show column structure (for verification)
DESCRIBE user_feedback;

-- Rollback script (if needed - use with caution)
-- ALTER TABLE user_feedback DROP COLUMN form_type;
-- DROP INDEX idx_form_type ON user_feedback;
-- DROP INDEX idx_form_submitted ON user_feedback;
