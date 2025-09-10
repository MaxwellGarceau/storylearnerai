-- Backfill and enforce NOT NULL on users.native_language
-- Ensure any existing NULL values are set to 'en'
UPDATE public.users SET native_language = 'en' WHERE native_language IS NULL;

-- Ensure default is 'en'
ALTER TABLE public.users ALTER COLUMN native_language SET DEFAULT 'en';

-- Enforce NOT NULL constraint
ALTER TABLE public.users ALTER COLUMN native_language SET NOT NULL;


