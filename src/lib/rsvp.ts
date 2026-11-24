import { z } from "zod";

export const maxCompanions = 10;
export const maxNameLength = 100;

export function sanitizeName(value: string) {
  return value
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxNameLength);
}

export function parseCompanions(value: string | undefined) {
  if (!value) return [];
  const seen = new Set<string>();
  return value
    .split(",")
    .map(sanitizeName)
    .filter((name) => {
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxCompanions);
}

const nameSchema = z.string().transform(sanitizeName).pipe(z.string().min(1).max(maxNameLength));

export const rsvpSchema = z.object({
  guestName: nameSchema,
  guestConfirmed: z.boolean(),
  companions: z
    .array(z.object({ name: nameSchema, confirmed: z.boolean() }))
    .max(maxCompanions),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
