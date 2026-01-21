-- Bu SQL komutunu Supabase SQL Editöründe çalıştırın.
-- Bu komut, yeni üye kayıtlarında kullanıcı adının "profiles" tablosuna otomatik aktarılmasını sağlar.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.email, -- Email'i de kaydedelim
    new.raw_user_meta_data->>'username', -- Kullanıcı adını metadata'dan al
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;
