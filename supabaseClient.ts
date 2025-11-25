import { createClient } from '@supabase/supabase-js';

// NOTE: In a real deployment, these should be environment variables.
// For the purpose of this code generation, we assume they are available via process.env 
// or the user must replace them.

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* 
  Expected SQL Schema for this app to function:

  create table books (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    title text not null,
    isbn text,
    cover_url text,
    status text check (status in ('unread', 'reading', 'finished')),
    
    total_pages int,
    current_page int,
    
    rating int,
    review text,
    reminder_frequency text,
    reminder_time text,
    reminder_enabled boolean default false,
    created_at timestamptz default now()
  );

  -- Enable RLS
  alter table books enable row level security;
  create policy "Users can see their own books" on books for select using (auth.uid() = user_id);
  create policy "Users can insert their own books" on books for insert with check (auth.uid() = user_id);
  create policy "Users can update their own books" on books for update using (auth.uid() = user_id);
  create policy "Users can delete their own books" on books for delete using (auth.uid() = user_id);
  
  -- Storage Bucket 'covers' needs to be created and public readable.
*/