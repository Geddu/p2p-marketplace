-- Check all invites
SELECT code, status, created_at, expires_at
FROM invites
ORDER BY created_at DESC; 