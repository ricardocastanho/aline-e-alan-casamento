import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { Check, CheckCircle2, Gift, Heart, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney, selectionTotal } from "@/lib/gifts";
import { getGiftExperience, saveGiftSelection } from "@/lib/gifts.functions";

export const Route = createFileRoute("/success")({
  validateSearch: (search) => z.object({ guestId: z.string().uuid().optional().catch(undefined) }).parse(search),
  loaderDeps: ({ search }) => ({ guestId: search.guestId }),
  loader: async ({ deps }) => {
    if (!deps.guestId) throw redirect({ to: "/" });
    const result = await getGiftExperience({ data: { guestId: deps.guestId } });
    if (!result.ok && result.reason === "access") throw redirect({ to: "/" });
    return result;
  },
  head: () => ({ meta: [
    { title: "Aline & Alan — Obrigado pelo carinho" },
    { name: "description", content: "Uma resposta cheia de carinho e momentos especiais para Aline e Alan." },
    { property: "og:title", content: "Aline & Alan — Obrigado pelo carinho" },
    { property: "og:description", content: "Celebre conosco o começo da nossa história." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: GiftExperience,
});

function GiftExperience() {
  const result = Route.useLoaderData();
  const { guestId } = Route.useSearch();
  const router = useRouter();
  if (!result.ok || !guestId) return <main className="min-h-screen grid place-items-center px-6"><div className="text-center"><Heart className="mx-auto mb-4 text-primary" /><h1 className="text-3xl">Sua resposta foi registrada.</h1><p className="my-4">Não conseguimos carregar os presentes agora. Tente novamente em instantes.</p><Button onClick={() => router.invalidate()}>Tentar novamente</Button></div></main>;
  return <GiftPicker key={guestId} experience={result} guestId={guestId} />;
}

type Experience = Extract<Awaited<ReturnType<typeof getGiftExperience>>, { ok: true }>;

function GiftPicker({ experience, guestId }: { experience: Experience; guestId: string }) {
  const save = useServerFn(saveGiftSelection);
  const load = useServerFn(getGiftExperience);
  const [selected, setSelected] = useState(() => new Set(experience.selections.filter((item) => item.payment_status === "pending").map((item) => item.gift_id)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [savedItems, setSavedItems] = useState(experience.selections);
  const paidIds = new Set(experience.selections.filter((item) => item.payment_status === "paid").map((item) => item.gift_id));
  const selectedGifts = experience.gifts.filter((gift) => selected.has(gift.id));
  const getPrice = (id: string, price: number) => experience.selections.find((item) => item.gift_id === id && item.payment_status === "pending")?.price_cents_at_selection ?? price;
  const total = selectedGifts.reduce((sum, gift) => sum + getPrice(gift.id, gift.price_cents), 0);
  const attendees = [experience.guest, ...experience.companions].filter((person) => person.confirmed);

  const submit = async (skip = false) => {
    setSaving(true);
    setError("");
    try {
      const response = await save({ data: { guestId, giftIds: skip ? [] : [...selected] } });
      if (!response.ok) { setError("Não foi possível salvar os presentes. Tente novamente em instantes."); return; }
      const updated = await load({ data: { guestId } });
      if (!updated.ok) { setError("Não conseguimos conferir sua seleção. Tente novamente para confirmar."); return; }
      setSavedItems(updated.selections);
      if (skip) setSelected(new Set());
      setSkipped(skip);
      setFinished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setError("Não foi possível salvar os presentes. Tente novamente em instantes."); }
    finally { setSaving(false); }
  };

  const toggle = (id: string, checked: boolean) => {
    setSelected((previous) => { const next = new Set(previous); if (checked) next.add(id); else next.delete(id); return next; });
    setError("");
  };

  return <main className="gift-page min-h-screen bg-paper text-foreground">
    <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-primary/15 px-6 py-5">
      <p className="font-script text-3xl text-primary">Aline e Alan</p>
      <Button asChild variant="ghost" size="sm"><Link to="/convite" search={{ guest: experience.guest.name }}><ArrowLeft className="h-4 w-4" /> Convite</Link></Button>
    </header>
    {finished ? <section className="mx-auto max-w-xl px-6 py-16 text-center">
      <Heart className="mx-auto h-10 w-10 text-gold" />
      <h1 className="mt-6 font-script text-5xl text-primary">Obrigado pelo carinho!</h1>
      <p className="mt-6 text-xl">{skipped ? "Sua resposta já está registrada. Ter você em nossa história é o maior presente." : "Seus momentos especiais foram escolhidos. Cada gesto de carinho faz parte da nossa história."}</p>
      {savedItems.length > 0 && <div className="mt-8 border-y border-primary/20 py-6 text-left">
        <ul className="space-y-3">{savedItems.map((item) => <li key={item.gift_id} className="flex justify-between gap-4"><span>{item.gifts?.name ?? "Presente"}{item.payment_status === "paid" && " · Pago"}</span><span className="shrink-0">{formatMoney(item.price_cents_at_selection)}</span></li>)}</ul>
        <p className="mt-5 flex justify-between text-xl font-semibold"><span>Total escolhido</span><span>{formatMoney(selectionTotal(savedItems))}</span></p>
      </div>}
      {savedItems.some((item) => item.payment_status === "pending") && <p className="mt-5 text-muted-foreground">A seleção foi salva, mas nenhum pagamento foi realizado. A etapa de pagamento estará disponível em breve.</p>}
      <p className="mt-8 font-script text-3xl text-primary">Com amor, Aline e Alan</p>
      <Button variant="outline" className="mt-8" onClick={() => setFinished(false)}><Gift /> {skipped ? "Escolher um presente" : "Rever presentes"}</Button>
    </section> : <>
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-10 text-center sm:pt-14">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-3 text-sm uppercase text-muted-foreground">Resposta registrada</p>
        <h1 className="mt-4 font-script text-5xl leading-tight text-primary">Obrigado, {experience.guest.name}!</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg">{attendees.length > 0 ? "Mal podemos esperar para celebrar com você. Será ainda mais especial ter seu carinho por perto." : "Sentiremos sua falta no grande dia. Obrigado por nos avisar e por fazer parte da nossa história."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-base">
          {[experience.guest, ...experience.companions].map((person, index) => <p key={`${person.name}-${index}`} className="flex items-center gap-2">{person.confirmed && <Check className="h-4 w-4 text-primary" />}<span>{person.name} <span className="text-muted-foreground">· {person.confirmed ? "Confirmado" : "Não comparecerá"}</span></span></p>)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl border-t border-primary/15 px-6 pb-10 pt-9">
        <div className="mb-8 max-w-2xl"><p className="mb-2 text-sm uppercase text-muted-foreground">Um carinho a mais</p><h2 className="text-3xl font-medium sm:text-4xl">Presenteie momentos a dois</h2><p className="mt-3 text-lg text-muted-foreground">Se quiser, transforme seu carinho em um café, um brinde ou uma lembrança da nossa lua de mel. Presentear é totalmente opcional.</p></div>
        <div className="gift-layout">
          <div className="grid grid-cols-1 gap-5 min-[380px]:grid-cols-2">
            {experience.gifts.map((gift) => {
              const chosen = selected.has(gift.id);
              const paid = paidIds.has(gift.id);
              return <article key={gift.id} className={`overflow-hidden rounded-md border bg-card transition-colors ${chosen || paid ? "border-primary ring-1 ring-primary" : "border-primary/20"}`}>
                <label htmlFor={`gift-${gift.id}`} className="relative block cursor-pointer">
                  <GiftImage url={gift.image_url} name={gift.name} />
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper"><Checkbox id={`gift-${gift.id}`} aria-label={gift.name} checked={chosen || paid} disabled={saving || paid} onCheckedChange={(checked) => toggle(gift.id, checked === true)} /></span>
                  {[5, 6].includes(gift.sort_order) && <span className="absolute bottom-3 left-3 rounded-sm bg-primary px-2.5 py-1 text-xs text-primary-foreground">Mais escolhido</span>}
                </label>
                <div className="px-4 pb-5 pt-4"><label htmlFor={`gift-${gift.id}`} className="cursor-pointer text-xl font-semibold leading-snug">{gift.name}</label><p className="mt-2 min-h-16 text-base leading-snug text-muted-foreground">{gift.description}</p><p className="mt-4 text-xl font-semibold text-primary">{formatMoney(getPrice(gift.id, gift.price_cents))}{paid && <span className="ml-2 text-sm font-normal">Pago</span>}</p></div>
              </article>;
            })}
          </div>
          <aside className="gift-summary self-start border-t border-primary/20 bg-paper p-5 lg:border-t-0 lg:border-l lg:pl-7" aria-label="Resumo dos presentes">
            <h3 className="flex items-center gap-2 text-xl font-semibold"><Gift className="h-5 w-5" /> Seu carinho para os noivos</h3>
            {selectedGifts.length > 0 ? <ul className="gift-summary-items my-4 space-y-2 text-sm">{selectedGifts.map((gift) => <li key={gift.id} className="flex justify-between gap-3"><span>{gift.name}</span><span className="shrink-0">{formatMoney(getPrice(gift.id, gift.price_cents))}</span></li>)}</ul> : <p className="my-3 text-sm text-muted-foreground">Nenhum presente selecionado</p>}
            <p className="mb-4 flex justify-between border-t border-primary/15 pt-3 text-xl font-semibold" aria-live="polite"><span>Total</span><span>{formatMoney(total)}</span></p>
            <Button className="h-11 w-full" disabled={saving || selected.size === 0} onClick={() => submit()}>{saving ? <Loader2 className="animate-spin" /> : <Heart />} {saving ? "Salvando..." : "Presentear os noivos"}</Button>
            <Button variant="link" className="mt-1 w-full text-muted-foreground" disabled={saving} onClick={() => submit(true)}>Agora não</Button>
            <p className="text-center text-xs text-muted-foreground">Seleção sem cobrança. Pagamento em uma próxima etapa.</p>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          </aside>
        </div>
      </section>
    </>}
  </main>;
}

function GiftImage({ url, name }: { url: string; name: string }) {
  const [broken, setBroken] = useState(false);
  return broken ? <div className="flex aspect-[4/3] items-center justify-center bg-secondary" role="img" aria-label={name}><Gift className="h-12 w-12 text-primary/50" /></div> : <img src={url} alt={name} width={640} height={480} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" onError={() => setBroken(true)} />;
}