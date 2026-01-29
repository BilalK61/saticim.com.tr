-- 1. Helper Function to generate a unique random 11-digit number
create or replace function public.generate_unique_listing_no() 
returns bigint as $$
declare
  new_no bigint;
  already_exists boolean;
begin
  loop
    -- Generate random number between 10,000,000,000 and 99,999,999,999
    new_no := floor(random() * (99999999999 - 10000000000 + 1) + 10000000000)::bigint;
    
    -- Check for collision
    select exists(select 1 from public.listings where listing_no = new_no) into already_exists;
    
    -- If unique, break loop
    if not already_exists then 
      exit;
    end if;
  end loop;
  
  return new_no;
end;
$$ language plpgsql;

-- 2. Add listing_no column (if not exists) without default value yet
alter table public.listings 
add column if not exists listing_no bigint unique;

-- Remove sequence default if it was added previously
alter table public.listings alter column listing_no drop default;

-- 3. Trigger Function
create or replace function public.set_listing_no()
returns trigger as $$
begin
  -- Assign random number if null
  if new.listing_no is null then
    new.listing_no := public.generate_unique_listing_no();
  end if;
  return new;
end;
$$ language plpgsql;

-- 4. Create/Replace Trigger
drop trigger if exists on_insert_listing_set_no on public.listings;

create trigger on_insert_listing_set_no
before insert on public.listings
for each row
execute procedure public.set_listing_no();

-- 5. Backfill existing listings
-- We can't use a simple update with a function call for all rows at once if the function isn't volatile enough or optimized? 
-- Actually, calling the function for each row in an update is fine.
update public.listings 
set listing_no = public.generate_unique_listing_no() 
where listing_no is null;

-- 6. Cleanup old sequence if existed
drop sequence if exists public.listing_no_seq;
