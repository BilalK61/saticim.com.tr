-- 1. Create Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- 'system', 'listing', 'price', 'message', 'security'
  title text not null,
  message text not null,
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.notifications enable row level security;

-- 3. Create Policies
-- View own notifications
create policy "Users can view their own notifications" 
on public.notifications for select 
using (auth.uid() = user_id);

-- Update own notifications (mark as read)
create policy "Users can update their own notifications" 
on public.notifications for update 
using (auth.uid() = user_id);

-- Insert notifications (needed for Login alerts from client-side or other interactions)
create policy "Users can insert notifications" 
on public.notifications for insert 
with check (auth.uid() = user_id);

-- 4. Trigger: Welcome Notification (on new user profile creation)
create or replace function public.handle_new_user_notification() 
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, message, link)
  values (
    new.id,
    'system',
    'Hoş geldiniz!',
    'Hesabınız başarıyla oluşturuldu. Aramıza katıldığınız için teşekkür ederiz.',
    '/profil'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists to avoid conflicts
drop trigger if exists on_auth_user_created_notification on public.profiles;

create trigger on_auth_user_created_notification
  after insert on public.profiles
  for each row
  execute procedure public.handle_new_user_notification();


-- 5. Trigger: New Message Notification
create or replace function public.handle_new_message_notification() 
returns trigger as $$
declare
  sender_name text;
begin
  -- Get sender name
  select coalesce(full_name, username, 'Bir kullanıcı') into sender_name
  from public.profiles
  where id = new.sender_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (
    new.recipient_id,
    'message',
    'Yeni Mesaj',
    sender_name || ' size bir mesaj gönderdi.',
    '/mesajlar?conversationId=' || new.conversation_id
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_new_message_notification on public.messages;

create trigger on_new_message_notification
  after insert on public.messages
  for each row
  execute procedure public.handle_new_message_notification();


-- 6. Trigger: Price Drop Notification
create or replace function public.handle_price_drop_notification() 
returns trigger as $$
begin
  -- Only run if price has decreased
  if new.price < old.price then
    -- Insert notification for all users who favorited this listing
    insert into public.notifications (user_id, type, title, message, link)
    select 
      f.user_id,
      'price',
      'Fiyat İndirimi 🔔',
      'Favori ilanınızda (' || new.title || ') fiyat düştü! Yeni fiyat: ' || new.price,
      '/ilan/' || new.id
    from public.favorites f
    where f.listing_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_listing_price_change_notification on public.listings;

create trigger on_listing_price_change_notification
  after update of price on public.listings
  for each row
  execute procedure public.handle_price_drop_notification();
