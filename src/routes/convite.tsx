import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";

export const Route = createFileRoute("/convite")({
  head: () => ({
    meta: [
      { title: "Aline & Alan — Nosso Convite" },
      { name: "description", content: "10 de Abril, 17:30 — Sede campestre do Clube Gaúcho." },
    ],
  }),
  component: Invite,
});

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: "easeOut" as const },
});

const rsvpPhoneNumber = "+55 (55) 99967-8631";
const rsvpMessage = "Olá! Gostaria de confirmar minha presença no casamento da Aline e do Alan! 💍";
const whatsappUrl = `https://wa.me/${rsvpPhoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
  rsvpMessage,
)}`;

function Leaves({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ transform: flip ? "scale(-1,-1)" : undefined }}
      aria-hidden
    >
      <g fill="none" stroke="oklch(0.72 0.13 80)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M10 10 Q 80 40 120 110" />
        <path d="M30 12 Q 50 30 55 55" />
        <path d="M55 55 q 8 -10 22 -10 q -4 14 -22 10 Z" fill="oklch(0.72 0.13 80 / 0.5)" />
        <path d="M70 75 q 10 -8 24 -6 q -6 14 -24 6 Z" fill="oklch(0.72 0.13 80 / 0.5)" />
        <path d="M90 95 q 12 -6 26 -2 q -8 14 -26 2 Z" fill="oklch(0.72 0.13 80 / 0.5)" />
        <path d="M40 35 q -10 -6 -22 -2 q 6 12 22 2 Z" fill="oklch(0.72 0.13 80 / 0.5)" />
        <path d="M55 55 q -10 -4 -22 2 q 8 12 22 -2 Z" fill="oklch(0.72 0.13 80 / 0.5)" />
      </g>
    </svg>
  );
}

function Invite() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "oklch(0.86 0.025 80)" }}
    >
      <motion.article
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-paper text-foreground shadow-2xl rounded-sm overflow-hidden"
        style={{
          background:
            "repeating-linear-gradient(0deg, oklch(0.96 0.018 85) 0px, oklch(0.955 0.02 85) 2px, oklch(0.96 0.018 85) 4px)",
          boxShadow: "0 30px 80px -20px oklch(0.3 0.05 50 / 0.35)",
        }}
      >
        <Leaves className="absolute -top-2 -left-2 w-40 opacity-90" />
        <Leaves className="absolute -bottom-2 -right-2 w-40 opacity-90" flip />

        <div className="px-8 sm:px-14 py-12 sm:py-16 text-center">
          <motion.p {...fade(0.1)} className="text-base sm:text-lg italic text-primary/90">
            Com a bênção de seus pais
          </motion.p>

          <motion.div
            {...fade(0.25)}
            className="mt-6 grid grid-cols-2 gap-6 text-sm sm:text-base italic text-primary/90"
          >
            <div className="text-left sm:text-center">
              <p>Darci Pettenon</p>
              <p>Elair Pires Barbosa</p>
            </div>
            <div className="text-right sm:text-center">
              <p>Alex Martins Antunes</p>
              <p>Michele Braga de Oliveira</p>
            </div>
          </motion.div>

          <motion.h1
            {...fade(0.4)}
            className="mt-10 sm:mt-14 text-6xl sm:text-8xl text-primary leading-none"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Aline <span className="italic font-light">e </span> Alan
          </motion.h1>

          <motion.p
            {...fade(0.6)}
            className="mt-10 sm:mt-14 text-base sm:text-lg text-primary/90 max-w-md mx-auto"
          >
            convidam para o seu casamento, que irá se realizar na
            <br />
            Sede campestre do Clube Gaúcho, no dia
          </motion.p>

          <motion.h2
            {...fade(0.75)}
            className="mt-6 text-2xl sm:text-4xl font-semibold tracking-wider text-primary"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            10 DE ABRIL, 17:30 HORAS
          </motion.h2>

          <motion.p {...fade(0.9)} className="mt-6 italic text-primary/85 text-base sm:text-lg">
            Venha celebrar nosso amor e fazer parte da nossa história
          </motion.p>

          <motion.div
            {...fade(1.05)}
            className="mt-12 grid sm:grid-cols-2 gap-8 text-left text-sm sm:text-base"
          >
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Confirme</p>
                <p>sua presença até</p>
                <p>10 de fevereiro de 2027</p>
                <p className="mt-2">
                  No contato:{" "}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Confirmar presença pelo WhatsApp no número ${rsvpPhoneNumber}`}
                    className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary/80 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  >
                    {rsvpPhoneNumber}
                  </a>{" "}
                  - Lauren
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Localização</p>
                <p>Sede campestre</p>
                <p>do Clube Gaúcho</p>
                <p>- Salão Querência</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fade(1.25)} className="mt-12">
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.3em] text-primary/70 hover:text-primary transition-colors"
            >
              ← voltar
            </Link>
          </motion.div>
        </div>
      </motion.article>
    </main>
  );
}
