create table user_profiles (
  id uuid references auth.users primary key,
  email text,
  country text,
  city text,
  created_at timestamp default now(),
  last_login timestamp default now()
);
