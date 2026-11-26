import { test } from "node:test";
import assert from "node:assert/strict";
import { giftSeeds, giftSelectionSchema, selectionTotal } from "./gifts";

const expectedPrices: [string, number][] = [
  ["Cafezinho dos noivos", 3000],
  ["Café da manhã", 6000],
  ["Rodada de drinks", 9000],
  ["Almoço de domingo", 15000],
  ["Jantar romântico", 25000],
  ["Day spa para os noivos", 35000],
  ["Passeio da lua de mel", 50000],
  ["Noite em hotel", 70000],
  ["Jantar em restaurante renomado", 90000],
  ["Experiência dos sonhos da lua de mel", 120000],
];

for (const [name, cents] of expectedPrices) {
  test(`${name} costs ${cents} cents`, () => assert.equal(giftSeeds.find((gift) => gift.name === name)?.price_cents, cents));
}

test("catalog has ten gifts in ascending price order", () => {
  assert.equal(giftSeeds.length, 10);
  assert.deepEqual(giftSeeds.map((gift) => gift.price_cents), [3000, 6000, 9000, 15000, 25000, 35000, 50000, 70000, 90000, 120000]);
});

const guestId = "11111111-1111-4111-8111-111111111111";
const giftId = "22222222-2222-4222-8222-222222222222";

test("duplicate gift identifiers are rejected", () => assert.equal(giftSelectionSchema.safeParse({ guestId, giftIds: [giftId, giftId] }).success, false));
test("invalid guest identifiers are rejected", () => assert.equal(giftSelectionSchema.safeParse({ guestId: "unknown", giftIds: [giftId] }).success, false));
test("skipping gifts accepts an empty selection", () => assert.equal(giftSelectionSchema.safeParse({ guestId, giftIds: [] }).success, true));
test("selection total uses stored price snapshots", () => assert.equal(selectionTotal([{ price_cents_at_selection: 3000 }, { price_cents_at_selection: 15000 }]), 18000));