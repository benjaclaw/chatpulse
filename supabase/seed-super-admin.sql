-- Run AFTER creating the user via Supabase Auth (signup or dashboard)
-- Replace USER_ID with the actual UUID from auth.users

-- To find user ID after signup:
-- select id from auth.users where email = 'benjamin.bruaroy@gmail.com';

-- Then set as super admin:
-- update public.profiles set is_super_admin = true where email = 'benjamin.bruaroy@gmail.com';
