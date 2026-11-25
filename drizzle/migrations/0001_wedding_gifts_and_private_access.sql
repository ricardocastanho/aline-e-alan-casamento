CREATE TABLE public.gifts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL UNIQUE,
 description text NOT NULL,
 price_cents integer NOT NULL CHECK (price_cents > 0),
 image_url text NOT NULL,
 sort_order integer NOT NULL,
 active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.gifts TO anon, authenticated;
GRANT ALL ON public.gifts TO service_role;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read active gifts" ON public.gifts FOR SELECT TO anon, authenticated USING (active);
CREATE TABLE public.gift_selections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
 gift_id uuid NOT NULL REFERENCES public.gifts(id),
 price_cents_at_selection integer NOT NULL CHECK (price_cents_at_selection > 0),
 payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (guest_id, gift_id)
);
GRANT ALL ON public.gift_selections TO service_role;
ALTER TABLE public.gift_selections ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.guest_gift_access (
 guest_id uuid PRIMARY KEY REFERENCES public.guests(id) ON DELETE CASCADE,
 token_hash text NOT NULL
);
GRANT ALL ON public.guest_gift_access TO service_role;
ALTER TABLE public.guest_gift_access ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.save_rsvp_with_gift_access(_guest_name text, _guest_confirmed boolean, _companions jsonb, _token_hash text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE _guest_id uuid; _existing_hash text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext(public.normalize_guest_name(_guest_name)));
 SELECT a.token_hash INTO _existing_hash FROM public.guest_gift_access a JOIN public.guests g ON g.id = a.guest_id WHERE g.host_guest_id IS NULL AND g.normalized_name = public.normalize_guest_name(_guest_name);
 IF _existing_hash IS NOT NULL AND _existing_hash <> _token_hash THEN RETURN NULL; END IF;
 _guest_id := public.save_rsvp(_guest_name, _guest_confirmed, _companions);
 INSERT INTO public.guest_gift_access (guest_id, token_hash) VALUES (_guest_id, _token_hash) ON CONFLICT (guest_id) DO NOTHING;
 RETURN _guest_id;
END;
$$;
REVOKE ALL ON FUNCTION public.save_rsvp_with_gift_access(text, boolean, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_rsvp_with_gift_access(text, boolean, jsonb, text) TO service_role;
CREATE OR REPLACE FUNCTION public.replace_gift_selections(_guest_id uuid, _token_hash text, _gift_ids uuid[])
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 PERFORM 1 FROM public.guest_gift_access WHERE guest_id = _guest_id AND token_hash = _token_hash FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF cardinality(_gift_ids) <> (SELECT count(DISTINCT x) FROM unnest(_gift_ids) x) THEN RETURN false; END IF;
 IF EXISTS (SELECT 1 FROM unnest(_gift_ids) x LEFT JOIN public.gifts g ON g.id = x AND g.active WHERE g.id IS NULL) THEN RETURN false; END IF;
 DELETE FROM public.gift_selections WHERE guest_id = _guest_id AND payment_status = 'pending' AND NOT (gift_id = ANY(_gift_ids));
 INSERT INTO public.gift_selections (guest_id, gift_id, price_cents_at_selection)
 SELECT _guest_id, id, price_cents FROM public.gifts WHERE id = ANY(_gift_ids) AND active
 ON CONFLICT (guest_id, gift_id) DO UPDATE SET price_cents_at_selection = EXCLUDED.price_cents_at_selection, payment_status = 'pending', updated_at = now() WHERE public.gift_selections.payment_status = 'cancelled';
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.replace_gift_selections(uuid, text, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_gift_selections(uuid, text, uuid[]) TO service_role;