import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRsvp, saveRsvp } from "@/lib/rsvp.functions";

type Person = { name: string; confirmed: boolean };

export function RsvpSection({ guestName, companions }: { guestName: string; companions: string[] }) {
  const save = useServerFn(saveRsvp);
  const load = useServerFn(getRsvp);
  const [open, setOpen] = useState(false);
  const [guest, setGuest] = useState<Person>({ name: guestName, confirmed: true });
  const [people, setPeople] = useState<Person[]>(companions.map((name) => ({ name, confirmed: true })));
  const [registered, setRegistered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    load({ data: { guestName } })
      .then((result) => {
        if (!active || !result.ok || result.rows.length === 0) return;
        const host = result.rows.find((row) => !row.is_companion);
        if (!host) return;
        setRegistered(true);
        setGuest({ name: guestName, confirmed: host.confirmed });
        const saved = new Map(
          result.rows.filter((row) => row.is_companion).map((row) => [row.name.toLowerCase(), row.confirmed]),
        );
        setPeople(
          companions.map((name) => ({ name, confirmed: saved.get(name.toLowerCase()) ?? true })),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [guestName, companions, load]);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const result = await save({
        data: { guestName, guestConfirmed: guest.confirmed, companions: people },
      });
      if (!result.ok) throw new Error("failed");
      setRegistered(true);
      setSuccess(true);
    } catch {
      setError("Não foi possível salvar sua resposta. Tente novamente em instantes.");
    } finally {
      setSaving(false);
    }
  };

  const openDialog = () => {
    setSuccess(false);
    setError("");
    setOpen(true);
  };

  const anyoneAttending = guest.confirmed || people.some((person) => person.confirmed);

  return (
    <div className="mt-12 flex flex-col items-center gap-3">
      {registered && (
        <p className="flex items-center gap-2 text-sm italic text-primary/85">
          <CheckCircle2 className="h-4 w-4" /> Resposta registrada
        </p>
      )}
      <Button
        onClick={openDialog}
        size="lg"
        variant={registered ? "outline" : "default"}
        className="w-full max-w-xs rounded-full tracking-[0.2em] uppercase text-xs sm:text-sm h-12"
      >
        {registered ? "Editar resposta" : "Confirmar presença"}
      </Button>

      <Dialog open={open} onOpenChange={(value) => !saving && setOpen(value)}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md bg-paper rounded-md">
          {success ? (
            <div className="py-6 text-center">
              <Heart className="mx-auto h-10 w-10 text-primary" />
              <DialogTitle
                className="mt-4 text-4xl text-primary font-normal"
                style={{ fontFamily: "var(--font-script)" }}
              >
                Obrigado!
              </DialogTitle>
              <DialogDescription className="mt-3 text-base text-primary/85">
                {anyoneAttending
                  ? "Sua presença foi registrada. Mal podemos esperar para celebrar com você!"
                  : "Sentiremos sua falta! Obrigado por nos avisar."}
              </DialogDescription>
              <Button className="mt-6 rounded-full" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle
                  className="text-3xl text-primary font-normal text-center"
                  style={{ fontFamily: "var(--font-script)" }}
                >
                  Confirmar presença
                </DialogTitle>
                <DialogDescription className="text-center">
                  Marque quem estará conosco no grande dia.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 space-y-3">
                <PersonRow
                  id="rsvp-guest"
                  person={guest}
                  label="Eu vou comparecer"
                  onChange={(confirmed) => setGuest({ ...guest, confirmed })}
                />
                {people.length > 0 && (
                  <p className="pt-2 text-xs uppercase tracking-[0.25em] text-primary/70">Acompanhantes</p>
                )}
                {people.map((person, index) => (
                  <PersonRow
                    key={person.name}
                    id={`rsvp-companion-${index}`}
                    person={person}
                    label={person.confirmed ? "Vai comparecer" : "Não vai comparecer"}
                    onChange={(confirmed) =>
                      setPeople(people.map((item, i) => (i === index ? { ...item, confirmed } : item)))
                    }
                  />
                ))}
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive text-center">
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button onClick={submit} disabled={saving} className="w-full rounded-full h-11">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Salvando..." : "Enviar resposta"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PersonRow({
  id,
  person,
  label,
  onChange,
}: {
  id: string;
  person: Person;
  label: string;
  onChange: (confirmed: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-primary/20 px-4 py-3">
      <Checkbox id={id} checked={person.confirmed} onCheckedChange={(value) => onChange(value === true)} />
      <Label htmlFor={id} className="flex flex-col items-start gap-0.5 cursor-pointer">
        <span className="font-semibold text-foreground">{person.name}</span>
        <span className="text-xs font-normal text-muted-foreground">{label}</span>
      </Label>
    </div>
  );
}
