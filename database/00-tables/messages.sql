CREATE TABLE IF NOT EXISTS public.messages (
    id serial NOT NULL,
    guild_id text NOT NULL,
    guild_name text,
    channel_id text NOT NULL,
    channel_name text,
    user_id text NOT NULL,
    user_name text,
    message_id text NOT NULL,
    message text NOT NULL,
    action text NOT NULL,
    is_bot BOOLEAN NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
);
