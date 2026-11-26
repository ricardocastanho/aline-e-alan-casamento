import { z } from "zod";

export const giftSeeds = [
  { name: "Cafezinho dos noivos", description: "Um café quentinho para começar mais um dia juntinhos.", price_cents: 3000, image_url: "/gifts/coffee.svg", sort_order: 1 },
  { name: "Café da manhã", description: "Uma manhã sem pressa, com carinho à mesa.", price_cents: 6000, image_url: "/gifts/breakfast.svg", sort_order: 2 },
  { name: "Rodada de drinks", description: "Um brinde aos novos capítulos da nossa história.", price_cents: 9000, image_url: "/gifts/drinks.svg", sort_order: 3 },
  { name: "Almoço de domingo", description: "Sabores e boas conversas em um domingo a dois.", price_cents: 15000, image_url: "/gifts/lunch.svg", sort_order: 4 },
  { name: "Jantar romântico", description: "Uma noite à luz de velas para celebrar o nosso amor.", price_cents: 25000, image_url: "/gifts/dinner.svg", sort_order: 5 },
  { name: "Day spa para os noivos", description: "Uma pausa de cuidado e tranquilidade para nós dois.", price_cents: 35000, image_url: "/gifts/spa.svg", sort_order: 6 },
  { name: "Passeio da lua de mel", description: "Novos lugares e lembranças que levaremos para sempre.", price_cents: 50000, image_url: "/gifts/excursion.svg", sort_order: 7 },
  { name: "Noite em hotel", description: "Um refúgio aconchegante para aproveitar a vida a dois.", price_cents: 70000, image_url: "/gifts/hotel.svg", sort_order: 8 },
  { name: "Jantar em restaurante renomado", description: "Uma experiência de sabores para uma noite inesquecível.", price_cents: 90000, image_url: "/gifts/restaurant.svg", sort_order: 9 },
  { name: "Experiência dos sonhos da lua de mel", description: "Um momento extraordinário no começo da nossa jornada.", price_cents: 120000, image_url: "/gifts/honeymoon.svg", sort_order: 10 },
];

export const giftSelectionSchema = z.object({
  guestId: z.string().uuid(),
  giftIds: z.array(z.string().uuid()).refine((ids) => new Set(ids).size === ids.length),
});

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function selectionTotal(items: { price_cents_at_selection: number }[]) {
  return items.reduce((total, item) => total + item.price_cents_at_selection, 0);
}