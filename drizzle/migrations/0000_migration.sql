CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL,
  is_companion boolean NOT NULL DEFAULT false,
  confirmed boolean NOT NULL DEFAULT false,
  host_guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX guests_main_unique ON public.guests (normalized_name) WHERE host_guest_id IS NULL;
CREATE UNIQUE INDEX guests_companion_unique ON public.guests (host_guest_id, normalized_name) WHERE host_guest_id IS NOT NULL;

GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.normalize_guest_name(_name text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT lower(regexp_replace(trim(extensions.unaccent('extensions.unaccent'::regdictionary, _name)), '\s+', ' ', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.save_rsvp(_guest_name text, _guest_confirmed boolean, _companions jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _host_id uuid;
  _item jsonb;
BEGIN
  INSERT INTO public.guests (name, normalized_name, is_companion, confirmed)
  VALUES (_guest_name, public.normalize_guest_name(_guest_name), false, _guest_confirmed)
  ON CONFLICT (normalized_name) WHERE host_guest_id IS NULL
  DO UPDATE SET name = EXCLUDED.name, confirmed = EXCLUDED.confirmed, updated_at = now()
  RETURNING id INTO _host_id;

  FOR _item IN SELECT * FROM jsonb_array_elements(_companions) LOOP
    INSERT INTO public.guests (name, normalized_name, is_companion, confirmed, host_guest_id)
    VALUES (_item->>'name', public.normalize_guest_name(_item->>'name'), true, (_item->>'confirmed')::boolean, _host_id)
    ON CONFLICT (host_guest_id, normalized_name) WHERE host_guest_id IS NOT NULL
    DO UPDATE SET name = EXCLUDED.name, confirmed = EXCLUDED.confirmed, updated_at = now();
  END LOOP;

  RETURN _host_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_rsvp(text, boolean, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_rsvp(text, boolean, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.get_rsvp(_guest_name text)
RETURNS TABLE (name text, is_companion boolean, confirmed boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT g.name, g.is_companion, g.confirmed FROM public.guests g
  WHERE g.host_guest_id IS NULL AND g.normalized_name = public.normalize_guest_name(_guest_name)
  UNION ALL
  SELECT c.name, c.is_companion, c.confirmed FROM public.guests c
  JOIN public.guests h ON h.id = c.host_guest_id
  WHERE h.host_guest_id IS NULL AND h.normalized_name = public.normalize_guest_name(_guest_name)
$$;

REVOKE ALL ON FUNCTION public.get_rsvp(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_rsvp(text) TO service_role;