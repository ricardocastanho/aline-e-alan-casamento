# Wedding gift experience

## What changed

- `src/routes/success.tsx`: personalized RSVP summary, optional gift catalog, running total, skip action, and final thank-you.
- `src/components/RsvpSection.tsx` and `src/lib/rsvp.functions.ts`: RSVP now returns the main guest identifier and opens the private gift page.
- `src/lib/gifts.ts`, `gifts.functions.ts`, and `gifts.server.ts`: gift prices, validation, private access, catalog loading, and selection saving.
- `drizzle/migrations/0001_wedding_gifts_and_private_access.sql`: gifts, selections, private access, and transactional saving.
- `scripts/seed-gifts.ts`: idempotent catalog seed generator. Run `bun scripts/seed-gifts.ts` to generate the catalog SQL; apply the output through the database data-change tool.
- `src/lib/gifts.test.ts`: fifteen tests for prices, ascending order, duplicate rejection, invalid identifiers, empty selections, and snapshot totals.

## Placeholder images

These ten local illustrations can be replaced with real photos:

| Gift | Placeholder |
| --- | --- |
| Cafezinho dos noivos | `public/gifts/coffee.svg` |
| Café da manhã | `public/gifts/breakfast.svg` |
| Rodada de drinks | `public/gifts/drinks.svg` |
| Almoço de domingo | `public/gifts/lunch.svg` |
| Jantar romântico | `public/gifts/dinner.svg` |
| Day spa para os noivos | `public/gifts/spa.svg` |
| Passeio da lua de mel | `public/gifts/excursion.svg` |
| Noite em hotel | `public/gifts/hotel.svg` |
| Jantar em restaurante renomado | `public/gifts/restaurant.svg` |
| Experiência dos sonhos da lua de mel | `public/gifts/honeymoon.svg` |

For photo replacements, add the photo under `public/gifts` and update the corresponding catalog `image_url`. Use a 4:3 image; a broken image automatically gets a neutral gift-symbol fallback.

## Test the complete flow

1. Open the home page and click the envelope seal.
2. Click **Confirmar presença**, enter a distinct test name, and send the RSVP. A personalized link can also provide the guest and companions.
3. Check the thank-you message and attendance summary. The gift catalog also appears when nobody is attending.
4. Select Cafezinho dos noivos and Almoço de domingo. The total should be **R$ 180,00**.
5. Click **Presentear os noivos**. The final screen confirms the gifts and explains that no payment has been made.
6. Reload the same success-page address in the same browser. The saved pending gifts should be selected.
7. Remove the coffee and save again. The total should be **R$ 150,00**, with no duplicate selection.
8. Click **Agora não**. Pending choices are cleared, without changing any paid gifts.
9. Open the success address in a separate private browser session. It should return to the home page without exposing the guest summary. Missing or invalid guest identifiers also return home.

The private browser cookie is required to revisit or edit an existing response. Copying a guest identifier to another browser does not grant access. Browser clearing or switching devices requires a future recovery flow; none is implemented in this release.

## Payment

No payment provider, checkout, or charge is implemented. Pending selections contain stored price snapshots and can be read by a future authorized payment flow. Paid selections cannot be removed or repriced by guest selection updates.

## Verification

- `bun test src/lib/gifts.test.ts`: 15 passing tests.
- Browser flow verified on mobile and desktop: envelope, RSVP, gifting, replacement, reload, private access, skipping, paid-row preservation, and gifting after declining attendance.
- Database reads verified the seeded catalog and saved gift/payment-state results.
- Temporary gift-flow test responses were removed after verification.