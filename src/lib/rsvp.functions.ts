import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rsvpSchema, sanitizeName, maxNameLength } from "@/lib/rsvp";

export const saveRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("save_rsvp", {
      _guest_name: data.guestName,
      _guest_confirmed: data.guestConfirmed,
      _companions: data.companions,
    });
    if (error) {
      console.error("save_rsvp failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });

export const getRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ guestName: z.string().transform(sanitizeName).pipe(z.string().min(1).max(maxNameLength)) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_rsvp", { _guest_name: data.guestName });
    if (error) return { ok: false as const, rows: [] };
    return { ok: true as const, rows: rows ?? [] };
  });
