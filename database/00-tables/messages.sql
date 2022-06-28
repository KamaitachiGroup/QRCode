CREATE TABLE IF NOT EXISTS public.messages (
    id serial NOT NULL,
    guild_id text NOT NULL,
    guild_name text,
    channel_id text NOT NULL,
    channel_name text,
    author_id text NOT NULL,
    author_name text,
    message_id text NOT NULL,
    message text NOT NULL,
    action text NOT NULL,
    is_bot BOOLEAN NOT NULL,
    actor_id text,
    actor_name text,
    entry_date timestamp NOT NULL DEFAULT now()
);
