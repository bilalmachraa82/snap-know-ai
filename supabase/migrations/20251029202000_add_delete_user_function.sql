-- Function to delete user account and all associated data
-- This function will be called when a user wants to delete their account
-- Supabase's RLS and CASCADE will handle the cleanup of related data

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user from auth.users
  -- This will cascade delete all related data in:
  -- - public.profiles (due to ON DELETE CASCADE)
  -- - public.meals (due to ON DELETE CASCADE)
  -- - public.user_goals (due to ON DELETE CASCADE)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
