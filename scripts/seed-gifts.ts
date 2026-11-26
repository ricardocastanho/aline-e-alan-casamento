import { giftSeeds } from "../src/lib/gifts";

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const rows = giftSeeds.map((gift) => `(${quote(gift.name)}, ${quote(gift.description)}, ${gift.price_cents}, ${quote(gift.image_url)}, ${gift.sort_order})`);
console.log(`INSERT INTO public.gifts (name, description, price_cents, image_url, sort_order) VALUES\n${rows.join(",\n")}\nON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, price_cents = EXCLUDED.price_cents, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order;`);